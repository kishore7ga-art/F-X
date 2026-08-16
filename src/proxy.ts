import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  COOKIE_NAME,
  createSessionToken,
  dueForRenewal,
  readSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session-token";

/**
 * Keeps a signed-in visitor signed in.
 *
 * The session was a fixed seven days from the moment of sign-in: use the site
 * daily for a week and you were still logged out on the eighth day, mid-edit,
 * for no reason you could see. This pushes the expiry forward on arrival, so
 * the window measures *inactivity* rather than age. Someone who visits at all
 * regularly is never signed out; someone who has been gone a week still is.
 *
 * Why here rather than anywhere else in the app: a cookie can only be written
 * on a response, and a Server Component render cannot write one. The obvious
 * alternative — renewing inside `GET /api/v1/me`, which every guarded page
 * already calls — does not work either, because the frontend makes that call
 * server-to-server, so its `Set-Cookie` lands on an internal fetch and never
 * reaches the browser. Proxy is the one place that sees every visit and owns
 * the response going back.
 *
 * Renamed from Middleware in Next 16; the file must be `proxy.ts`, and it runs
 * on the Node runtime by default, which is what lets it use the same `jose`
 * signing code as the rest of the app.
 */
export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Handle clean subdomain mapping (e.g. kishore7ga-college.xite.co.in -> /site/kishore7ga-college)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || process.env.ROOT_DOMAIN || "";
  const isCustomSubdomain =
    (hostname.includes(".xite.co.in") ||
      hostname.includes(".meetkishore.in") ||
      (rootDomain && hostname.includes(`.${rootDomain}`)) ||
      hostname.includes(".localhost")) &&
    !hostname.startsWith("admin.") &&
    !hostname.startsWith("api.") &&
    !hostname.startsWith("www.") &&
    hostname !== "xite.co.in" &&
    hostname !== "meetkishore.in" &&
    (rootDomain ? hostname !== rootDomain : true) &&
    hostname !== "localhost:3000" &&
    hostname !== "localhost";

  if (isCustomSubdomain) {
    const subdomain = hostname.split(".")[0];
    if (subdomain && !url.pathname.startsWith("/api") && !url.pathname.startsWith("/_next")) {
      url.pathname = `/site/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  const response = NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return response;

  const session = await readSessionToken(token);

  /**
   * Deliberately does nothing when the token is missing, expired or forged.
   *
   * It would be easy to redirect to /login from here, and wrong: every guarded
   * page already decides that for itself, and a second copy of the rule in a
   * file that runs before all of them is how the two drift apart. This renews
   * sessions. It does not decide who may see what.
   */
  if (!session) return response;

  if (!dueForRenewal(session.issuedAt)) return response;

  /**
   * A session minted in open-access mode is not an identity, and renewing one
   * would keep it alive indefinitely after the operator closed the door.
   * `getSession()` already refuses these; extending them here would quietly
   * work against it.
   */
  if (session.payload.userId.startsWith("open-access:")) return response;

  response.cookies.set(
    COOKIE_NAME,
    await createSessionToken(session.payload),
    sessionCookieOptions(),
  );

  return response;
}

export const config = {
  /**
   * Every page, and nothing else.
   *
   * Static assets and image optimisation are excluded because renewing on a
   * favicon is a signing round and a `Set-Cookie` header for nothing. `/api` is
   * excluded for a sharper reason: the Google callback writes the session
   * itself, and a proxy re-issuing the *old* token onto that same response
   * would put two `Set-Cookie` headers for one name on it and leave which one
   * wins to header order.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
