import { redirect } from "next/navigation";

import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

/**
 * Sends whoever lands here wherever they actually belong.
 *
 * This redirected to `/editor/mec` — a hardcoded tenant with nothing to do with
 * the person arriving. Signing in and visiting this route put a college owner
 * inside a *different college's* URL. Their session still scoped the data, so
 * nothing of anyone else's was readable or writable, but the page rendered
 * under someone else's address, which a multi-tenant product should never do.
 *
 * The onboarding branch is not a special case for new accounts — it is the
 * same question every entry point has to answer, asked in one place. A tenant
 * who has not finished the wizard has no theme and no font, and the editor is
 * the one screen that cannot render that state usefully.
 */
export default async function StartPage() {
  const college = await getCurrentCollegeOrNull();

  if (!college) redirect("/login");
  redirect(college.onboardingCompleted ? `/editor/${college.subdomain}` : "/onboarding");
}
