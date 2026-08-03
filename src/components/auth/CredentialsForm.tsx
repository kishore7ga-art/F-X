"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

import { loginAction } from "@/app/actions/auth";

export function CredentialsForm({
  notice,
  initialEmail = "",
}: {
  notice?: string | null;
  initialEmail?: string;
  showGoogleButton?: boolean;
}) {
  const [email, setEmail] = useState(initialEmail || "kishore7ga@gmail.com");
  const [password, setPassword] = useState("kishore@7");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (retryCountdown === null || retryCountdown <= 0) return;
    const timer = setInterval(() => {
      setRetryCountdown((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCountdown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  async function handleDemoFill() {
    setEmail("kishore7ga@gmail.com");
    setPassword("kishore@7");
    setError(null);
    setPending(true);

    try {
      const formData = new FormData();
      formData.set("email", "kishore7ga@gmail.com");
      formData.set("password", "kishore@7");
      const result = await loginAction(undefined, formData);
      if (result?.next) {
        window.location.assign(result.next);
      } else {
        window.location.assign("/editor/greenfield");
      }
    } catch {
      window.location.assign("/editor/greenfield");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await loginAction(undefined, formData);
      if (result?.error) {
        const isRateLimit =
          result.error.toLowerCase().includes("too many") ||
          result.error.toLowerCase().includes("429");

        if (isRateLimit) {
          setRetryCountdown(300);
          setError("Too many login attempts. Please try again in 5:00 minutes.");
        } else {
          setError(result.error);
        }
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
    <main className="min-h-screen w-full bg-[#030712] text-white flex flex-col items-center justify-center p-6 relative overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black border border-white/20 p-1 shadow-md group-hover:scale-105 transition-transform">
            <img src="/xite-logo.png" alt="XITE Logo" className="h-full w-full object-contain rounded-md" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">XITE</span>
        </Link>

        <Link
          href="/request-access"
          className="text-xs font-extrabold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-4 py-2 rounded-full transition-all"
        >
          Request Access
        </Link>
      </header>

      {/* Main Centered Login Card (Matches Screenshot 1 UI) */}
      <div className="w-full max-w-lg z-10 flex flex-col items-center my-auto pt-16 pb-8">
        
        {/* Step Badge Pill */}
        <div className="inline-flex items-center gap-2 bg-[#091329] border border-blue-500/30 text-blue-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Step 1 of 1 — Institution Profile</span>
        </div>

        {/* Big Bold White Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight text-center mb-3">
          Login to Your Account
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-neutral-400 font-medium text-center max-w-md mb-8 leading-relaxed">
          Select your institution credentials to personalize your platform features, workspace, and visual editor.
        </p>

        {/* Form Container Card */}
        <div className="w-full bg-[#090d16]/90 border border-blue-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-5">
          
          {/* Demo Autofill Quick Button */}
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full flex items-center justify-between gap-2 rounded-2xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/50 px-4 py-3 text-left transition group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
              <span className="text-xs font-extrabold text-blue-200 truncate">
                Auto-fill Account Credentials
              </span>
            </div>
            <span className="text-xs font-black text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0">
              Fill →
            </span>
          </button>

          {notice && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/50 px-4 py-3 text-xs font-bold text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-950/60 p-4 text-xs font-bold text-red-300">
              {retryCountdown
                ? `Too many login attempts. Please try again in ${formatCountdown(retryCountdown)} minutes.`
                : error}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-neutral-300 uppercase tracking-wider mb-2">
                Email Address <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-500">
                  <Mail className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kishore7ga@gmail.com"
                  className="w-full rounded-2xl border border-neutral-800 bg-[#040711] pl-11 pr-4 py-3.5 text-xs sm:text-sm font-mono text-white outline-none transition placeholder:text-neutral-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-300 uppercase tracking-wider mb-2">
                Password <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-500">
                  <Lock className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-neutral-800 bg-[#040711] pl-11 pr-11 py-3.5 text-xs sm:text-sm font-mono text-white outline-none transition placeholder:text-neutral-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
                <span>Keep me logged in</span>
              </label>
            </div>

            {/* Glowing CTA Button (Matches Screenshot 1) */}
            <button
              type="submit"
              disabled={pending || retryCountdown !== null}
              className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30 disabled:opacity-50"
            >
              <span>
                {pending
                  ? "Logging in…"
                  : retryCountdown
                    ? `Try again in ${formatCountdown(retryCountdown)}`
                    : "Continue with Login"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

      {/* Footer Text (Matches Screenshot 1) */}
      <footer className="text-center text-xs text-neutral-500 font-mono mt-auto pt-6 z-10">
        © 2026 XITE SaaS Platform • Secure Institutional Control
      </footer>
    </main>
  );
}
