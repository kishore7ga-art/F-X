import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { authorizationUrl, googleEnabled } from "@/lib/auth/google";

export const dynamic = "force-dynamic";

export const STATE_COOKIE = "google_oauth_state";

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

  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Long enough to pick an account, short enough not to linger.
    maxAge: 600,
  });

  return response;
}
