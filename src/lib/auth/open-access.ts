import { prisma } from "@/lib/db";

/**
 * Open-access mode: no sign-in, every visitor lands straight in the editor.
 *
 * Intended for a single-tenant install where the deployment itself is the
 * access control — an internal network, a staging box, or a site whose only
 * operator is the person who deployed it.
 *
 * This is a real removal of authentication, not a relaxation of it. With it on,
 * anyone who can reach the URL can edit and publish the site, and unpublished
 * drafts are visible to them too, because every request is treated as the
 * owner's. Leave it off for anything reachable from the public internet that
 * you do not want strangers editing.
 */
export const AUTH_DISABLED = process.env.AUTH_DISABLED !== "false";

/**
 * The college everyone edits in open-access mode.
 *
 * Prefer whatever already exists — an install that has been signed up to
 * normally keeps working when the flag is flipped on, rather than stranding its
 * content behind a second, empty college. Only a genuinely empty database gets
 * one created, so the first visit lands somewhere usable instead of a redirect
 * loop between `/` and `/login`.
 */
// `||`, not `??`: a dashboard that saves an empty value would otherwise create
// a college with an empty subdomain, whose editor URL is unreachable.
const SUBDOMAIN = process.env.OPEN_ACCESS_SUBDOMAIN || "greenfield";
const NAME = process.env.OPEN_ACCESS_COLLEGE_NAME || "Greenfield University";

export async function openAccessCollege(targetSubdomain?: string) {
  const sub = targetSubdomain || SUBDOMAIN;

  const exact = await prisma.college.findUnique({
    where: { subdomain: sub },
  });
  if (exact) return exact;

  const existing = await prisma.college.findFirst({
    where: { isDemo: false, templateId: { not: null } },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  const fallback = await prisma.college.findFirst({
    where: { isDemo: false },
    orderBy: { createdAt: "asc" },
  });
  if (fallback) return fallback;

  return prisma.college.upsert({
    where: { subdomain: sub },
    update: {},
    create: { name: NAME, subdomain: sub, status: "DRAFT" },
  });
}
