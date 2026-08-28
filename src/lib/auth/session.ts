import { cookies } from "next/headers";

import { AUTH_DISABLED, openAccessCollege } from "@/lib/auth/open-access";
import {
  COOKIE_NAME,
  createSessionToken,
  readSessionToken,
  sessionCookieAttributes,
  sessionCookieOptions,
  type SessionPayload,
} from "@/lib/auth/session-token";

/**
 * The session, as seen from a request that has an ambient cookie jar.
 *
 * The token format and the cookie's attributes live in session-token.ts, which
 * imports nothing from `next/headers` — because proxy.ts renews the session on
 * every visit and cannot use `cookies()`. Both read one definition rather than
 * keeping two in step by hand.
 */

export { COOKIE_NAME, createSessionToken, sessionCookieOptions };
export type { SessionPayload };

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

    // Null when the database could not be reached. There is no college to
    // scope a session to, and inventing one would mint a token for a tenant
    // that does not exist — every write behind it lands nowhere.
    const college = await openAccessCollege();
    if (!college) return null;
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
  return (await readSessionToken(token))?.payload ?? null;
}

export async function destroySession() {
  const store = await cookies();
  // Deleting needs the same name/path/domain the cookie was written with; a
  // bare name misses a cookie scoped to the parent domain and leaves it valid.
  store.delete({ name: COOKIE_NAME, ...sessionCookieAttributes() });
}
