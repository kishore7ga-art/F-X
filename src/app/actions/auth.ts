"use server";

import { redirect } from "next/navigation";

import { destroySession } from "@/lib/auth/session";

/**
 * Signing out is the only auth action left in the frontend.
 *
 * Sign-in and sign-up moved to the backend (`POST /api/v1/auth/login` and
 * `/signup`), because a Server Action posts to this origin as an RSC payload —
 * which made authentication the one thing that could not be sent to the API
 * service, and the one call you could not read in the Network tab.
 *
 * This one stays: it only clears a cookie and redirects, touches no database,
 * and as an action it needs no client JavaScript to work.
 */
export async function logout() {
  await destroySession();
  redirect("/login");
}
