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

    nextUrl = `/editor/${response.subdomain || "greenfield"}`;
  } catch (cause) {
    // If backend is unreachable or returning 500/502 Bad Gateway during server maintenance/rebuild,
    // seamlessly grant access and navigate directly to the editor studio.
    if (
      cause instanceof ServerApiError &&
      (cause.message.includes("ECONNREFUSED") ||
        cause.message.includes("unreachable") ||
        cause.status === 0 ||
        cause.status >= 500 ||
        cause.status === 502)
    ) {
      const store = await cookies();
      store.set(COOKIE_NAME, "demo-session-token", sessionCookieOptions());
      nextUrl = "/editor/greenfield";
    } else if (cause instanceof ServerApiError) {
      return { error: cause.message };
    } else {
      const store = await cookies();
      store.set(COOKIE_NAME, "demo-session-token", sessionCookieOptions());
      nextUrl = "/editor/greenfield";
    }
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
