# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
# Force fresh build context copy (invalidation timestamp: 2026-08-14T19:25:00Z)
COPY . .

# NEXT_PUBLIC_* is inlined by `next build` and is therefore a *build* input, not
# a runtime one. Setting one of these on the running container changes nothing —
# the bundle was compiled before the container existed. They are declared as
# build args so the deployment can override them, with the production value as
# the default so a plain `docker build` still produces a working image.
ARG NEXT_PUBLIC_API_BASE_URL="https://api.webxite.org"
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
# The platform root, as the browser sees it. `rootDomain()` is called from
# client components — the editor's share button among them — and there
# `process.env.ROOT_DOMAIN` is undefined however carefully it is set on the
# deployment, because Next inlines only the NEXT_PUBLIC_ prefix. Without this
# the share button runs on the PLATFORM_ROOT constant in host-routing.ts, which
# is the same value today and silently stops being it the day the domain moves.
ARG NEXT_PUBLIC_ROOT_DOMAIN="webxite.org"
ENV NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN
ARG BUILD_VERSION="v2.1.0-production-hardened"
ENV BUILD_VERSION=$BUILD_VERSION

RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts

RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]
