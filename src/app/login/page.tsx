import { redirect } from "next/navigation";

import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";
import { googleEnabled } from "@/lib/auth/google";
import { AUTH_DISABLED } from "@/lib/auth/open-access";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in — XITE" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { error, registered, email, force } = await searchParams;
  const signInError = typeof error === "string" ? error : null;
  const justRegistered = registered === "1";

  const college = await getCurrentCollegeOrNull();

  if (AUTH_DISABLED) {
    redirect("/editor/mec");
  }

  if (college && force !== "1") {
    redirect(`/editor/${college.subdomain || "greenfield"}`);
  }

  return (
    <CredentialsForm
      initialEmail={typeof email === "string" ? email : ""}
      showGoogleButton={googleEnabled}
      notice={
        signInError
          ? signInError
          : justRegistered
            ? "Account created — sign in to continue."
            : null
      }
    />
  );
}
