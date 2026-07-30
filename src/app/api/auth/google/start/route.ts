import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { authorizationUrl, googleEnabled } from "@/lib/auth/google";

export const dynamic = "force-dynamic";

export const STATE_COOKIE = "google_oauth_state";

/**
 * Carries an activation token across the round trip to Google.
 *
 * A cookie rather than the `state` parameter, which is the obvious place and the
 * wrong one. `state` travels to Google and comes back in a URL — it lands in
 * server logs, in browser history and in the Referer of anything the callback
 * page loads. An invite token is a credential that grants an account; it does not
 * belong in any of those. httpOnly keeps it out of scripts too.
 *
 * Absent for ordinary sign-in, which is how the callback tells the two apart.
 */
export const ACTIVATION_COOKIE = "xite_activation_token";

/**
 * Begins Google sign-in.
 *
 * The `state` value is minted here, kept in an httpOnly cookie, and compared on
 * the way back. Without it, anyone could hand a victim's browser a callback URL
 * carrying their own authorization code and sign them into the wrong account.
 *
 * Two details this depends on, both learned the hard way from a live
 * "Sign-in expired" that looked like a bug in the comparison:
 *
 *  - The cookie is set on the response object, not through ambient mutation.
 *    A redirect returned from a route handler does not reliably carry a cookie
 *    written the other way.
 *  - The response is explicitly uncacheable. Every request must mint a fresh
 *    pair, and a proxy that caches this redirect hands out one visitor's state
 *    to the next — usually with the Set-Cookie stripped, so the browser arrives
 *    at the callback holding nothing that can match.
 */
export async function GET(request: Request) {
  if (!googleEnabled) {
    return NextResponse.json(
      { error: "Google sign-in is not configured on this deployment" },
      { status: 501, headers: { "Cache-Control": "no-store" } },
    );
  }

  const state = randomUUID();

  const response = NextResponse.redirect(authorizationUrl(request, state), {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Long enough to pick an account, short enough not to linger.
    maxAge: 600,
  };

  response.cookies.set(STATE_COOKIE, state, cookieOptions);

  /**
   * Shape-checked before it is stored, not because a bad value is dangerous —
   * the backend rejects anything that is not a live invite — but because a
   * truncated paste should fail here, where the person is still looking at the
   * activation page, rather than after a detour through Google.
   */
  const activationToken = new URL(request.url).searchParams.get(
    "activation_token",
  );
  if (activationToken && /^[a-f0-9]{64}$/.test(activationToken)) {
    response.cookies.set(ACTIVATION_COOKIE, activationToken, cookieOptions);
  } else {
    /**
     * Cleared when absent, rather than left alone.
     *
     * Someone who abandons an activation and later signs in normally would
     * otherwise still be carrying the cookie, and the callback would try to
     * redeem an invite they did not ask to redeem on this trip.
     */
    response.cookies.delete(ACTIVATION_COOKIE);
  }

  return response;
}
