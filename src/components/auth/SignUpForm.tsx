"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Globe, User, Building2, Phone, Sparkles } from "lucide-react";

import { ApiError, requestAccessRequest } from "@/lib/api-client";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g. mageshwari@gmail.com).");
      return;
    }

    /**
     * Ten, matching `MIN_ACCOUNT_PASSWORD_LENGTH` on the API.
     *
     * This said four. The backend has refused anything under ten since the
     * work factor was unified, so every password between four and nine
     * characters passed this check, was sent, and came back rejected — with
     * the form having just told the person it was long enough. Client-side
     * validation that disagrees with the server is worse than none: it moves
     * the error to after the submit and blames the wrong thing.
     */
    if (!password || password.length < 10) {
      setError("Password must be at least 10 characters long.");
      return;
    }

    const cleanMobile = mobile.trim();
    // Mirrors the API's rule rather than approximating it. A number rejected
    // here is a number that would have been rejected there.
    if (!/^\+?[0-9][0-9\s()\-.]*$/.test(cleanMobile) || cleanMobile.length < 7) {
      setError("Please enter a valid mobile number (e.g. +91 98765 43210).");
      return;
    }

    setPending(true);

    try {
      await requestAccessRequest({
        name: name.trim(),
        email: cleanEmail,
        password,
        organization: organization.trim(),
        // A field, not a sentence. This used to be sent as
        // `message: "Website: … | Mobile: …"`, which the admin listing dropped
        // on the floor — so the number an administrator needs in order to
        // verify an application never reached the screen they verify it on.
        phone: cleanMobile,
        website: website.trim(),
      });
      window.location.assign("/login?requested=1");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Could not send your access request. Please check your details and try again.",
      );
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex overflow-hidden font-sans text-slate-900 bg-white">
      {/* Full Screen 50% / 50% Flipped Split Layout */}
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        
        {/* ─── LEFT 40% PANEL: MINIMAL FULL-HEIGHT SHOWCASE (LIGHT GREY CANVAS) ─── */}
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

          {/* Minimal Testimonial Quote Block */}
          <div className="relative z-10 max-w-lg my-auto">
            {/* Colorful Human Avatar Photo */}
            <img
              src="/user_avatar.jpg"
              alt="Ilaya Bharathi Profile Picture"
              className="mb-8 h-16 w-16 rounded-full object-cover shadow-md border-2 border-white ring-4 ring-indigo-500/20"
            />

            {/* Clean Typography Quote */}
            <blockquote className="text-xl lg:text-2xl font-medium text-slate-800 leading-relaxed tracking-tight">
              &ldquo;The XITE College Portal app makes it easy to manage contacts, deals, sections, and chats in one place. It keeps track of all activities, helping us stay organised and handle daily tasks more efficiently.&rdquo;
            </blockquote>

            {/* Author Name & Role */}
            <div className="mt-8">
              <p className="text-base font-extrabold text-slate-900">Ilaya Bharathi</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500">Director & Founder / Madras Engineering College</p>
            </div>

            {/* Pagination Dash Dots Indicator */}
            <div className="mt-10 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-slate-900" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            </div>
          </div>

          <div />
        </div>

        {/* ─── RIGHT 60% PANEL: REQUEST ACCESS FORM (HIGH CONTRAST & PERFECT ALIGNMENT) ─── */}
        <div className="w-full lg:w-[60%] min-h-screen bg-white px-6 sm:px-10 lg:px-16 py-5 flex flex-col justify-between z-10 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex h-11 items-center justify-between gap-4">
            {/* Top-Left Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs shrink-0">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <span className="font-black text-2xl tracking-tight text-slate-900 leading-none">
                XITE
              </span>
            </Link>

            {/* Top-Right Login Pill Button (Light Green) */}
            <div className="flex items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-6 py-2.5 text-sm font-normal text-emerald-700 border border-emerald-200/60 transition hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-xs shadow-2xs active:scale-[0.98] leading-none"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Form Content Body (Centered with optimal width max-w-md) */}
          <div className="mx-auto w-full max-w-md my-auto py-6 sm:py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Request Access
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
                Fill in your institutional details to request portal access.
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Full Name<span className="text-blue-600 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ilaya Bharathi"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                  />
                </div>
              </div>

              {/* 2. Institution Name */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Institution Name<span className="text-blue-600 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Madras Engineering College"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                  />
                </div>
              </div>

              {/* 3. Website */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Website<span className="text-blue-600 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.madrascollege.ac.in"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                  />
                </div>
              </div>

              {/* 4 & 5. Single Line Row: Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Email<span className="text-blue-600 ml-0.5">*</span>
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
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-3 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Mobile<span className="text-blue-600 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 98765 4321"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-3 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Password */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Password<span className="text-blue-600 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
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
              <div className="flex items-center text-xs font-semibold text-slate-700 pt-1">
                <label className="flex items-center gap-2">
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
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* Primary #4285F4 Blue Button: Request Access */}
              <button
                type="submit"
                disabled={pending}
                className="mt-3 w-full rounded-xl bg-[#4285F4] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#4285F4]/20 transition hover:bg-[#3367D6] hover:shadow-lg hover:shadow-[#4285F4]/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{pending ? "Submitting request…" : "Request Access"}</span>
              </button>
            </form>
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
