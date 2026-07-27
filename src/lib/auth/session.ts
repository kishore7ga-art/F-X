import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import { AUTH_DISABLED, openAccessCollege } from "@/lib/auth/open-access";

export const COOKIE_NAME = "college_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  collegeId: string;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Mints the signed token without touching cookies.
 *
 * Route handlers that end in a redirect must attach the cookie to the response
 * they return; ambient cookie mutation is not reliably carried onto one.
 */
export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/** Cookie attributes, shared by every place that writes the session. */
export function sessionCookieOptions() {
  return { ...sessionCookieAttributes(), maxAge: MAX_AGE_SECONDS };
}

/**
 * Everything that identifies the cookie, without its lifetime.
 *
 * Deletion has to match on these — name, path, domain — but must not carry a
 * maxAge, which is what makes it a deletion rather than a rewrite.
 */
function sessionCookieAttributes() {
  /**
   * `lax` is right while the API is same-origin, and silently wrong the moment
   * it is not: a lax cookie is never sent to a different origin, so moving the
   * API to api.xite.co.in would 401 every authenticated call while CORS looked
   * perfectly configured.
   *
   * `none` requires `secure`, which is why it is keyed off having a
   * cross-origin API rather than offered as a free-standing switch.
   */
  const crossOrigin = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

  /**
   * Must match what the backend sets, or the two write different cookies.
   *
   * The backend issues the session on the parent domain so both services see
   * one login. A cookie written here without the same Domain is a *different*
   * cookie to the browser, and deleting it would leave the backend's in place —
   * signing out would appear to work and change nothing.
   */
  const domain = process.env.SESSION_COOKIE_DOMAIN;

  return {
    httpOnly: true,
    sameSite: (crossOrigin ? "none" : "lax") as "none" | "lax",
    secure: crossOrigin || process.env.NODE_ENV === "production",
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export async function createSession(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, sessionCookieOptions());
}

export async function getSession(): Promise<SessionPayload | null> {
  // Open-access mode short-circuits here rather than at each of the dozen call
  // sites. Everything downstream — the editor guard, the section and publish
  // actions, upload authorisation, draft visibility — already asks this one
  // question, so answering it differently is the whole switch.
  //
  // Only collegeId is ever read from a session; userId exists for the JWT's
  // sake, so a synthetic one costs nothing and needs no User row.
  const store = await cookies();

  if (AUTH_DISABLED) {
    /**
     * A real session still wins.
     *
     * Open-access used to ignore cookies entirely, which made signing in with
     * Google a gesture: the button worked, a session was issued, and the very
     * next request threw it away and handed back the shared college. Someone
     * who has told us who they are should get their own site.
     *
     * Anyone without a session still falls through to open access, so the door
     * stays open — this adds an identity, it does not require one.
     */
    const signedIn = await verifySessionCookie(store.get(COOKIE_NAME)?.value);
    if (signedIn) return signedIn;

    const college = await openAccessCollege();
    return { userId: `open-access:${college.id}`, collegeId: college.id };
  }
  const session = await verifySessionCookie(store.get(COOKIE_NAME)?.value);

  /**
   * A session minted in open-access mode is not an identity.
   *
   * Turning AUTH_DISABLED off is how an operator closes the door, and it has to
   * close behind the people already inside. These tokens carry a synthetic
   * `open-access:` userId, no password was ever entered for one, and they stay
   * cryptographically valid for a week — so without this, everyone who used the
   * site while it was open keeps full edit and publish rights afterwards.
   */
  if (session?.userId.startsWith("open-access:")) return null;

  return session;
}

/** Reads a session out of a cookie value, or null if it is absent or bad. */
async function verifySessionCookie(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const userId = payload.userId;
    const collegeId = payload.collegeId;
    if (typeof userId !== "string" || typeof collegeId !== "string") {
      return null;
    }
    return { userId, collegeId };
  } catch {
    // Expired or tampered token — treat as signed out.
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  // Deleting needs the same name/path/domain the cookie was written with; a
  // bare name misses a cookie scoped to the parent domain and leaves it valid.
  store.delete({ name: COOKIE_NAME, ...sessionCookieAttributes() });
}
