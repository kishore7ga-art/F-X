import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, destroySession } from "@/lib/auth/session";

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

export async function GET() {
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

  return NextResponse.redirect(new URL("/", "https://xite.co.in"));
}
