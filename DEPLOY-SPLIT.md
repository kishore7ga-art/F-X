# Deploying frontend and backend separately on Dokploy

## Read this first

This is a **Next.js app whose pages are React Server Components**. Their data
access is not an HTTP client you can point at another host — it is direct Prisma
calls that run *inside the render*. So "split the backend out" has two very
different meanings, and only one of them is a config change:

| | What it takes | What you get |
|---|---|---|
| **Split the deployment** (this doc) | A compose file and two env vars | Two containers, independent restarts/scaling/logs, one owns the schema |
| **Split the codebase** | Rewriting every page to fetch over HTTP instead of querying Prisma | Two deployable repos |

The second is a rewrite of the data layer, not a deployment task. `/api/v1/*`
is the seam to do it along when you want to — the browser already talks to the
editor over HTTP, so those calls move to another host by changing one variable.
Pages do not, yet.

---

## The two services

```
                    ┌──────────────┐
   browser ────────▶│   frontend   │  renders pages, proxies /api/* calls
                    └──────┬───────┘
                           │  http://backend:3000   (Docker DNS, private)
                    ┌──────▼───────┐
                    │   backend    │  owns migrations + seed, serves /api/*
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │      db      │  postgres, not published to the host
                    └──────────────┘
```

**How they find each other:** `backend` is a Docker service name, resolved by
Docker's DNS on the shared `xite` network. Never `localhost` — inside a
container that resolves to the container itself, which is the single most
common way this breaks.

**Who owns the schema:** the backend, and only the backend. The frontend runs
with `SKIP_MIGRATIONS=true` and `SEED_ON_START=false`. Two containers racing
`prisma migrate deploy` against one database is how you get a half-applied
schema.

---

## Dokploy setup

### 1. Create the service

Dokploy → **Create → Compose**, pointed at this repo.

| Field | Value |
|---|---|
| Repository | `kishore7ga-art/xite-F` |
| Branch | `main` |
| **Compose Path** | `./docker-compose.split.yml` |

### 2. Environment

```
SESSION_SECRET=<32+ random chars>
POSTGRES_PASSWORD=<strong random>
```

**Do not set `AUTH_DISABLED=true`.** It used to be listed here and it is not a
deployment setting — it removes authentication entirely, on both services. Every
visitor is treated as the owner of the oldest college, the session cookie is
never read, and the access-request → approval → activation flow is bypassed
completely.

Do **not** set `DATABASE_URL`. Compose builds it from `POSTGRES_PASSWORD`.
A `DATABASE_URL` pointing at `localhost` is the classic failure here — inside a
container there is no Postgres on localhost.

### 3. Domains

Add **one** domain, pointed at the **frontend**:

| Field | Value |
|---|---|
| Host | `xite.co.in` |
| Service Name | `frontend` |
| Container Port | `3000` |

The backend gets **no domain**. It is reachable only from inside the network,
which is the point of separating it.

### 4. Deploy

Watch the log for three things:

```
Container xite-db-1        Healthy
[start] applying migrations …            ← backend only
[start] SKIP_MIGRATIONS=true …           ← frontend only
```

If you see the migration line twice, the frontend is missing
`SKIP_MIGRATIONS=true`.

---

## Verifying it

```bash
curl https://xite.co.in/api/health
```

Expect `{"status":"ok","database":"connected","host":"db:5432"}`.

In the browser devtools **Network** tab, edit any section: you should see
`PATCH /api/v1/sections/<id>` returning `200`, and a matching line in the
**Console**:

```
[api] PATCH /api/v1/sections/abc123 → 200 (42ms)
```

Those did not exist before — the editor used Server Actions, which post an
opaque payload with no readable endpoint.

---

## Putting the backend on its own domain

Only worth it if something outside this app needs the API.

1. Dokploy → Domains → add `api.xite.co.in` → service `backend`, port `3000`.
2. Set on the **frontend**: `NEXT_PUBLIC_API_BASE_URL=https://api.xite.co.in`
3. The browser now calls the backend directly, so it is cross-origin. The API
   must return, for `https://xite.co.in` specifically (not `*`, which browsers
   reject alongside credentials):

```
Access-Control-Allow-Origin: https://xite.co.in
Access-Control-Allow-Credentials: true
```

4. The session cookie must be sendable cross-site: `SameSite=None; Secure`.
   Until that is changed in `src/lib/auth/session.ts`, every authenticated call
   from the browser to `api.xite.co.in` arrives signed out.

Leave `NEXT_PUBLIC_API_BASE_URL` unset for same-origin, and none of that
applies.

---

## Rolling back

Change **Compose Path** to `./docker-compose.yml` and redeploy. The database
volume is shared by name, so no data moves.
