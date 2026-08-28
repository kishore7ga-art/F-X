import { redirect } from "next/navigation";

import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

/**
 * A legacy entry point, kept only so old links do not 404.
 *
 * It redirected to a hardcoded `/editor/mec`. Every visitor — signed in as
 * someone else, or not signed in at all — was sent into one particular
 * tenant's URL. The session still scoped every read and write, so no other
 * college's data was reachable, but the page rendered under an address that
 * belonged to somebody else, and an anonymous visitor was sent to an editor
 * rather than to sign-in.
 *
 * There is no "choose a type" step in the product any more; the questions that
 * would have lived here are the onboarding wizard's. So this resolves to
 * wherever the visitor actually belongs and holds no opinion of its own.
 */
export default async function ChooseTypePage() {
  const college = await getCurrentCollegeOrNull();

  if (!college) redirect("/login");
  redirect(college.onboardingCompleted ? `/editor/${college.subdomain}` : "/onboarding");
}
