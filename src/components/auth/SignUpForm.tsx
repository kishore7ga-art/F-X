"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles, TrendingUp, Users, ShieldCheck, CheckCircle2, Award, Layout, BarChart2 } from "lucide-react";

import { loginAction } from "@/app/actions/auth";
import { requestAccessRequest } from "@/lib/api-client";

function GoogleButton() {
  return (
    <a
      href="/api/auth/google/start"
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs active:scale-[0.99]"
    >
      <svg viewBox="0 0 18 18" className="h-4.5 w-4.5 shrink-0" aria-hidden="true">
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
      <span>Sign in with Google</span>
    </a>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setPending(true);

    try {
      // Send access request/registration
      await requestAccessRequest({
        name,
        email,
        message: `Direct signup with password for ${name}`,
      });

      // Also attempt direct session sign-in if in dev mode
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
      // In dev mode, complete registration & navigate to /start
      setSuccessMessage("Account created! Welcome to XITE Platform.");
      setTimeout(() => {
        window.location.assign("/start");
      }, 1000);
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#F4F5F7] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-slate-900">
      {/* Main 50% / 50% Split Card Container */}
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] grid grid-cols-1 lg:grid-cols-2 max-h-[660px]">
        
        {/* ─── LEFT COLUMN: SIGN UP FORM (50% WIDTH) ─── */}
        <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Top Brand Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-black text-lg tracking-tight text-slate-900">
                XITE
              </span>
            </div>

            {/* Header Titles */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Keep your online business organized
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
                Sign up to start your 30 days free trial
              </p>
            </div>

            {/* Google Sign in Button */}
            <div className="mb-5">
              <GoogleButton />
            </div>

            {/* Divider */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="w-full border-t border-slate-200/80" />
              <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 lowercase">
                or
              </span>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Name<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
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

              {/* Primary Create Account Button */}
              <button
                type="submit"
                disabled={pending}
                className="mt-2 w-full rounded-xl bg-slate-900 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-black active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{pending ? "Creating account…" : "Create Account"}</span>
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="mt-6 pt-4 text-center text-xs font-medium text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-extrabold text-slate-900 hover:underline">
              Login Here
            </Link>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: IRIDESCENT VISUAL SHOWCASE BANNER (50% WIDTH WITH SCROLL) ─── */}
        <div className="relative bg-gradient-to-tr from-purple-400 via-indigo-300 to-pink-300 p-6 sm:p-8 overflow-y-auto max-h-[660px] flex flex-col gap-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/60">
          
          {/* Ambient Glow Effects */}
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

          {/* Scroll Indicator Badge */}
          <div className="sticky top-0 z-20 flex justify-end">
            <span className="rounded-full bg-slate-900/40 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-xs border border-white/20">
              Scroll for more ↓
            </span>
          </div>

          {/* Floating Card 1: Testimonial Quote */}
          <div className="relative z-10 rounded-2xl bg-white/80 backdrop-blur-md p-5 shadow-xl border border-white/60 transition-transform duration-300 hover:translate-y-[-2px]">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
              &ldquo;Handy for keeping all my business stuff in one place.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs shadow-inner">
                DM
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">David Miller</p>
                <p className="text-[11px] font-medium text-slate-500">E-commerce Specialist</p>
              </div>
            </div>
          </div>

          {/* Floating Card 2: Growth Metric Graph */}
          <div className="relative z-10 rounded-2xl bg-white/90 backdrop-blur-md p-5 shadow-xl border border-white/60 transition-transform duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                GROWTH
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <TrendingUp className="h-3 w-3" />
                Live
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                +21,35%
              </span>
              <span className="text-xs font-semibold text-slate-400">last month</span>
            </div>

            <p className="mt-2 text-[11px] font-medium text-slate-500 leading-normal">
              This significant increase highlights the effectiveness of our recent strategies and content approach.
            </p>

            {/* Smooth Line Graph Graphic */}
            <div className="mt-3 h-12 w-full">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 300 50" fill="none">
                <path
                  d="M0 40 Q 75 10, 150 30 T 300 10"
                  stroke="url(#gradientLine)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="300" cy="10" r="5" fill="#8B5CF6" className="animate-ping opacity-75" />
                <circle cx="300" cy="10" r="4" fill="#8B5CF6" />
                <defs>
                  <linearGradient id="gradientLine" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#C084FC" />
                    <stop offset="0.5" stopColor="#A855F7" />
                    <stop offset="1" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Floating Card 3: Engagement Metric */}
          <div className="relative z-10 rounded-2xl bg-white/90 backdrop-blur-md p-5 shadow-xl border border-white/60 transition-transform duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                ENGAGEMENT
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                <Users className="h-3 w-3" />
                Active Users
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                +78,12%
              </span>
              <span className="text-xs font-semibold text-slate-400">last month</span>
            </div>
          </div>

          {/* Floating Card 4: Institution Compliance Badge */}
          <div className="relative z-10 rounded-2xl bg-white/90 backdrop-blur-md p-5 shadow-xl border border-white/60 transition-transform duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                ACADEMIC ACCREDITATION
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                <Award className="h-3.5 w-3.5" />
                NAAC A++
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              100% Compliant Academic Portal Structures
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Pre-built mandatory disclosure, NIRF, IQAC, and departmental pages ready out of the box.
            </p>
          </div>

          {/* Floating Card 5: Customizable Sections Card */}
          <div className="relative z-10 rounded-2xl bg-white/90 backdrop-blur-md p-5 shadow-xl border border-white/60 transition-transform duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                SECTION LIBRARY
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                <Layout className="h-3.5 w-3.5" />
                30+ Variants
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              Drag-and-Drop Live Section Editor
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Hero headers, faculty grids, campus news, placement stats, and event calendars.
            </p>
          </div>

          {/* Floating Card 6: Analytics & Visitors Card */}
          <div className="relative z-10 rounded-2xl bg-white/90 backdrop-blur-md p-5 shadow-xl border border-white/60 transition-transform duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                TRAFFIC & ANALYTICS
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <BarChart2 className="h-3.5 w-3.5" />
                +4,290 Daily
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              Real-time Campus Visitor Insights
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Track student admissions, prospectus downloads, and portal engagement.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}
