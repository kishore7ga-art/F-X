import { redirect } from "next/navigation";

import type { CollegePayload } from "@/lib/api-contract";
import { serverApi, ServerApiError } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";

/**
 * The signed-in college, fetched from the backend.
 *
 * This queried the frontend's own Prisma client, which meant the database was
 * configured in two services and either copy could be wrong by itself. One was:
 * sign-in succeeded against the backend and every page after it failed here, so
 * the product authenticated people onto a screen that could not load. There is
 * one credential now, in the service that owns the data.
 *
 * The shape was then declared here a second time, by hand, to describe what
 * that service sends — which is the same mistake one layer up: two definitions,
 * no link, and a field added to the backend's `select` breaking this at runtime
 * with both repos compiling. It is the shared contract now, which the backend
 * annotates its own return with, so the two cannot disagree.
 */
export type CurrentCollege = CollegePayload;

export async function getCurrentCollege(): Promise<CurrentCollege | null> {
  // The cookie is verified here first, so a signed-out visitor costs no round
  // trip — and, more importantly, a backend that is down cannot make the login
  // page look like a broken one.
  const session = await getSession();
  if (!session) return null;

  try {
    const payload = await serverApi<{ college: CurrentCollege }>("/api/v1/me");
    return payload?.college ?? null;
  } catch (error) {
    if (error instanceof ServerApiError) {
      console.error(`[auth] could not resolve college: ${error.message}`);
      return null;
    }
    return null;
  }
}

/** Same, but sends signed-out visitors to the login screen. */
import { AUTH_DISABLED, openAccessCollege } from "@/lib/auth/open-access";

export async function requireCurrentCollege(): Promise<CurrentCollege> {
  const college = await getCurrentCollege();
  if (college) return college;

  if (AUTH_DISABLED) {
    const openCollege = await openAccessCollege();
    return {
      id: openCollege.id,
      name: openCollege.name,
      subdomain: openCollege.subdomain,
      collegeType: openCollege.collegeType,
      templateId: openCollege.templateId,
      templateName: null,
      status: openCollege.status,
    };
  }

  redirect("/login");
}

/**
 * Same again, but never throws — for the sign-in and sign-up screens.
 *
 * Those two pages exist to get someone out of a bad state, so they are the two
 * that must render in one. A stale cookie plus an unreachable backend made
 * `/login` answer 500: the lookup threw inside the server render, and the only
 * page that could have cleared the cookie was the page that crashed on it.
 *
 * Treating the failure as "signed out" is right rather than merely convenient —
 * we could not confirm who this is, and the answer to that is the login form.
 */
export async function getCurrentCollegeOrNull() {
  try {
    return await getCurrentCollege();
  } catch (cause) {
    if (cause instanceof ServerApiError) {
      console.error(`[auth] could not resolve college: ${cause.message}`);
      return null;
    }
    throw cause;
  }
}

/**
 * Guards a tenant-scoped screen: the signed-in college must be the one named
 * in the URL, otherwise the resource is treated as non-existent.
 */
export async function requireCollegeBySubdomain(subdomain: string) {
  const college = await requireCurrentCollege();
  if (college.subdomain !== subdomain) redirect(`/editor/${college.subdomain}`);
  return college;
}
