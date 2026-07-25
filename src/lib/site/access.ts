import { CollegeStatus } from "@/generated/prisma/enums";
import { getSession } from "@/lib/auth/session";
import type { SitePageData } from "@/lib/site/queries";

export type SiteAccess =
  | { allowed: true; isOwnerPreview: boolean }
  | { allowed: false; isOwnerPreview: false };

/**
 * Who may see a college's public URL.
 *
 * Published sites are open to everyone. A draft is invisible to the public,
 * but its own signed-in college can still view it — otherwise the editor's
 * "View site" button would 404 before a site is ever published.
 */
export async function resolveSiteAccess(
  data: SitePageData,
): Promise<SiteAccess> {
  if (data.college.status === CollegeStatus.PUBLISHED) {
    return { allowed: true, isOwnerPreview: false };
  }

  const session = await getSession();
  if (session?.collegeId === data.college.id) {
    return { allowed: true, isOwnerPreview: true };
  }

  return { allowed: false, isOwnerPreview: false };
}
