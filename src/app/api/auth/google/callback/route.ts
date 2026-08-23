import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { serverApiPost, ServerApiError } from "@/lib/api/server";
import { createSessionToken, COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session";
import {
  ACTIVATION_COOKIE,
  appOrigin,
  exchangeCode,
  googleEnabled,
  STATE_COOKIE,
} from "@/lib/auth/google";
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

  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value;

  /**
   * A failed exchange is a failed sign-in.
   *
   * What was here caught a missing code, a missing or mismatched `state`, and
   * any error out of `exchangeCode` — and answered all of them by substituting a
   * hardcoded identity, `google.demo@greenfield.edu.in`, which then fell through
   * to the sign-in path below and was issued a real session cookie. A bare
   * `GET /api/auth/google/callback` with no query string at all took that
   * branch, so the whole of authentication was one unauthenticated request to a
   * public URL: no code, no token, no password, no Google account.
   *
   * Worse than the demo address itself was what followed it. The lookup falls
   * back to `admin@greenfield.edu.in`, and failing that *creates* a user against
   * the first college in the database — so the fallback did not merely sign
   * somebody in as a demo user, it signed them in as whoever that college's
   * account happened to be.
   *
   * The CSRF check is the other half. `state` exists so that a callback URL
   * carrying an attacker's authorization code cannot sign a victim into the
   * attacker's account; catching the mismatch and proceeding anyway removed it
   * as a control while leaving the code that computes it in place.
   *
   * Both are refusals now. There is no identity here that Google did not sign.
   */
  if (!code || !state || !expected || expected !== state) {
    console.error("[google] callback rejected: state or code missing/mismatched");
    return back(request, "Sign-in expired. Please try again.");
  }

  let identity: { email: string; name: string | null; emailVerified: boolean; idToken: string };
  try {
    identity = await exchangeCode(request, code);
  } catch (error) {
    console.error("[google] exchange failed:", (error as Error).message);
    return back(request, "Could not complete sign-in with Google");
  }

  /**
   * Google sets `email_verified` false for some Workspace configurations, and
   * the difference matters: it is "this person controls this mailbox" versus
   * "this person typed this into a profile". Every account below is keyed on
   * the address, so an unverified one is an account takeover primitive.
   */
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
    /**
     * Google sign-in signs an existing account in. It does not create one.
     *
     * Three things used to happen here when the address was unknown, and each
     * handed the caller somebody else's tenant:
     *
     *   - fall back to `admin@greenfield.edu.in`, a named account, and issue a
     *     session for it;
     *   - failing that, create a user with an empty password hash attached to
     *     `prisma.college.findFirst()` — whichever college happened to be first;
     *   - either way, mint a full session.
     *
     * The way an account comes into existence on this platform is the access
     * request queue: a Super Admin approves, an invite is issued, and activation
     * redeems it. A sign-in route that provisions accounts walks around all of
     * it, which is the same reason `POST /api/v1/auth/signup` was deleted.
     */
    const user = await prisma.user.findUnique({
      where: { email: identity.email },
      select: { id: true, collegeId: true, status: true },
    });

    if (!user) {
      return back(
        request,
        "No XITE account is linked to that Google address. Request access first.",
      );
    }

    if (user.status !== "ACTIVE") {
      return back(request, "This account has been deactivated. Contact your administrator.");
    }

    const college = await prisma.college.findUnique({
      where: { id: user.collegeId },
      select: { subdomain: true },
    });

    const targetPath = college ? `/editor/${college.subdomain}` : "/start";
    const response = NextResponse.redirect(new URL(targetPath, appOrigin(request)), {
      headers: NO_STORE,
    });

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
