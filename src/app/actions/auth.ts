"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { serverApiPost, ServerApiError } from "@/lib/api/server";
import { COOKIE_NAME, destroySession, sessionCookieOptions } from "@/lib/auth/session";

export type LoginState = { success?: boolean; next?: string; error?: string };

export async function loginAction(
  _prev: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    return { error: "Enter your email and password" };
  }

  let nextUrl = "";

  try {
    const response = await serverApiPost<{ token?: string; subdomain: string; next: string }>(
      "/api/v1/auth/login",
      { email, password },
    );

    if (response.token) {
      const store = await cookies();
      store.set(COOKIE_NAME, response.token, sessionCookieOptions());
    }

    // The backend decides where a sign-in lands — onboarding for a college with
    // no design yet, the editor once it has one. Overriding that here is how
    // somebody with a half-provisioned tenant ends up in an empty editor.
    nextUrl = response.next || `/editor/${response.subdomain || "greenfield"}`;
  } catch (cause) {
    /**
     * A failed sign-in is a failed sign-in.
     *
     * What was here caught an unreachable backend, any 5xx, and anything that
     * was not a `ServerApiError` — and answered all three by writing the literal
     * string "demo-session-token" into the session cookie and sending the
     * visitor into the editor. No password was checked on that path. Anyone able
     * to make the API return a 500, or catch it during a deploy, was in; and
     * because the string is not a signed token, every request afterwards fell
     * through to the open-access college, so they landed in somebody's site.
     *
     * The only honest answers are "wrong credentials" and "we could not ask".
     */
    if (cause instanceof ServerApiError) {
      if (cause.status === 0 || cause.status >= 500) {
        return { error: "We could not reach the sign-in service. Please try again in a moment." };
      }
      return { error: cause.message };
    }
    throw cause;
  }

  if (nextUrl) {
    return { success: true, next: nextUrl };
  }

  return { success: true };
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
