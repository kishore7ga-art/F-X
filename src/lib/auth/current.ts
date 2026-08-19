import { redirect } from "next/navigation";

import type { CollegePayload } from "@/lib/api-contract";
import { serverApi, ServerApiError } from "@/lib/api/server";
import { AUTH_DISABLED, openAccessCollege } from "@/lib/auth/open-access";

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

/** The API's shape, from whichever source answered. */
function toPayload(college: {
  id: string; name: string; subdomain: string; customDomain: string | null;
  templateId: string | null; themePaletteId: string | null; themeFontId: string | null;
  collegeType: string | null; status: string; isDemo: boolean; createdAt: Date;
}): CurrentCollege {
  return {
    id: college.id,
    name: college.name,
    subdomain: college.subdomain,
    customDomain: college.customDomain,
    templateId: college.templateId,
    themePaletteId: college.themePaletteId,
    themeFontId: college.themeFontId,
    collegeType: college.collegeType,
    status: college.status,
    isDemo: college.isDemo,
    createdAt: college.createdAt.toISOString(),
  } as CurrentCollege;
}

export async function getCurrentCollege(targetSubdomain?: string): Promise<CurrentCollege | null> {
  try {
    const payload = await serverApi<{ college: CurrentCollege }>("/api/v1/me");
    if (payload?.college) return payload.college;
  } catch (error) {
    if (error instanceof ServerApiError && error.status !== 401) {
      console.error(`[auth] could not resolve college: ${error.message}`);
    }
  }

  /**
   * Open access is a mode, not a consolation prize.
   *
   * This used to fall through to the shared college whenever the backend said
   * 401 — which is the backend saying "this person is not signed in". The result
   * was that signing out, or presenting an expired cookie, or presenting no
   * cookie at all, still returned a college; every guarded page then rendered,
   * and route protection existed only on paper. It answers now only when the
   * deployment has deliberately been opened.
   */
  if (AUTH_DISABLED) {
    const openCollege = await openAccessCollege(targetSubdomain);
    if (openCollege) return toPayload(openCollege);
  }

  return null;
}

export async function requireCurrentCollege(targetSubdomain?: string): Promise<CurrentCollege> {
  const college = await getCurrentCollege(targetSubdomain);
  if (college) return college;

  // Was: return the open-access college regardless, so this function never
  // required anything. A guard that cannot refuse is not a guard.
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
    console.error(`[auth] could not resolve college:`, cause instanceof Error ? cause.message : cause);
    return null;
  }
}

/**
 * Guards a tenant-scoped screen: the signed-in college must be the one named
 * in the URL, otherwise the resource is treated as non-existent.
 */
export async function requireCollegeBySubdomain(subdomain: string) {
  const college = await requireCurrentCollege(subdomain);
  if (!AUTH_DISABLED && college.subdomain !== subdomain) {
    redirect(`/editor/${college.subdomain}`);
  }
  return college;
}
