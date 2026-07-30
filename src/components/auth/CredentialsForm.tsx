"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Sparkles, Globe, ShieldCheck } from "lucide-react";

import { loginAction } from "@/app/actions/auth";

export function CredentialsForm({
  notice,
  initialEmail = "",
}: {
  notice?: string | null;
  initialEmail?: string;
  showGoogleButton?: boolean;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleDemoFill() {
    setEmail("admin@greenfield.edu.in");
    setPassword("greenfield123");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await loginAction(undefined, formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
      } else if (result?.next) {
        window.location.assign(result.next);
      }
    } catch {
      setError("Sign-in failed. Check your credentials and try again.");
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex overflow-hidden font-sans text-slate-900 bg-white">
      {/* Full Screen 50% / 50% Split Layout */}
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        
        {/* ─── LEFT 50% PANEL: SIGN IN FORM (EDGE TO EDGE WHITE) ─── */}
        <div className="w-full lg:w-1/2 min-h-screen bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between z-10">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-4">
            {/* Top-Left Brand Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-black text-2xl tracking-tight text-slate-900">
                XITE
              </span>
            </Link>

            {/* Top-Right Prompt & Register Pill Button */}
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
              <span className="hidden sm:inline">Don&apos;t have an account?</span>
              <Link
                href="/signup"
                className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Form Content Body (Centered) */}
          <div className="mx-auto w-full max-w-sm py-8 sm:py-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Login to your account
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
                Enter your details to login.
              </p>
            </div>

            {/* Demo Autofill Quick Pill */}
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full mb-5 flex items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-left transition hover:bg-blue-100/80 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-blue-900 truncate">
                  Auto-fill Demo Admin Credentials
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                Fill →
              </span>
            </button>

            {notice ? (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{notice}</span>
              </div>
            ) : null}

            {/* Form Fields */}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address<span className="text-blue-600 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="harrypotter@crm.com"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password<span className="text-blue-600 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Keep me logged in</span>
                </label>
                <a href="#" className="font-semibold text-slate-600 hover:text-slate-900 underline">
                  Forgot password?
                </a>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* Primary Dark Login Button */}
              <button
                type="submit"
                disabled={pending}
                className="mt-3 w-full rounded-xl bg-[#18191C] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-black active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{pending ? "Logging in…" : "Login"}</span>
              </button>
            </form>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 pt-4 border-t border-slate-100">
            <span>&copy; 2026 XITE</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600">
              <Globe className="h-3.5 w-3.5" />
              <span>ENG &or;</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT 50% PANEL: MINIMAL FULL-HEIGHT SHOWCASE (LIGHT GREY CANVAS) ─── */}
        <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#F3F4F6] p-12 lg:p-20 flex-col justify-between relative overflow-hidden">
          {/* Geometric Background Contour Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full" viewBox="0 0 600 600" fill="none">
              <circle cx="550" cy="150" r="320" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="550" cy="150" r="220" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="80" cy="500" r="350" stroke="#CBD5E1" strokeWidth="1" />
            </svg>
          </div>

          <div />

          {/* Minimal Testimonial Quote Block */}
          <div className="relative z-10 max-w-lg my-auto">
            {/* Author Avatar Circle */}
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white font-extrabold text-xl shadow-lg border-2 border-white">
              HP
            </div>

            {/* Clean Typography Quote */}
            <blockquote className="text-xl lg:text-2xl font-medium text-slate-800 leading-relaxed tracking-tight">
              &ldquo;The XITE College Portal app makes it easy to manage contacts, deals, sections, and chats in one place. It keeps track of all activities, helping us stay organised and handle daily tasks more efficiently.&rdquo;
            </blockquote>

            {/* Author Name & Role */}
            <div className="mt-8">
              <p className="text-base font-extrabold text-slate-900">Harry Potter</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500">CEO / Filllo Design Agency</p>
            </div>

            {/* Pagination Dash Dots Indicator */}
            <div className="mt-10 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-slate-900" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            </div>
          </div>

          <div />
        </div>

      </div>
    </main>
  );
}
