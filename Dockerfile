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
RUN npm run build

# ---- runtime ----------------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Section image uploads are written here; compose mounts a volume over it so
# they survive redeploys.
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

USER nextjs
EXPOSE 3000

# `npm start` is `prisma migrate deploy && next start`, so pending migrations
# are applied before serving and a fresh database is usable on first boot.
# `migrate deploy` is the non-interactive, production-safe command.
CMD ["npm", "start"]
