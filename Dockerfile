# syntax=docker/dockerfile:1

# Node 22 (not the guide's 20): Next 16 requires >= 20.9 and Prisma 7 is
# better exercised on 22 LTS.
FROM node:22-alpine AS base
# Prisma's query engine needs OpenSSL; libc6-compat covers glibc-linked binaries.
RUN apk add --no-cache openssl libc6-compat

# ---- dependencies -----------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Dev dependencies are needed: the Prisma CLI runs at build AND at container
# start (`prisma migrate deploy`).
#
# --ignore-scripts because the `postinstall` hook runs `prisma generate`, and
# prisma/schema.prisma has not been copied at this layer. The builder stage
# below generates the client explicitly instead. (The hook exists for Nixpacks
# builds, which copy the whole source tree before installing.)
RUN npm ci --ignore-scripts

# ---- build ------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The Prisma client is gitignored and generated from schema.prisma at build
# time. `generate` never connects, so a placeholder URL satisfies the config
# loader; the real DATABASE_URL is injected at runtime by compose.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate

# NEXT_PUBLIC_* is inlined into the client bundle by `next build`, not read at
# runtime. Passing it only as a runtime `environment:` value means the browser
# never sees it: the code compiles to an empty base URL and every call falls
# back to same-origin, no matter what the dashboard says. It has to be present
# here, during the build, or not at all.
ARG NEXT_PUBLIC_API_BASE_URL=""
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ARG BUILD_VERSION="v2.6.0-dokploy-force-rebuild-settings-flexbox"
ENV BUILD_VERSION=$BUILD_VERSION

RUN npm run build

# ---- runtime ----------------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
# The whole tree, not just src/generated: the seed step in scripts/start.mjs
# runs prisma/seed.ts through tsx, which imports src/lib/db-pool and
# src/lib/sections/schemas at runtime.
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# Not dead weight in a runtime image: tsx reads the `@/*` path alias from here,
# and prisma/seed.ts reaches src/lib/sections/schemas, which imports by alias.
# Without it the seed dies on "Cannot find module '@/generated/prisma/enums'",
# and because seeding is deliberately non-fatal the app then serves a working
# site with an empty template gallery — no error, nothing to pick.
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# `npm start` is `node scripts/start.mjs`.
COPY --from=builder /app/scripts ./scripts

# Section image uploads are written here; compose mounts a volume over it so
# they survive redeploys.
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

USER nextjs
EXPOSE 3000

# `npm start` is `node scripts/start.mjs`: it applies pending migrations, seeds
# the reference data a fresh database needs (templates, variants, themes), then
# serves. Both steps are retried and non-fatal, so a slow database delays the
# first boot rather than crash-looping it.
CMD ["npm", "start"]
