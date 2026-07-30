/**
 * Recognises "the database is not reachable" as distinct from "the query was
 * wrong". Connectivity problems are an operational state the UI should explain
 * calmly, not an unhandled crash.
 */
const CONNECTIVITY_CODES = new Set([
  "P1000", // authentication failed
  "P1001", // can't reach database server
  "P1002", // server reached but timed out
  "P1017", // server has closed the connection
  // With a driver adapter, Prisma surfaces transport failures as a wrapped
  // query error rather than a P100x, so this has to count too.
  "P2010",
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ECONNRESET",
  "EPIPE",
]);

const CONNECTIVITY_PATTERNS =
  /can't reach database server|connection terminated|connection refused|econnrefused|enotfound|etimedout|getaddrinfo|timeout expired|server has closed the connection|connection pool|DATABASE_URL is not set/i;

/**
 * Prisma wraps the underlying driver failure in `cause`, sometimes more than
 * one level deep, so the interesting code is rarely on the outermost error.
 */
function chainOf(error: unknown, depth = 0): unknown[] {
  if (!error || depth > 5) return [];
  return [error, ...chainOf((error as { cause?: unknown }).cause, depth + 1)];
}

export function isDatabaseUnavailable(error: unknown): boolean {
  return chainOf(error).some((link) => {
    const code = (link as { code?: unknown } | null)?.code;
    if (typeof code === "string" && CONNECTIVITY_CODES.has(code)) return true;

    const message = link instanceof Error ? link.message : String(link ?? "");
    return CONNECTIVITY_PATTERNS.test(message);
  });
}

/** Short code for logs and the health endpoint, without leaking the host. */
export function databaseErrorCode(error: unknown): string {
  for (const link of chainOf(error)) {
    const code = (link as { code?: unknown } | null)?.code;
    if (typeof code === "string" && code) return code;
  }
  return "UNKNOWN";
}

export type DatabaseFailureKind =
  | "dns"
  | "refused"
  | "timeout"
  | "auth"
  | "tls"
  | "missing-url"
  | "unknown";

/**
 * Classify *why* the database is unreachable.
 *
 * Prisma reports transport failures as a bare `P2010`, which is true but
 * useless for operations — "can't connect" and "wrong password" need very
 * different fixes. Walk the cause chain for the underlying syscall or SQLSTATE
 * and name the actual problem.
 */
export function classifyDatabaseError(error: unknown): {
  kind: DatabaseFailureKind;
  code: string;
  host?: string;
} {
  if (!process.env.DATABASE_URL) {
    return { kind: "missing-url", code: "NO_DATABASE_URL" };
  }

  const chain = chainOf(error);
  const codes = chain
    .map((link) => (link as { code?: unknown } | null)?.code)
    .filter((code): code is string => typeof code === "string");
  const text = chain
    .map((link) => (link instanceof Error ? link.message : String(link ?? "")))
    .join(" | ");

  const host = chain
    .map((link) => (link as { hostname?: unknown } | null)?.hostname)
    .find((value): value is string => typeof value === "string");

  const has = (...needles: string[]) =>
    needles.some(
      (needle) =>
        codes.includes(needle) ||
        text.toLowerCase().includes(needle.toLowerCase()),
    );

  let kind: DatabaseFailureKind = "unknown";
  if (has("ENOTFOUND", "EAI_AGAIN", "getaddrinfo")) kind = "dns";
  else if (has("ECONNREFUSED", "connection refused")) kind = "refused";
  else if (has("ETIMEDOUT", "timeout", "timed out")) kind = "timeout";
  else if (
    has("28P01", "28000", "P1000", "password authentication failed", "role \"")
  )
    kind = "auth";
  else if (has("SSL", "certificate", "self-signed")) kind = "tls";

  return { kind, code: codes[0] ?? "UNKNOWN", host };
}

/** What to actually do about each failure kind. */
export const DATABASE_FAILURE_HINTS: Record<DatabaseFailureKind, string> = {
  dns: "The database hostname does not resolve. The app and the database are most likely on different Docker networks, or the hostname in DATABASE_URL is wrong.",
  refused:
    "The host resolves but nothing is listening. Check the port, and that the database service is actually running.",
  timeout:
    "The connection timed out — usually a firewall or a network the app cannot route to.",
  auth: "The database rejected the credentials. Check the username, password and database name in DATABASE_URL.",
  tls: "TLS negotiation failed. Add ?sslmode=disable for a plain internal database, or ?sslmode=require for a managed one.",
  "missing-url": "DATABASE_URL is not set on this service.",
  unknown:
    "Check DATABASE_URL, and that the database service is running and reachable from this container.",
};

export const DATABASE_UNAVAILABLE_MESSAGE =
  "The service is temporarily unavailable — the database could not be reached. Please try again shortly.";
