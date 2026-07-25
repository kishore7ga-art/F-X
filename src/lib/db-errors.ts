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

export const DATABASE_UNAVAILABLE_MESSAGE =
  "The service is temporarily unavailable — the database could not be reached. Please try again shortly.";
