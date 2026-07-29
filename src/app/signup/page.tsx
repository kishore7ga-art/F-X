import { redirect } from "next/navigation";

import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Create your account — XITE" };

export default async function SignupPage() {
  const college = await getCurrentCollegeOrNull();
  if (college) {
    redirect(college.collegeType ? "/start" : "/onboarding");
  }

  return <CredentialsForm mode="signup" />;
}
