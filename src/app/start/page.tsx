import { redirect } from "next/navigation";

import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

/**
 * Sends whoever lands here to their own editor.
 *
 * This redirected to `/editor/mec` — a hardcoded tenant that has nothing to do
 * with the person arriving. Signing in and visiting this route put a college
 * owner inside a *different college's* URL. Their session still scoped the data,
 * so nothing of anyone else's was readable or writable, but the page rendered
 * under someone else's address, which is not a thing a multi-tenant product
 * should ever do.
 *
 * Onboarding itself is gone: the two endpoints its Server Actions posted to
 * (`/api/v1/onboarding` and `/api/v1/onboarding/build`) answer 404, nothing
 * referenced the actions, and `destinationFor()` on the API sends every sign-in
 * straight to the editor. Provisioning happens when a Super Admin approves the
 * access request.
 */
export default async function StartPage() {
  const college = await getCurrentCollegeOrNull();
  redirect(college ? `/editor/${college.subdomain}` : "/login");
}
