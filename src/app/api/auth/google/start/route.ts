import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
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
 */
export async function GET(request: Request) {
  if (!googleEnabled) {
    return NextResponse.json(
      { error: "Google sign-in is not configured on this deployment" },
      { status: 501 },
    );
  }

  const state = randomUUID();

  const store = await cookies();
  store.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Long enough to pick an account, short enough not to linger.
    maxAge: 600,
  });

  return NextResponse.redirect(authorizationUrl(request, state));
}
