import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACTIVATION_COOKIE,
  STATE_COOKIE,
} from "@/app/api/auth/google/start/route";
import { serverApiPost, ServerApiError } from "@/lib/api/server";
import { createSessionToken, COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session";
import { appOrigin, exchangeCode, googleEnabled } from "@/lib/auth/google";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, must-revalidate" };

/** Sign-in failures land back on /login carrying a readable reason. */
function back(request: Request, reason: string) {
  const url = new URL("/login", appOrigin(request));
  url.searchParams.set("error", reason);
  const response = NextResponse.redirect(url, { headers: NO_STORE });
  // The attempt is over either way; a stale state would only fail the next one.
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(ACTIVATION_COOKIE);
  return response;
}

/**
 * Activation failures land back on /activate, still carrying the token.
 *
 * Not on /login: the person has an invite and has not got an account yet, so a
 * login form is the one page that cannot help them. Keeping the token in the URL
 * means the page can redraw with the password option still available, which is the
 * actual way out of an address mismatch.
 */
function backToActivate(request: Request, token: string, reason: string) {
  const url = new URL("/activate", appOrigin(request));
  url.searchParams.set("token", token);
  url.searchParams.set("error", reason);
  const response = NextResponse.redirect(url, { headers: NO_STORE });
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(ACTIVATION_COOKIE);
  return response;
}

/**
 * Redeems an invite through the backend and signs the person in.
 *
 * The session is minted from what the backend returns rather than forwarded as a
 * Set-Cookie: this response is a redirect built here, and its cookie has to be
 * written with this app's own scope helper — the same one the sign-in path below
 * uses. Nothing about the session differs between the two ways in.
 */
async function activate(request: Request, token: string, idToken: string) {
  let payload: { userId: string; collegeId: string; next: string };

  try {
    payload = await serverApiPost<{
      userId: string;
      collegeId: string;
      next: string;
    }>("/api/v1/activate/google", { token, idToken });
  } catch (cause) {
    /**
     * The backend's message is shown as-is, deliberately.
     *
     * It is the one that says "this invite was issued to someone@example.com",
     * which is the difference between a person understanding they used the wrong
     * Google account and a person staring at "activation failed". It is written
     * for this audience and names no address they do not already know.
     */
    const reason =
      cause instanceof ServerApiError
        ? cause.message
        : "Could not complete activation";
    console.error(`[google] activation failed: ${reason}`);
    return backToActivate(request, token, reason);
  }

  const response = NextResponse.redirect(
    new URL(payload.next, appOrigin(request)),
    { headers: NO_STORE },
  );

  response.cookies.set(
    COOKIE_NAME,
    await createSessionToken({
      userId: payload.userId,
      collegeId: payload.collegeId,
    }),
    sessionCookieOptions(),
  );
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(ACTIVATION_COOKIE);

  return response;
}

export async function GET(request: Request) {
  if (!googleEnabled) return back(request, "Google sign-in is not configured");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Google reports a refusal here rather than by failing the request.
  const denied = url.searchParams.get("error");
  if (denied) return back(request, "Sign-in was cancelled");
  if (!code || !state) return back(request, "Google sign-in did not complete");

  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value;

  // Single use, and it must be the one we minted.
  if (!expected || expected !== state) {
    return back(request, "Sign-in expired — please try again");
  }

  let identity;
  try {
    identity = await exchangeCode(request, code);
  } catch (error) {
    console.error("[google] exchange failed:", (error as Error).message);
    return back(request, "Could not verify your Google account");
  }

  if (!identity.emailVerified) {
    return back(request, "That Google account has an unverified email address");
  }

  /**
   * Activation, if this trip began on the activation page.
   *
   * Handled before the sign-in path below and not merged into it, because the two
   * are opposites: sign-in creates an account for whoever turns up, activation
   * redeems an invite issued to one specific address. Falling through to sign-in
   * on a failed activation would hand somebody an account the invite was never
   * for, which is the exact thing the address match exists to prevent.
   *
   * The backend does the redeeming. It verifies the id_token again against
   * Google's keys rather than trusting the email this route already read out of
   * it — see `xite-B/src/google-identity.ts`.
   */
  const activationToken = store.get(ACTIVATION_COOKIE)?.value;
  if (activationToken) {
    return activate(request, activationToken, identity.idToken);
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: identity.email },
      include: { college: { select: { subdomain: true } } },
    });

    if (!user) {
      /**
       * First sign-in. Adopt an unclaimed college before making a new one.
       *
       * An install that ran in open-access mode has a real college with real
       * content and no user attached to it. Creating a second college here
       * would strand the first: the person who built it would sign in and find
       * an empty site, with their work intact but unreachable.
       */
      const unclaimed = await prisma.college.findFirst({
        where: { isDemo: false, users: { none: {} } },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      const collegeId =
        unclaimed?.id ??
        (
          await prisma.college.create({
            data: {
              name: identity.name ? `${identity.name}'s college` : "My College",
              subdomain: `college-${Date.now().toString(36)}`,
              status: "DRAFT",
            },
            select: { id: true },
          })
        ).id;

      user = await prisma.user.create({
        data: {
          email: identity.email,
          // Google is the credential. A random unusable hash keeps the column
          // NOT NULL without inventing a password anyone could guess or reuse.
          passwordHash: `google:${crypto.randomUUID()}`,
          collegeId,
        },
        include: { college: { select: { subdomain: true } } },
      });
    }

    // Into step 2, the same as every other way in. Jumping a signed-in college
    // straight to its editor made the route out of sign-in depend on how far
    // along it was, which is two flows wearing one name.
    const response = NextResponse.redirect(new URL("/onboarding", appOrigin(request)), {
      headers: NO_STORE,
    });

    // Set on the response rather than through ambient mutation: a cookie
    // written the other way is not reliably carried onto a redirect, which
    // would sign the person in and then immediately forget them.
    response.cookies.set(
      COOKIE_NAME,
      await createSessionToken({ userId: user.id, collegeId: user.collegeId }),
      sessionCookieOptions(),
    );
    response.cookies.delete(STATE_COOKIE);

    return response;
  } catch (error) {
    console.error("[google] sign-in failed:", (error as Error).message);
    return back(request, "Could not complete sign-in");
  }
}
