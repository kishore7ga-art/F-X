/**
 * Deciding which tenant a request's host belongs to.
 *
 * Two rules, and the first one is the whole reason this file exists.
 *
 * **Suffix, never substring.** The proxy used to ask
 * `hostname.includes(".xite.co.in")`, so `xite.co.in.attacker.com` matched: the
 * string contains the root domain. The first label was then taken as the
 * subdomain, and a tenant's site was served on a hostname anybody could
 * register. It is the same mistake `isAllowedOrigin` in the backend already
 * documents having fixed for CORS, in a second place nobody had looked.
 *
 * **A host header is a routing hint, not an authorisation.** Everything decided
 * here selects *which public site to render*, and nothing else — no session, no
 * tenant data, no admin surface. A forged `Host` can therefore only ask us for a
 * site that is already public. That is deliberate, and it is why the custom
 * domain lookup is allowed to trust the header at all: the answer it produces is
 * checked against the database, and only a domain a tenant has proven ownership
 * of and that is actively serving resolves to anything.
 */

/** Hostnames the platform keeps for itself; never a tenant. */
const RESERVED_LABELS = new Set(["admin", "api", "www", "app", "mail", "static", "assets"]);

export function rootDomain(): string {
  return (process.env.NEXT_PUBLIC_ROOT_DOMAIN || process.env.ROOT_DOMAIN || "xite.co.in")
    .toLowerCase()
    .trim();
}

/**
 * A `Host` header reduced to a comparable hostname.
 *
 * The port has to go before any suffix test: `localhost:3000` does not end with
 * `.localhost`, and a tenant host with an explicit port would not match its own
 * domain either.
 */
export function parseHost(raw: string | null | undefined): string {
  if (!raw) return "";
  let host = raw.split(",")[0]?.trim().toLowerCase() ?? "";
  // IPv6 literals arrive bracketed; the brackets are not part of the name.
  if (host.startsWith("[")) {
    const close = host.indexOf("]");
    return close > 0 ? host.slice(1, close) : "";
  }
  host = host.split(":")[0] ?? "";
  return host.replace(/\.$/, "");
}

/**
 * The tenant subdomain of a platform host, or null.
 *
 * Exact suffix match against the configured root and against `xite.co.in`, plus
 * `.localhost` for development. A host that merely contains the root domain
 * returns null, which is the fix.
 */
export function platformSubdomainOf(host: string): string | null {
  if (!host) return null;

  const roots = [rootDomain(), "xite.co.in", "localhost"].filter(Boolean);

  for (const root of roots) {
    if (host === root) return null; // the apex is the marketing site, not a tenant
    if (!host.endsWith(`.${root}`)) continue;

    const prefix = host.slice(0, -(root.length + 1));
    // Only a single label is a tenant. `a.b.xite.co.in` is not one, and
    // treating it as `a` would let one tenant be reached at another's name.
    if (!prefix || prefix.includes(".")) return null;
    if (RESERVED_LABELS.has(prefix)) return null;
    return prefix;
  }

  return null;
}

/**
 * A short-lived cache of host → subdomain.
 *
 * The proxy runs on every page request, and a network round trip to the API on
 * each one would put the backend in the critical path of every visit. Sixty
 * seconds is short enough that disconnecting a domain takes effect while
 * somebody is still on the phone about it, and long enough that a busy site
 * makes one lookup a minute rather than one a request.
 *
 * Negative answers are cached too, and for longer: the overwhelmingly common
 * unknown host is a scanner or a stale DNS record, and re-asking the API for
 * every one of those is how a crawler becomes a load test.
 */
type CacheEntry = { subdomain: string | null; expiresAt: number };
const HOST_CACHE = new Map<string, CacheEntry>();
const HIT_TTL_MS = 60_000;
const MISS_TTL_MS = 300_000;
/** Bounded, so a flood of unique forged hosts cannot grow this without limit. */
const CACHE_LIMIT = 1000;

export function invalidateHostCache(host?: string): void {
  if (host) HOST_CACHE.delete(parseHost(host));
  else HOST_CACHE.clear();
}

function cacheSet(host: string, subdomain: string | null): void {
  if (HOST_CACHE.size >= CACHE_LIMIT) {
    // Oldest insertion first — Map preserves insertion order, and evicting one
    // entry per write keeps the bound without a sweep.
    const oldest = HOST_CACHE.keys().next().value;
    if (oldest !== undefined) HOST_CACHE.delete(oldest);
  }
  HOST_CACHE.set(host, {
    subdomain,
    expiresAt: Date.now() + (subdomain ? HIT_TTL_MS : MISS_TTL_MS),
  });
}

/**
 * The tenant a custom domain belongs to, or null.
 *
 * Answers only for domains the backend reports as ACTIVE — proven by DNS and
 * observed serving over HTTPS. A domain that has merely been typed into the
 * settings screen resolves to nothing, or adding a hostname would be enough to
 * claim it.
 */
export async function resolveCustomHost(host: string): Promise<string | null> {
  const key = parseHost(host);
  if (!key) return null;

  const cached = HOST_CACHE.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.subdomain;

  const base =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000";

  try {
    const response = await fetch(
      `${base}/api/v1/public/resolve-host?host=${encodeURIComponent(key)}`,
      {
        // A visitor is waiting on this. A backend that is slow to answer must
        // not hold the whole page open — falling through renders the platform's
        // own 404, which is the same thing an unknown host got before.
        signal: AbortSignal.timeout(2000),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      cacheSet(key, null);
      return null;
    }

    const data = (await response.json()) as { subdomain?: unknown };
    const subdomain = typeof data?.subdomain === "string" ? data.subdomain : null;
    cacheSet(key, subdomain);
    return subdomain;
  } catch {
    // Do not cache a transport failure as a miss: the domain may be perfectly
    // fine and the backend merely restarting, and a five-minute negative cache
    // would keep the site down long after it recovered.
    return null;
  }
}
