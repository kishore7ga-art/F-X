"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError, loginRequest, signupRequest } from "@/lib/api-client";

/**
 * Sign in and sign up, as real API calls to the backend.
 *
 * The previous version was a Server Action, which meant the browser POSTed to
 * `/login` on this origin with an RSC body — not something you can read in the
 * Network tab as a request, and not something that can be sent to another
 * service. This posts to `NEXT_PUBLIC_API_BASE_URL`, so signing in is one
 * inspectable `POST /api/v1/auth/login` like everything else.
 */
export function CredentialsForm({
  mode,
  notice,
  initialEmail = "",
}: {
  mode: "login" | "signup";
  notice?: string | null;
  initialEmail?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (isSignup) {
        await signupRequest(email, password);
        // Straight to sign-in, carrying the address so it is not retyped. The
        // password is proved to work before it matters.
        router.push(`/login?registered=1&email=${encodeURIComponent(email)}`);
      } else {
        const { next } = await loginRequest(email, password);

        /**
         * A full page load, not a client navigation.
         *
         * The session was just set by another origin, and the destination is
         * guarded server-side. `router.replace` can answer from the router
         * cache — an RSC payload fetched while there was no session — which
         * renders the signed-out version of a page you are now signed in to,
         * or bounces straight back to /login. Calling `refresh` afterwards
         * cannot help: the navigation has already happened.
         *
         * Going through the browser guarantees one request that carries the
         * new cookie, which is exactly what the guard needs to see.
         */
        window.location.assign(next);
        return;
      }
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status !== 0
          ? cause.message
          : "Could not reach the server. Check your connection and try again.",
      );
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">
        {isSignup ? "Create your account" : "Sign in"}
      </h1>
      <p className="mt-1 text-sm text-black/55">
        {isSignup
          ? "Email and password. You can name the college in the next step."
          : "Manage your college website."}
      </p>

      {notice ? (
        <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
          {notice}
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-black/60">Email</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-black/60">Password</span>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            // Enforced by the backend too; here it is only to catch it early.
            minLength={isSignup ? 8 : undefined}
            required
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
          />
          {isSignup ? (
            <span className="mt-1 block text-xs text-black/45">
              At least 8 characters
            </span>
          ) : null}
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {pending
            ? "Please wait…"
            : isSignup
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black/55">
        {isSignup ? "Already have an account? " : "No account yet? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-black underline"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </main>
  );
}
