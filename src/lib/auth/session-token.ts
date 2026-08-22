import { jwtVerify, SignJWT } from "jose";

import {
  SESSION_MAX_AGE_SECONDS,
  SESSION_RENEW_AFTER_SECONDS,
} from "@/lib/api-contract";
import { hostFromOrigin, sessionCookieScope } from "@/lib/auth/cookie-domain";

/**
 * Minting, reading and scoping the session cookie — without `next/headers`.
 *
 * Split out of session.ts for one reason: `proxy.ts` renews the session on
 * every visit, and it cannot import anything that reaches for `cookies()`.
 * Copying the token format and the cookie's attributes over there instead
 * would put two definitions of one cookie in the same repo, which is the exact
 * mistake this codebase has already paid for twice — once across the two
 * services, once across the three hand-mirrored wire types.
 *
 * So the parts that are pure live here, and session.ts stays the thin layer
 * that knows about the request's ambient cookie jar.
 */

export const COOKIE_NAME = "college_session";

/*
 * The lifetime and the renewal threshold come from the shared contract, not
 * from constants declared here. Both services re-mint this token — the proxy on
 * every page visit, the backend on every authenticated API call — so a
 * different number on either side would mean the expiry silently changing
 * depending on which service you touched last.
 */

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
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/**
 * Reads a token, returning who it is and when it was issued.
 *
 * `issuedAt` is what renewal is decided from, and it comes from the signed
 * payload rather than anything the client controls.
 */
export async function readSessionToken(
  token: string | undefined,
): Promise<{ payload: SessionPayload; issuedAt: number } | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const { userId, collegeId, iat } = payload;
    if (typeof userId !== "string" || typeof collegeId !== "string") {
      return null;
    }
    return {
      payload: { userId, collegeId },
      // A token minted without `iat` cannot be aged, so treat it as due —
      // re-issuing one is harmless and gets it a timestamp.
      issuedAt: typeof iat === "number" ? iat : 0,
    };
  } catch {
    // Expired or tampered — signed out, not an error worth surfacing.
    return null;
  }
}

/** Whether a token is old enough that this visit should push it forward. */
export function dueForRenewal(issuedAt: number, now = Date.now()): boolean {
  return Math.floor(now / 1000) - issuedAt >= SESSION_RENEW_AFTER_SECONDS;
}

/**
 * Everything that identifies the cookie, without its lifetime.
 *
 * Deletion has to match on these — name, path, domain — but must not carry a
 * maxAge, which is what makes it a deletion rather than a rewrite.
 */
export function sessionCookieAttributes() {
  /**
   * Must match what the backend sets, or the two write different cookies.
   *
   * The backend issues the session on the parent domain so both services see
   * one login. A cookie written here without the same Domain is a *different*
   * cookie to the browser, and deleting it would leave the backend's in place —
   * signing out would appear to work and change nothing.
   *
   * So it is not read from a second environment variable and hoped over: the
   * same shared helper the backend calls derives it from the same two
   * hostnames, which this service already has to know to reach the API at all.
   */
  const domain = sessionCookieScope({
    configured: process.env.SESSION_COOKIE_DOMAIN,
    frontendHost: hostFromOrigin(process.env.APP_URL),
    apiHost: hostFromOrigin(process.env.NEXT_PUBLIC_API_BASE_URL),
  }).domain;

  /**
   * Keyed off the Domain, exactly as `cookieOptions()` in the backend is.
   *
   * SameSite is about *site*, not origin: localhost:3000 → localhost:4000 and
   * webxite.org → api.webxite.org are both same-site, and `lax` is sent on both.
   * `none` drags `secure` along with it, so deciding this from the API's origin
   * made local development write a Secure cookie over plain http.
   */
  const crossSite = Boolean(domain);

  return {
    httpOnly: true,
    sameSite: (crossSite ? "none" : "lax") as "none" | "lax",
    secure: crossSite || process.env.NODE_ENV === "production",
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

/** Cookie attributes, shared by every place that writes the session. */
export function sessionCookieOptions() {
  return { ...sessionCookieAttributes(), maxAge: SESSION_MAX_AGE_SECONDS };
}
