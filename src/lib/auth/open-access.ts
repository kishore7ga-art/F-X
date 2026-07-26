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
export const AUTH_DISABLED = process.env.AUTH_DISABLED === "true";

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
const SUBDOMAIN = process.env.OPEN_ACCESS_SUBDOMAIN || "main";
const NAME = process.env.OPEN_ACCESS_COLLEGE_NAME || "My College";

export async function openAccessCollege() {
  // isDemo excluded deliberately: the seeded template showcases are older than
  // any real college, so "oldest" alone would hand the first visitor a demo
  // site to edit and quietly deface the gallery.
  const existing = await prisma.college.findFirst({
    where: { isDemo: false },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  // upsert, not create: two requests arriving together on a cold database would
  // otherwise race and one would fail the unique constraint on subdomain.
  return prisma.college.upsert({
    where: { subdomain: SUBDOMAIN },
    update: {},
    create: { name: NAME, subdomain: SUBDOMAIN, status: "DRAFT" },
  });
}
