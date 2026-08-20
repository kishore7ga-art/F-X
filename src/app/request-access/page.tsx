import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/SignUpForm";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign up — XITE" };

export default async function RequestAccessPage() {
  // Somebody already signed in does not need to ask for access. Straight to
  // their own editor — this used to hop through /start or /onboarding, both of
  // which redirected to a hardcoded `/editor/mec`.
  const college = await getCurrentCollegeOrNull();
  if (college) {
    redirect(`/editor/${college.subdomain}`);
  }

  return <SignUpForm />;
}
