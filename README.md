# College Website Template Platform

Multi-tenant SaaS where a college picks a pre-built template, edits content,
theme and sections through forms, and publishes to its own URL. Not a
drag-and-drop builder — layout stays fixed per template.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · PostgreSQL 16 ·
Prisma 7 (with the `pg` driver adapter) · Zod

One codebase and one database serve every college.

## Architecture note

This is a **single full-stack Next.js app**, not a frontend/backend split.
Data access, mutations and auth all run server-side through Server Components,
Server Actions and route handlers. There is no separate API process, which is
why `docker-compose.yml` defines two services (`frontend`, `db`) rather than
three.

## Screens

| Route | Purpose |
|---|---|
| `/login`, `/signup` | Email + password auth, one college per account |
| `/templates` | Template gallery |
| `/templates/[id]` | Theme picker — live preview, palette + font packs |
| `/editor/[subdomain]` | Section editor — page tabs, reorder, swap design, edit content |
| `/site/[subdomain]` | The college's public site (published only) |

## Local development

```bash
npm install
cp .env.example .env          # then fill in real values
npx prisma migrate dev
npm run db:seed
npm run dev
```

Seed login: `admin@greenfield.edu.in` / `greenfield123`

## Section variant library

Designs are registered in `section_variants` and mapped to React components in
`src/components/sections/registry.tsx`. The editor's ↻ button cycles a section
through the variants of its type, changing only `variant_id` — content is never
touched, because every variant of a section type reads identical props.

Keys follow `{section_type}_{layout_descriptor}`. Adding a variant means: build
the component, register it, insert a `section_variants` row (see
`prisma/variants/*.sql`).

Designs adapted from third-party templates record their licence in
`src/lib/sections/attributions.ts`; required credits render in the site footer
only for colleges actually using that design.

## Database

The default `docker-compose.yml` brings up **its own Postgres container**, so
the stack boots with no external database account — leave `DATABASE_URL` unset
and it is built from `POSTGRES_PASSWORD`.

To use a **managed cloud Postgres** (Neon, Supabase, Railway, RDS …) instead,
run `docker-compose.cloud-db.yml` and point `DATABASE_URL` at it, keeping
`?sslmode=require`. A set `DATABASE_URL` always overrides the bundled database.

TLS, pool sizing and reconnection are handled in `src/lib/db-pool.ts`:

- TLS is enabled automatically for any non-local host, verified against the
  system CA store
- The pool is capped (`DATABASE_POOL_MAX`, default 10) so one container cannot
  exhaust a provider's connection limit
- `keepAlive` stops load balancers dropping idle sockets
- An `error` handler on idle clients means a recycled or dropped connection is
  discarded and replaced on the next query instead of crashing the process

## Deployment

Dokploy → Create → Compose, pointed at this repo. Set the variables from
`.env.example` in the Dokploy dashboard — never commit a real `.env`.

With the default `docker-compose.yml` (bundled Postgres) that is just two:

| Variable | Value |
|---|---|
| `SESSION_SECRET` | 32+ random chars (`openssl rand -base64 32`) |
| `POSTGRES_PASSWORD` | a strong random password |

Leave `DATABASE_URL` **unset** — compose builds it from `POSTGRES_PASSWORD`.
If it is set to an unfilled template placeholder, `scripts/start.mjs` ignores it
and uses the bundled database anyway, logging loudly; that rescue needs
`POSTGRES_PASSWORD`, so it does not apply to `docker-compose.cloud-db.yml`.
Never use `localhost` in a deployed `DATABASE_URL`: inside a container that
resolves to the container itself.

On container start, `scripts/start.mjs`:

1. applies pending migrations (`prisma migrate deploy`, retried with backoff)
2. seeds **reference data** — templates, section variants, palettes, font packs
   — which migrations do not create, so a fresh database has a populated
   template gallery rather than an empty one
3. starts the server

Both steps are idempotent and non-fatal: a slow database delays the first boot
instead of crash-looping it behind a 502, and `/api/health` reports why. The
seed runs with `SEED_DEMO_COLLEGE=false`, so the demo college and its
README-published login are never created on a deployed instance. Set
`SEED_ON_START=false` to skip seeding entirely.
