import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Set up your site — XITE" };

/**
 * The role/theme/font wizard.
 *
 * This route used to redirect: first to a hardcoded `/editor/mec` — a tenant
 * that has nothing to do with whoever arrived — and then, once that was found,
 * to the visitor's own editor. Both were the same bug in different clothes: the
 * onboarding step existed in the product's description and nowhere in it.
 *
 * `requireCurrentCollege` rather than an optional lookup, because there is
 * nothing to onboard without an account. Somebody who reaches this signed out
 * is sent to sign in, which is where they were going anyway.
 *
 * A college that has already finished goes straight to its editor. That makes
 * the route safe to link to and safe to bookmark, and it is the check that
 * stops a second visit re-asking questions that have been answered — the
 * "skip onboarding unless the user explicitly chooses to edit their setup"
 * half of the requirement. Choosing to change them later is the editor
 * drawer's Colors and Fonts tabs, which write the same two fields.
 */
export default async function OnboardingPage() {
  const college = await requireCurrentCollege();

  if (college.onboardingCompleted) {
    redirect(`/editor/${college.subdomain}`);
  }

  return (
    <OnboardingWizard subdomain={college.subdomain} collegeName={college.name} />
  );
}
