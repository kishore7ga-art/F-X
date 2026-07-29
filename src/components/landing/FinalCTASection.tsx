"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section className="relative w-full bg-black py-28 border-t border-neutral-900 text-white overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute left-1/2 top-1/2 h-[450px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-emerald-600/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-semibold text-blue-400 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Transform Your Institution's Web Presence</span>
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          Making professional website creation simple, fast, and accessible for every educational institution.
        </h2>

        <p className="mt-6 text-base md:text-lg text-neutral-300 max-w-2xl mx-auto">
          Join leading colleges using XITE to launch NAAC-ready, responsive websites in record time.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/start"
            className="flex items-center gap-2.5 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/30"
          >
            <span>Start Your Free Trial</span>
            <img src="/xite-logo.png" alt="XITE Logo" className="h-5 w-5 object-contain" />
          </Link>

          <Link
            href="/templates"
            className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/80 px-8 py-4 text-base font-bold text-neutral-200 transition-all hover:bg-neutral-800 hover:text-white"
          >
            <span>Book a Demo</span>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            No Credit Card Required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Instant 2-Minute Setup
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Cancel Anytime
          </span>
        </div>
      </div>
    </section>
  );
}
