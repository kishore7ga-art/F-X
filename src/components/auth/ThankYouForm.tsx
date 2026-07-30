"use client";

import Link from "next/link";
import { Sparkles, Globe, CheckCircle2, Clock, Phone, ArrowLeft } from "lucide-react";

export function ThankYouForm() {
  return (
    <main className="min-h-screen w-full flex overflow-hidden font-sans text-slate-900 bg-white">
      <div className="w-full min-h-screen flex flex-col lg:flex-row">

        {/* ─── LEFT 40% PANEL: SHOWCASE ─── */}
        <div className="hidden lg:flex lg:w-[40%] min-h-screen bg-[#F3F4F6] px-8 lg:px-12 py-5 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full" viewBox="0 0 600 600" fill="none">
              <circle cx="100" cy="150" r="320" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="100" cy="150" r="220" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="500" cy="500" r="350" stroke="#CBD5E1" strokeWidth="1" />
            </svg>
          </div>

          <div />

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

        {/* ─── RIGHT 60% PANEL: THANK YOU CONTENT ─── */}
        <div className="w-full lg:w-[60%] min-h-screen bg-white px-6 sm:px-10 lg:px-16 py-5 flex flex-col justify-between z-10 overflow-y-auto">
          {/* Header */}
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
                className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-6 py-2.5 text-sm font-normal text-emerald-700 border border-emerald-200/60 transition hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-xs shadow-2xs active:scale-[0.98] leading-none"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Thank You Content */}
          <div className="mx-auto w-full max-w-md my-auto py-6 sm:py-8">

            {/* Success Icon */}
            <div className="flex justify-center mb-7">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#4285F4]/10 ring-8 ring-[#4285F4]/5">
                <CheckCircle2 className="h-10 w-10 text-[#4285F4]" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Request Submitted!
              </h1>
              <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
                Thank you for requesting access to the XITE College Portal. Our team has received your request and will review it shortly.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-3">

              {/* 24 hour card */}
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4285F4]/10">
                  <Clock className="h-4.5 w-4.5 text-[#4285F4]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Access within 24 hours</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 leading-relaxed">
                    You&apos;ll receive your login credentials via email once your request has been approved by our team.
                  </p>
                </div>
              </div>

              {/* Support card */}
              <div className="flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <Phone className="h-4.5 w-4.5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Need immediate attention?</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 leading-relaxed">
                    Call our support team and we&apos;ll get you set up right away.
                  </p>
                  <a
                    href="tel:+918000080002"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-900 transition"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    +91 80000 80002
                  </a>
                </div>
              </div>

            </div>

            {/* Homepage link */}
            <div className="mt-8 flex items-center justify-center">
              <a
                href="https://xite.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Go to xite.co.in
              </a>
            </div>
          </div>

          {/* Footer */}
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
