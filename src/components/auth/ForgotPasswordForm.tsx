"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Sparkles, Globe, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    // Simulate API call — replace with real reset endpoint when available
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setSent(true);
    setPending(false);
  }

  return (
    <main className="min-h-screen w-full flex overflow-hidden font-sans text-slate-900 bg-white">
      <div className="w-full min-h-screen flex flex-col lg:flex-row">

        {/* ─── LEFT 40% PANEL: MINIMAL FULL-HEIGHT SHOWCASE ─── */}
        <div className="hidden lg:flex lg:w-[40%] min-h-screen bg-[#F3F4F6] px-8 lg:px-12 py-5 flex-col justify-between relative overflow-hidden">
          {/* Geometric Background Contour Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full" viewBox="0 0 600 600" fill="none">
              <circle cx="100" cy="150" r="320" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="100" cy="150" r="220" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="500" cy="500" r="350" stroke="#CBD5E1" strokeWidth="1" />
            </svg>
          </div>

          <div />

          {/* Testimonial Quote Block */}
          <div className="relative z-10 max-w-lg my-auto">
            <img
              src="/user_avatar.jpg"
              alt="Ilaya Bharathi Profile Picture"
              className="mb-8 h-16 w-16 rounded-full object-cover shadow-md border-2 border-white ring-4 ring-indigo-500/20"
            />
            <blockquote className="text-xl lg:text-2xl font-medium text-slate-800 leading-relaxed tracking-tight">
              &ldquo;The XITE College Portal app makes it easy to manage contacts, deals, sections, and chats in one place. It keeps track of all activities, helping us stay organised and handle daily tasks more efficiently.&rdquo;
            </blockquote>
            <div className="mt-8">
              <p className="text-base font-extrabold text-slate-900">Ilaya Bharathi</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500">Director &amp; Founder / Madras Engineering College</p>
            </div>
            <div className="mt-10 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-slate-900" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            </div>
          </div>

          <div />
        </div>

        {/* ─── RIGHT 60% PANEL: FORGOT PASSWORD FORM ─── */}
        <div className="w-full lg:w-[60%] min-h-screen bg-white px-6 sm:px-10 lg:px-16 py-5 flex flex-col justify-between z-10 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex h-11 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs shrink-0">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <span className="font-black text-2xl tracking-tight text-slate-900 leading-none">
                XITE
              </span>
            </Link>

            <div className="flex items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-6 py-2.5 text-sm font-extrabold text-emerald-700 border border-emerald-200/60 transition hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-xs shadow-2xs active:scale-[0.98] leading-none"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Form Content Body */}
          <div className="mx-auto w-full max-w-md my-auto py-6 sm:py-8">

            {!sent ? (
              <>
                {/* Icon Badge */}
                <div className="flex justify-center mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4285F4]/10 ring-4 ring-[#4285F4]/10">
                    <KeyRound className="h-7 w-7 text-[#4285F4]" />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Forgot Password?
                  </h1>
                  <p className="mt-2.5 text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                    No worries — enter your registered email and we&apos;ll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Email Address<span className="text-blue-600 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@madrascollege.ac.in"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                      />
                    </div>
                  </div>

                  {error && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pending}
                    className="mt-2 w-full rounded-xl bg-[#4285F4] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#4285F4]/20 transition hover:bg-[#3367D6] hover:shadow-lg hover:shadow-[#4285F4]/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{pending ? "Sending reset link…" : "Send Reset Link"}</span>
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 flex items-center justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="flex justify-center mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-4 ring-emerald-100">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Check your email
                  </h1>
                  <p className="mt-2.5 text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                    We&apos;ve sent a password reset link to{" "}
                    <span className="font-bold text-slate-900">{email}</span>.
                    <br />
                    Please check your inbox.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 text-center">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    type="button"
                    onClick={() => { setSent(false); setEmail(""); }}
                    className="underline hover:text-emerald-900"
                  >
                    try again
                  </button>.
                </div>

                <div className="mt-6 flex items-center justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-4">
            <span>&copy; 2026 XITE</span>
            <div className="flex items-center gap-1 hover:text-slate-800">
              <Globe className="h-3.5 w-3.5" />
              <span>ENG &or;</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
