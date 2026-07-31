"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Globe,
  Award,
  KeyRound,
  LogOut,
} from "lucide-react";

import { updateProfileAction, type ProfileState } from "@/app/actions/profile";
import type { CurrentCollege } from "@/lib/auth/current";

export function ProfileForm({ college }: { college: CurrentCollege }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {}
  );
  const [activeTab, setActiveTab] = useState<"general" | "institution" | "security">("general");

  return (
    <main className="min-h-screen w-full flex overflow-hidden font-sans text-slate-900 bg-white">
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        
        {/* ─── LEFT 40% PANEL: PROFILE & INSTITUTION SHOWCASE ─── */}
        <div className="hidden lg:flex lg:w-[40%] min-h-screen bg-white border-r border-slate-200 px-8 lg:px-12 py-8 flex-col justify-between relative overflow-hidden">
          {/* Subtle Contour Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full" viewBox="0 0 600 600" fill="none">
              <circle cx="120" cy="180" r="320" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="120" cy="180" r="220" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="480" cy="480" r="300" stroke="#CBD5E1" strokeWidth="1" />
            </svg>
          </div>

          {/* Top Brand Link */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-xs shadow-sm">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900">
              XITE
            </span>
          </div>

          {/* User Profile Card */}
          <div className="relative z-10 my-auto py-6">
            <div className="relative inline-block mb-6">
              <img
                src="/user_avatar.jpg"
                alt="Ilaya Bharathi Profile Photo"
                className="h-24 w-24 rounded-full object-cover shadow-lg border-4 border-white ring-4 ring-slate-900/10"
              />
              <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white" title="Verified Account">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Director
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                <Award className="h-3.5 w-3.5" />
                Pro Admin
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ilaya Bharathi
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Director &amp; Founder — {college.name}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span>admin@madrascollege.ac.in</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>+91 80000 80002</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                <code className="rounded bg-white px-2 py-0.5 font-mono text-slate-800 border border-slate-200">
                  /site/{college.subdomain}
                </code>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>&copy; 2026 XITE Account Portal</span>
            <span>ID: {college.id.slice(0, 8)}</span>
          </div>
        </div>

        {/* ─── RIGHT 60% PANEL: PROFILE SETTINGS FORM ─── */}
        <div className="w-full lg:w-[60%] min-h-screen bg-white px-6 sm:px-10 lg:px-16 py-6 flex flex-col justify-between z-10 overflow-y-auto">

          {/* Header Bar */}
          <div className="flex h-12 items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <Link
              href={`/editor/${college.subdomain}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Editor</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                onClick={() => {
                  document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </Link>
            </div>
          </div>

          {/* Form Area */}
          <div className="mx-auto w-full max-w-xl my-auto py-6 sm:py-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Account Profile Settings
            </h1>
            <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
              Manage your personal credentials, administrator role, and institution details.
            </p>

            {/* Navigation Tabs */}
            <div className="mt-6 flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "general"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Personal Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("institution")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "institution"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Institution Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "security"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Security &amp; Auth
              </button>
            </div>

            {/* Success Alert */}
            {state.success && (
              <div role="alert" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{state.message}</span>
              </div>
            )}

            {/* Error Alert */}
            {state.error && (
              <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
                {state.error}
              </div>
            )}

            <form action={action} className="mt-6 space-y-5">
              {/* TAB 1: GENERAL PERSONAL DETAILS */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-bold text-slate-900 mb-1.5">
                      Full Name <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        defaultValue="Ilaya Bharathi"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="designation" className="block text-xs font-bold text-slate-900 mb-1.5">
                      Role / Designation
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="designation"
                        name="designation"
                        type="text"
                        defaultValue="Director & Founder"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-slate-900 mb-1.5">
                        Email Address <span className="text-blue-600">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          defaultValue="admin@madrascollege.ac.in"
                          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mobile" className="block text-xs font-bold text-slate-900 mb-1.5">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id="mobile"
                          name="mobile"
                          type="tel"
                          defaultValue="+91 80000 80002"
                          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INSTITUTION INFO */}
              {activeTab === "institution" && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="collegeName" className="block text-xs font-bold text-slate-900 mb-1.5">
                      Institution Name <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="collegeName"
                        name="collegeName"
                        type="text"
                        required
                        defaultValue={college.name}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="subdomain" className="block text-xs font-bold text-slate-900 mb-1.5">
                        Subdomain Address
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id="subdomain"
                          name="subdomain"
                          type="text"
                          readOnly
                          defaultValue={college.subdomain}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-slate-600 shadow-xs cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="collegeType" className="block text-xs font-bold text-slate-900 mb-1.5">
                        Institution Type
                      </label>
                      <input
                        id="collegeType"
                        name="collegeType"
                        type="text"
                        defaultValue={college.collegeType || "engineering"}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 capitalize outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="customDomain" className="block text-xs font-bold text-slate-900 mb-1.5">
                      Custom Web Domain (Optional)
                    </label>
                    <input
                      id="customDomain"
                      name="customDomain"
                      type="text"
                      placeholder="e.g. www.madrascollege.ac.in"
                      defaultValue={college.customDomain || ""}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY & AUTH */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Lock className="h-4 w-4 text-slate-700" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Password &amp; Credentials</p>
                          <p className="text-[11px] text-slate-500">Last changed 30 days ago</p>
                        </div>
                      </div>
                      <Link
                        href="/forgot-password"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
                      >
                        Change Password
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="h-4 w-4 text-slate-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
                        <p className="text-[11px] text-slate-500">Secured via Authenticator App</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      Enabled
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-[#4285F4] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#4285F4]/20 transition hover:bg-[#3367D6] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pending ? "Saving Profile…" : "Save Profile Changes"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-4 border-t border-slate-100">
            <span>&copy; 2026 XITE</span>
            <span>Support: +91 80000 80002</span>
          </div>
        </div>

      </div>
    </main>
  );
}
