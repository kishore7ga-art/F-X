import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/SignUpForm";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign up — XITE" };

export default async function RequestAccessPage() {
  const college = await getCurrentCollegeOrNull();
  if (college) {
    redirect(college.collegeType ? "/start" : "/onboarding");
  }

  return <SignUpForm />;
}
