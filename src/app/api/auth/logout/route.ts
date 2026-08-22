import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, destroySession } from "@/lib/auth/session";

/**
 * Where signing out lands, resolved rather than written down.
 *
 * This used to be the literal `https://xite.co.in`, which meant a sign-out in
 * local development or on any other deployment bounced the operator onto the
 * production site. `APP_URL` is the same variable the Google callback builds
 * its redirect_uri from, so the two agree by construction; the request's own
 * origin covers a deployment that has not set it.
 */
function homeUrl(request: NextRequest): URL {
  const configured = process.env.APP_URL?.trim().replace(/\/+$/, "");
  return new URL("/", configured || request.nextUrl.origin);
}

export async function POST() {
  try {
    await destroySession();
  } catch (err) {
    console.warn("Logout session destruction warning:", err);
  }

  const cookieStore = await cookies();
  // Clear all cookie keys thoroughly
  const cookiesToClear = [COOKIE_NAME, "xite_session", "xite_user_token", "auth_token"];
  for (const cName of cookiesToClear) {
    try {
      cookieStore.set(cName, "", {
        expires: new Date(0),
        path: "/",
      });
      cookieStore.delete(cName);
    } catch {}
  }

  return NextResponse.json({ success: true, redirect: "/" });
}

export async function GET(request: NextRequest) {
  try {
    await destroySession();
  } catch {}

  const cookieStore = await cookies();
  const cookiesToClear = [COOKIE_NAME, "xite_session", "xite_user_token", "auth_token"];
  for (const cName of cookiesToClear) {
    try {
      cookieStore.set(cName, "", {
        expires: new Date(0),
        path: "/",
      });
      cookieStore.delete(cName);
    } catch {}
  }

  return NextResponse.redirect(homeUrl(request));
}
