import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { databaseErrorCode, isDatabaseUnavailable } from "@/lib/db-errors";

/** The signed-in user's college, or null when signed out. */
export async function getCurrentCollege() {
  const session = await getSession();
  if (!session) return null;

  return prisma.college.findUnique({ where: { id: session.collegeId } });
}

/**
 * Same, but never throws — for the sign-in and sign-up screens.
 *
 * Those two pages exist to get someone out of a bad state, so they are the two
 * that must render in one. A stale cookie plus an unreachable database made
 * `/login` answer 500: the lookup threw inside the server render, and the only
 * page that could have fixed the cookie was the page that crashed on it.
 *
 * Treating the failure as "signed out" is right rather than merely convenient —
 * we could not confirm who this is, and the answer to that is the login form.
 */
export async function getCurrentCollegeOrNull() {
  try {
    return await getCurrentCollege();
  } catch (cause) {
    if (isDatabaseUnavailable(cause)) {
      console.error(`[auth] college lookup failed (${databaseErrorCode(cause)})`);
      return null;
    }
    throw cause;
  }
}

/** Same, but sends signed-out visitors to the login screen. */
export async function requireCurrentCollege() {
  const college = await getCurrentCollege();
  if (!college) redirect("/login");
  return college;
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
