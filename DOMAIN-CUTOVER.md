# Domain cutover: the apex becomes the landing site

## What changed, in one line

The editor used to be `webxite.org`. It is now `app.webxite.org`, and the apex
serves the public landing site instead.

```
webxite.org            landing site       L-X repo         NEW deployment
app.webxite.org        editor             F-X (xite-F)     MOVED from apex
*.webxite.org          tenant sites       F-X (xite-F)     NEW binding
admin.webxite.org      admin panel        AD-X             unchanged
api.webxite.org        backend            B-X (xite-B)     unchanged
```

Nothing about the applications themselves changed — same routes, same API, same
auth model. What changed is which hostname each one answers on.

---

## The two things that break if you do them out of order

**1. `SESSION_COOKIE_DOMAIN` on xite-F.** This is the one that silently signs
everybody out.

`sessionCookieAttributes()` derives the cookie's `Domain` by checking whether
the API's host is a subdomain of the app's host. It was, when the app was the
apex: `api.webxite.org` ends with `.webxite.org`. Once `APP_URL` becomes
`https://app.webxite.org` it no longer does — `api.webxite.org` is a *sibling*
of `app.webxite.org`, not a child — and `sessionCookieScope` deliberately
refuses to guess a shared parent without the Public Suffix List. It falls back
to a host-only cookie, the backend keeps writing `.webxite.org`, and the two
services are writing two different cookies under one name.

The symptom is sign-in returning 200 and leaving you signed out.

So `SESSION_COOKIE_DOMAIN=.webxite.org` must be set on **xite-F** before or with
the `APP_URL` change. xite-B already has it. `cookie-domain.ts` documents this
variable as the escape hatch for exactly this topology.

**2. The wildcard DNS record, before the share button is used.** The editor's
"Copy link" now builds `https://<tenant>.webxite.org`. Until `*` resolves, that
link goes nowhere. It is also what `canonicalOrigin` has been putting in every
sitemap and canonical tag already — so the record fixes a pre-existing mismatch
as well as the new link.

---

## DNS records

At the DNS provider for `webxite.org`. The server is `200.141.5.86`, which is
what `webxite.org`, `admin` and `api` already point at.

| Type | Name | Value | Status |
|---|---|---|---|
| A | `@` | `200.141.5.86` | exists |
| A | `www` | `200.141.5.86` | exists — but has no certificate, see below |
| A | `admin` | `200.141.5.86` | exists |
| A | `api` | `200.141.5.86` | exists |
| A | `app` | `200.141.5.86` | **ADD** |
| A | `*` | `200.141.5.86` | **ADD** — tenant sites |

An explicit record always beats a wildcard, so `app`, `admin`, `api` and `www`
keep resolving to themselves once `*` exists. The wildcard only catches names
with no record of their own, which is exactly the tenant case.

`www.webxite.org` resolves today but serves an untrusted certificate — it was
never registered as a domain in Dokploy, so Let's Encrypt never issued for it.
Add it to the landing site's deployment alongside the apex.

---

## Dokploy

Nothing here can be done from the repository. There is no API token for this
Dokploy instance; every step is the dashboard.

### 1. Create the landing site

New application, from `kishore7ga-art/L-X`, branch `main`, Dockerfile build.
The repo now carries a `Dockerfile` (Node build → Nginx) and an `nginx.conf`.

- Domains: `webxite.org` and `www.webxite.org`
- Container port: `80`
- Certificate: Let's Encrypt
- Build arg (optional — `.env.production` already carries it):
  `VITE_APP_URL=https://app.webxite.org`

`VITE_*` is read at **build** time and compiled into the bundle. Setting it as a
runtime environment variable on the container does nothing at all.

### 2. Move the editor (XITE-F)

- Remove the domain `webxite.org`
- Add `app.webxite.org` — certificate: Let's Encrypt
- Add `*.webxite.org` — certificate: **DNS-01 wildcard**. HTTP-01 cannot issue a
  wildcard; if the provider does not support DNS-01 here, tenant sites will need
  per-domain certificates instead.

Do this only after the landing site is serving, or the apex goes dark in
between.

### 3. Environment variables

**XITE-F**

```
APP_URL=https://app.webxite.org          # was https://webxite.org
SESSION_COOKIE_DOMAIN=.webxite.org       # ADD — see "two things that break"
NEXT_PUBLIC_ROOT_DOMAIN=webxite.org      # ADD — see note below
```

`NEXT_PUBLIC_ROOT_DOMAIN` is not strictly required: `rootDomain()` falls through
to the `PLATFORM_ROOT` constant, which is the same value. It matters because
`ROOT_DOMAIN` alone is invisible in the browser — Next inlines only `NEXT_PUBLIC_*`
— so the share button on the client is running on the hardcoded fallback rather
than on configuration. Set it so that changing the domain is a config change.

Everything else on this service stays as it is.

**XITE-B**

```
APP_URL=https://app.webxite.org          # was https://webxite.org
                                         # this is where activation emails point
CORS_ORIGINS=...,https://app.webxite.org # add the origin
```

`https://app.webxite.org` is now in the committed `DEFAULT_ORIGINS` too, so CORS
works without the env change — but `CORS_ORIGINS[0]` is also the fallback that
`appUrl()` and the cookie-domain derivation read when `APP_URL` and
`SESSION_COOKIE_DOMAIN` are unset, and both of those are set here. Keep the
apex first in the list or move `app` to the front; either is fine while the
explicit variables are present.

`SESSION_COOKIE_DOMAIN=.webxite.org` and `ROOT_DOMAIN=webxite.org` are already
correct — do not touch them.

**XITE-AD**

```
VITE_STUDIO_BASE_URL=https://app.webxite.org   # was https://webxite.org
```

`VITE_API_BASE_URL` is already `https://api.webxite.org` and stays. Both are
build-time values; the service has to be **rebuilt**, not just restarted.

---

## Google OAuth

`redirectUri()` builds `${APP_URL}/api/auth/google/callback`, so the registered
URI moves with `APP_URL`. Google compares the whole string, exactly.

In the Google Cloud console, for client
`565651900978-rkhdmpol06fle15al6stj7kg389l114n`:

- **Add** `https://app.webxite.org/api/auth/google/callback`
- Keep `https://webxite.org/api/auth/google/callback` until the cutover has
  settled, then remove it. Google allows several.

Getting this wrong shows as `redirect_uri_mismatch` on the way back from Google,
and `google.ts` already surfaces Google's own message for it.

---

## What was verified from here, and what could not be

Verified: all four applications typecheck, build and pass their unit tests (705
tests); `api.webxite.org` is healthy and reports every config key present; CORS
accepts `https://app.webxite.org` and rejects `https://webxite.org.attacker.com`.

Not verified, because it cannot be until the records and bindings above exist:
that `app.webxite.org` serves the editor, that the apex serves the landing site,
that a tenant subdomain renders, and that sign-in works across the new host pair.
`app.webxite.org` does not resolve at the time of writing.
