import { cookies } from "next/headers";

/**
 * The server's door to the API, as `api-client.ts` is the browser's.
 *
 * Server Components cannot use the browser client: there is no ambient cookie
 * jar, so a call made during a render arrives unauthenticated and the backend
 * answers 401 for a visitor who is plainly signed in. This forwards the request's
 * own cookies, which is the whole difference.
 *
 * It prefers `BACKEND_INTERNAL_URL` — inside the Docker network that is a
 * container-to-container hop of a few milliseconds, where the public hostname
 * leaves the network, resolves through DNS, terminates TLS at the proxy and
 * comes back, for about fifty times the latency and no benefit.
 */
const BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "";

export class ServerApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ServerApiError";
  }
}

/**
 * GETs from the backend as the current visitor.
 *
 * `null` means the backend answered "nothing here" — 204 or 404 — which is a
 * real answer and the caller's to interpret. Anything else throws, because a
 * 500 rendered as an empty page is how a broken service looks like an empty
 * account.
 */
export async function serverApi<T>(path: string): Promise<T | null> {
  return request<T>(path, "GET");
}

/**
 * POSTs to the backend as the current visitor, for Server Actions.
 *
 * Actions are writes, and a write that answers "nothing here" is not a shrug —
 * so unlike the GET above, a 404 throws rather than returning null. An action
 * that quietly did nothing and told the caller it succeeded is the worst of the
 * available outcomes.
 */
export async function serverApiPost<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const result = await request<T>(path, "POST", body);
  if (result === null) {
    throw new ServerApiError("The backend had nothing to act on", 404);
  }
  return result;
}

async function request<T>(
  path: string,
  method: "GET" | "POST",
  body?: unknown,
): Promise<T | null> {
  if (!BASE) {
    throw new ServerApiError(
      "No backend configured — set BACKEND_INTERNAL_URL",
      0,
    );
  }

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // Every one of these is per-visitor and per-request; a cached answer here
      // would show one college's editor to another.
      cache: "no-store",
    });
  } catch (cause) {
    // fetch reports every transport failure as a bare TypeError, so the useful
    // part — ECONNREFUSED, ENOTFOUND — is one level down.
    const code = (cause as { cause?: { code?: string } })?.cause?.code;
    throw new ServerApiError(
      `Backend unreachable${code ? ` (${code})` : ""}`,
      0,
    );
  }

  if (method === "GET" && (response.status === 204 || response.status === 404)) return null;
  if (method === "POST" && response.status === 204) return null;

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new ServerApiError(
      detail?.error ?? `Backend returned ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}
