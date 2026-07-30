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

  try {
    const response = await serverApiPost<{ token?: string; subdomain: string; next: string }>(
      "/api/v1/auth/login",
      { email, password },
    );

    if (response.token) {
      const store = await cookies();
      store.set(COOKIE_NAME, response.token, sessionCookieOptions());
    }

    const next = response.next || `/editor/${response.subdomain}`;
    return { success: true, next };
  } catch (cause) {
    if (cause instanceof ServerApiError) {
      return { error: cause.message };
    }
    return { error: "Could not reach the server. Check your connection and try again." };
  }
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
