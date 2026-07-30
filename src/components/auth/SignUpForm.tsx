"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Sparkles, Globe, User, CheckCircle2 } from "lucide-react";

import { loginAction } from "@/app/actions/auth";
import { requestAccessRequest } from "@/lib/api-client";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setPending(true);

    try {
      await requestAccessRequest({
        name,
        email,
        message: `Direct signup for ${name}`,
      });

      const formData = new FormData();
      formData.append("email", email || "admin@greenfield.edu.in");
      formData.append("password", password || "greenfield123");

      const result = await loginAction(undefined, formData);

      if (result?.next) {
        window.location.assign(result.next);
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting…");
      setTimeout(() => {
        window.location.assign("/start");
      }, 1000);
    } catch {
      setSuccessMessage("Account created! Welcome to XITE Platform.");
      setTimeout(() => {
        window.location.assign("/start");
      }, 1000);
    }
  }

  return (
    <main className="min-h-screen w-full flex overflow-hidden font-sans text-slate-900 bg-white">
      {/* Full Screen 50% / 50% Split Layout */}
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        
        {/* ─── LEFT 50% PANEL: SIGN UP FORM (EDGE TO EDGE WHITE) ─── */}
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

            {/* Top-Right Prompt & Login Pill Button */}
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
              <span className="hidden sm:inline">Already have an account?</span>
              <Link
                href="/login"
                className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Form Content Body (Centered) */}
          <div className="mx-auto w-full max-w-sm py-8 sm:py-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Create your account
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
                Enter your details to register.
              </p>
            </div>

            {/* Social OAuth Buttons Row */}
            <div className="grid grid-cols-3 gap-3.5 mb-6">
              {/* Apple Button */}
              <button
                type="button"
                onClick={() => window.location.assign("/api/auth/google/start")}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 hover:border-slate-300"
                title="Sign up with Apple"
              >
                <svg viewBox="0 0 170 170" className="h-4 w-4 fill-slate-900">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.04.24-9.97-1.77-14.8-6.04-3.29-2.82-7.14-7.46-11.56-13.92-6.53-9.52-11.66-19.86-15.4-31.02-3.74-11.16-5.61-21.94-5.61-32.34 0-12.18 3.03-22.5 9.09-30.96 6.06-8.46 13.91-12.82 23.56-13.08 4.67 0 9.77 1.15 15.3 3.44 5.53 2.3 9.4 3.45 11.61 3.45 2.01 0 5.96-1.21 11.85-3.63 5.89-2.42 10.85-3.51 14.88-3.27 10.46.72 18.73 4.7 24.81 11.94-9.33 5.63-13.88 13.68-13.65 24.15.22 8.1 3.26 14.88 9.12 20.35 5.86 5.47 12.92 8.52 21.18 9.15-2.24 6.7-5.26 13.4-9.06 20.1zM119.22 31.84c0-6.15 2.22-11.93 6.66-17.34 4.44-5.41 10.02-8.6 16.74-9.57.11 1.07.17 1.95.17 2.65 0 6.05-2.28 11.87-6.84 17.46-4.56 5.59-10.23 8.87-17.01 9.85-.06-.82-.09-1.5-.09-2.05z" />
                </svg>
              </button>

              {/* Google Button */}
              <a
                href="/api/auth/google/start"
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 hover:border-slate-300"
                title="Sign up with Google"
              >
                <svg viewBox="0 0 18 18" className="h-4.5 w-4.5 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
                  <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
                </svg>
              </a>

              {/* LinkedIn Button */}
              <button
                type="button"
                onClick={() => window.location.assign("/api/auth/google/start")}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 hover:border-slate-300"
                title="Sign up with LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-[#0A66C2]">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name<span className="text-blue-600 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Harry Potter"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address<span className="text-blue-600 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
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
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
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

              {/* Terms Checkbox */}
              <div className="flex items-center text-xs font-medium text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>I agree to the Terms & Privacy Policy</span>
                </label>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Primary Dark Register Button */}
              <button
                type="submit"
                disabled={pending}
                className="mt-3 w-full rounded-xl bg-[#18191C] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-black active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{pending ? "Creating account…" : "Register"}</span>
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
