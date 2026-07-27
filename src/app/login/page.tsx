import { redirect } from "next/navigation";

import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentCollege } from "@/lib/auth/current";
import { DEMO_LOGIN, demoLoginEnabled } from "@/lib/auth/demo";
import { AUTH_DISABLED } from "@/lib/auth/open-access";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const college = await getCurrentCollege();

  // Open-access mode has nothing to sign in to, so this step is a formality it
  // would be dishonest to dress up as a login form: there are no credentials
  // and the "wrong" ones would work just as well. It hands straight on to the
  // step that actually asks something.
  //
  // Turning AUTH_DISABLED off restores the real form below with no code change.
  if (AUTH_DISABLED) {
    redirect(college?.collegeType ? "/start" : "/onboarding");
  }

  if (college) {
    redirect(college.templateId ? `/editor/${college.subdomain}` : "/start");
  }

  return (
    <AuthForm
      title="Sign in"
      subtitle="Manage your college website."
      action={login}
      submitLabel="Sign in"
      fields={[
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
          autoComplete: "current-password",
        },
      ]}
      footer={{
        text: "No account yet?",
        linkLabel: "Create one",
        href: "/signup",
      }}
      // Only sent to the browser when the demo account was actually seeded, so
      // the credentials are absent from the page source everywhere else.
      autofill={
        demoLoginEnabled()
          ? { label: "Fill demo login", values: DEMO_LOGIN }
          : undefined
      }
    />
  );
}
