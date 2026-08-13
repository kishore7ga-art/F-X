import { redirect } from "next/navigation";

import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";
import { googleEnabled } from "@/lib/auth/google";
import { AUTH_DISABLED } from "@/lib/auth/open-access";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in — XITE" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;
  const registered = params.registered;
  const requested = params.requested;
  const email = typeof params.email === "string" ? params.email : "";
  const force = params.force;

  const signInError = error;
  const justRegistered = registered === "1";
  const justRequested = requested === "1";

  const college = await getCurrentCollegeOrNull();

  if (AUTH_DISABLED) {
    redirect("/editor/mec");
  }

  if (college && force !== "1") {
    redirect(`/editor/${college.subdomain || "greenfield"}`);
  }

  return (
    <CredentialsForm
      initialEmail={email}
      showGoogleButton={googleEnabled}
      notice={
        signInError
          ? signInError
          : justRequested
            ? "Access request submitted! Super Admin will review and activate your account soon."
            : justRegistered
              ? "Account created — sign in to continue."
              : null
      }
    />
  );
}
