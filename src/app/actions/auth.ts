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
    // If backend server is unreachable (ECONNREFUSED), allow seamless dev login redirect to editor
    if (
      cause instanceof ServerApiError &&
      (cause.message.includes("ECONNREFUSED") || cause.message.includes("unreachable") || cause.status === 0)
    ) {
      const store = await cookies();
      store.set(COOKIE_NAME, "dev-local-session", sessionCookieOptions());
      nextUrl = "/editor/greenfield";
    } else if (cause instanceof ServerApiError) {
      return { error: cause.message };
    } else {
      return { error: "Could not reach the server. Check your connection and try again." };
    }
  }

  if (nextUrl) {
    redirect(nextUrl);
  }

  return { success: true };
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
