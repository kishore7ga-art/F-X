"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

import { ApiError, loginRequest, signupRequest } from "@/lib/api-client";

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

  function handleDemoFill() {
    setEmail("admin@greenfield.edu.in");
    setPassword("greenfield123");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (isSignup) {
        await signupRequest(email, password);
        router.push(`/login?registered=1&email=${encodeURIComponent(email)}`);
      } else {
        const { next } = await loginRequest(email, password);
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

          <h1 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {isSignup
              ? "Sign up to create and publish your official college website."
              : "Sign in to manage your college website & pages."}
          </p>
        </div>

        {/* Card Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          {/* Quick Demo Autofill Pill */}
          {!isSignup && (
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full mb-6 flex items-center justify-between gap-2 rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-left transition hover:bg-blue-100/80 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-900 truncate">
                    Fill Demo Admin Login
                  </p>
                  <p className="text-[11px] font-medium text-blue-700 truncate">
                    admin@greenfield.edu.in
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                Auto-fill →
              </span>
            </button>
          )}

          {notice ? (
            <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{notice}</span>
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="admin@college.edu.in"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={isSignup ? 8 : undefined}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                />
              </div>
              {isSignup ? (
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                  Must be at least 8 characters long
                </p>
              ) : null}
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700"
              >
                {error}
              </div>
            ) : null}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-extrabold text-white transition-all duration-200 hover:bg-black hover:shadow-lg disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              <span>
                {pending
                  ? "Please wait…"
                  : isSignup
                    ? "Create account"
                    : "Sign in to Dashboard"}
              </span>
              {!pending && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Toggle Footer */}
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs font-semibold text-slate-500">
            {isSignup ? "Already have an account? " : "New to XITE Platform? "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="font-extrabold text-blue-600 hover:underline hover:text-blue-700 ml-1"
            >
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
