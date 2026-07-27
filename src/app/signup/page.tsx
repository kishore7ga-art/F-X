import { redirect } from "next/navigation";

import { signup } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const college = await getCurrentCollege();
  if (college) {
    redirect(college.collegeType ? "/start" : "/onboarding");
  }

  return (
    <AuthForm
      title="Create your college account"
      subtitle="Pick a template next, then edit your content."
      action={signup}
      submitLabel="Create account"
      fields={[
        {
          name: "collegeName",
          label: "College name",
          placeholder: "Greenfield Institute of Technology",
        },
        {
          name: "subdomain",
          label: "Subdomain",
          placeholder: "greenfield",
          hint: "Your site will live at /site/your-subdomain",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          autoComplete: "email",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "new-password",
          hint: "At least 8 characters",
        },
      ]}
      footer={{
        text: "Already have an account?",
        linkLabel: "Sign in",
        href: "/login",
      }}
    />
  );
}
