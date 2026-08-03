import { redirect } from "next/navigation";

import { buildSiteForType } from "@/app/actions/onboarding";
import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Start building — XITE" };

/**
 * Smart router that auto-builds the site and redirects to the editor.
 *
 * - Not logged in / open access → resolves active college
 * - No college type → /onboarding
 * - Already has a site → editor dashboard (/editor/:subdomain)
 * - No site yet → auto-build, then editor dashboard
 */
export default async function StartPage() {
  const college = await requireCurrentCollege();

  if (!college.collegeType) {
    redirect("/onboarding");
  }

  // If the site is already built, go straight to the editor
  if (college.templateId) {
    redirect(`/editor/${college.subdomain}`);
  }

  // Auto-build the site and redirect to editor
  try {
    await buildSiteForType();
  } catch {
    redirect(`/editor/${college.subdomain}`);
  }
}
