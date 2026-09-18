import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";

export const dynamic = "force-dynamic";

export const metadata = { title: "Set up your site — XITE" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const isEditing = params.edit === "1" || params.force === "1";

  const college = await getCurrentCollegeOrNull();

  // If in preview or test mode and not logged in, provide a graceful stand-in
  const subdomain = college?.subdomain || "greenfield";
  const collegeName = college?.name || "Greenfield University";

  // If already onboarded and not explicitly re-editing, jump straight to editor
  if (college?.onboardingCompleted && !isEditing) {
    redirect(`/editor/${subdomain}`);
  }

  return (
    <>
      <SectionRuntimeAssets />
      <OnboardingWizard
        subdomain={subdomain}
        collegeName={collegeName}
        initialCollegeType={college?.collegeType}
      />
    </>
  );
}
