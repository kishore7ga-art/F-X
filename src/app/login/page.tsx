import Link from "next/link";
import { redirect } from "next/navigation";

import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentCollege } from "@/lib/auth/current";
import { DEMO_LOGIN, demoLoginEnabled } from "@/lib/auth/demo";
import { googleEnabled } from "@/lib/auth/google";
import { AUTH_DISABLED } from "@/lib/auth/open-access";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in — XITE" };

function GoogleButton() {
  return (
    <a
      href="/api/auth/google/start"
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-ink/15 bg-white px-5 py-3.5 text-[15px] font-semibold text-brand-ink transition hover:-translate-y-0.5 hover:border-brand-ink/40 hover:shadow-md"
    >
      <svg viewBox="0 0 18 18" className="h-5 w-5" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
      </svg>
      Continue with Google
    </a>
  );
}

/**
 * Step 1 of the flow.
 *
 * In open-access mode this used to redirect straight past itself, which meant
 * the Google button existed and was never once rendered. It shows now — with
 * the way past it stated plainly, because signing in is optional here and
 * hiding that would make the screen look like a wall.
 */
export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { error } = await searchParams;
  const signInError = typeof error === "string" ? error : null;

  const [college, session] = await Promise.all([
    getCurrentCollege(),
    getSession(),
  ]);

  // Always step 2, never a shortcut past it. Sending an already-onboarded
  // college straight to /start meant the middle step existed only for people
  // who had never used the product — and disappeared the moment they had.
  // /onboarding prefills what it already knows, so passing through costs a
  // returning visitor one click and keeps the flow the same every time.
  const onwards = "/onboarding";

  // A real identity, not the shared open-access one. Nothing left to ask.
  const signedIn = Boolean(
    session && !session.userId.startsWith("open-access:"),
  );

  // Only real auth redirects away. In open-access this page is step 1 of a
  // three-step flow, and a step that sometimes silently isn't there is not a
  // flow — it skipped anyone already carrying a session, which after one
  // successful sign-in is everyone.
  if (!AUTH_DISABLED && college) redirect(onwards);

  if (AUTH_DISABLED) {
    return (
      <main className="min-h-dvh bg-white">
        <div className="mx-auto max-w-md px-5 py-16 sm:py-24">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-ink/35">
            Step 1 of 3
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            Sign in to XITE
          </h1>
          <p className="mt-3 text-base text-brand-ink/55">
            {signedIn
              ? "You are signed in. This site is yours."
              : "Sign in so the site is yours, or carry on and set one up without an account."}
          </p>

          {signInError ? (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {signInError}
            </p>
          ) : null}

          <div className="mt-8 space-y-4">
            {signedIn ? null : googleEnabled ? (
              <GoogleButton />
            ) : (
              <p className="rounded-xl border border-brand-ink/10 bg-brand-mist px-4 py-3 text-sm text-brand-ink/50">
                Google sign-in is not configured on this deployment.
              </p>
            )}

            {signedIn ? null : (
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-brand-ink/10" />
                <span className="text-xs font-medium uppercase tracking-widest text-brand-ink/35">
                  or
                </span>
                <span className="h-px flex-1 bg-brand-ink/10" />
              </div>
            )}

            <Link
              href={onwards}
              className="flex w-full items-center justify-center rounded-xl bg-brand-ink px-5 py-3.5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand"
            >
              {signedIn ? "Continue" : "Continue without signing in"}
            </Link>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-brand-ink/40">
            {signedIn
              ? "Your work is tied to your Google account and will be here next time."
              : "Without an account the site is open to anyone with the link. Signing in with Google claims it as yours."}
          </p>
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

      <AuthForm
        title="Sign in"
        subtitle="Manage your college website."
        action={login}
        submitLabel="Sign in"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
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
    </>
  );
}
