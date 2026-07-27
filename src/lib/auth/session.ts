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

  return {
    httpOnly: true,
    sameSite: (crossOrigin ? "none" : "lax") as "none" | "lax",
    secure: crossOrigin || process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
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
  return verifySessionCookie(store.get(COOKIE_NAME)?.value);
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
  store.delete(COOKIE_NAME);
}
