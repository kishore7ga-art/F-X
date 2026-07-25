import { redirect } from "next/navigation";

import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentCollege } from "@/lib/auth/current";
import { DEMO_LOGIN, demoLoginEnabled } from "@/lib/auth/demo";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const college = await getCurrentCollege();
  if (college) redirect(`/editor/${college.subdomain}`);

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
