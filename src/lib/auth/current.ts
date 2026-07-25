import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/** The signed-in user's college, or null when signed out. */
export async function getCurrentCollege() {
  const session = await getSession();
  if (!session) return null;

  return prisma.college.findUnique({ where: { id: session.collegeId } });
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
