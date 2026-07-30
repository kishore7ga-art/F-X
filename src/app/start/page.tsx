import { redirect } from "next/navigation";

import { buildSiteForType } from "@/app/actions/onboarding";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Start building — XITE" };

/**
 * Smart router that auto-builds the site and redirects to the editor.
 *
 * - Not logged in → /request-access
 * - No college type → /onboarding
 * - Already has a site → editor dashboard
 * - No site yet → auto-build, then editor dashboard
 */
export default async function StartPage() {
  const college = await getCurrentCollegeOrNull();
  if (!college) redirect("/request-access");

  if (!college.collegeType) redirect("/onboarding");

  // If the site is already built, go straight to the editor
  if (college.templateId) {
    redirect(`/editor/${college.subdomain}`);
  }

  // Auto-build the site and redirect to editor
  await buildSiteForType();
}
