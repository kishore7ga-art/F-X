import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  ACTIVATION_COOKIE,
  appOrigin,
  authorizationUrl,
  googleEnabled,
  STATE_COOKIE,
} from "@/lib/auth/google";

export const dynamic = "force-dynamic";

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
  // In local dev/demo mode or if Google client credentials are test values,
  // directly route to callback handler to mint valid session without external Google OAuth errors.
  if (process.env.NODE_ENV !== "production" || !googleEnabled) {
    return NextResponse.redirect(new URL("/api/auth/google/callback", appOrigin(request)), {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
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
