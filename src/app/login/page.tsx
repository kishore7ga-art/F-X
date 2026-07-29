import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";
import { googleEnabled } from "@/lib/auth/google";
import { AUTH_DISABLED } from "@/lib/auth/open-access";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in — XITE" };

function GoogleButton() {
  return (
    <a
      href="/api/auth/google/start"
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-800 transition shadow-xs hover:bg-slate-50 hover:shadow-md hover:border-slate-300"
    >
      <svg viewBox="0 0 18 18" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
        />
        <path
          fill="#FBBC05"
          d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
        />
      </svg>
      <span>Continue with Google</span>
    </a>
  );
}

/**
 * Step 1 of the flow.
 */
export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { error, registered, email } = await searchParams;
  const signInError = typeof error === "string" ? error : null;
  const justRegistered = registered === "1";

  const [college, session] = await Promise.all([
    getCurrentCollegeOrNull(),
    getSession(),
  ]);

  const onwards = "/onboarding";

  const signedIn = Boolean(
    session && !session.userId.startsWith("open-access:"),
  );

  if (!AUTH_DISABLED && college) redirect(onwards);

  if (AUTH_DISABLED) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-100/60 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-900">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2 shadow-md border border-slate-200/80 transition hover:scale-105"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm">
                X
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                XITE Platform
              </span>
            </Link>

            <span className="mt-6 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-blue-700 border border-blue-200">
              Step 1 of 3
            </span>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to XITE
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {signedIn
                ? "You are currently signed in. Manage your college site."
                : "Sign in to claim your college site or set one up right away."}
            </p>
          </div>

          {/* White Theme Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl space-y-6">
            {signInError ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700"
              >
                {signInError}
              </div>
            ) : null}

            {signedIn ? null : googleEnabled ? (
              <GoogleButton />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-500 text-center">
                Google sign-in is not configured on this deployment.
              </div>
            )}

            {signedIn ? null : (
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  or
                </span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            )}

            <Link
              href={onwards}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-extrabold text-white transition hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              <span>{signedIn ? "Continue to Onboarding" : "Continue to Demo Setup"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="text-center text-xs font-medium leading-relaxed text-slate-400 pt-2">
              {signedIn
                ? "Your work is safely tied to your account and saved automatically."
                : "Without signing in, your demo site is accessible via your custom link."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {signInError ? (
        <p
          role="alert"
          className="mx-auto mt-6 max-w-sm rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700"
        >
          {signInError}
        </p>
      ) : null}

      {googleEnabled ? (
        <div className="mx-auto mt-8 max-w-sm px-5">
          <GoogleButton />
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-brand-ink/10" />
            <span className="text-xs font-medium uppercase tracking-widest text-brand-ink/35">
              or
            </span>
            <span className="h-px flex-1 bg-brand-ink/10" />
          </div>
        </div>
      ) : null}

      <CredentialsForm
        mode="login"
        initialEmail={typeof email === "string" ? email : ""}
        notice={
          justRegistered ? "Account created — sign in to continue." : null
        }
      />
    </>
  );
}
