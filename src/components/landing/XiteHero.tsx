"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Layout, ShieldCheck, Play } from "lucide-react";
import { Cover } from "@/components/ui/cover";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export default function XiteHero() {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 py-24 md:py-32 text-white">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6 relative z-10 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-8 backdrop-blur-md shadow-lg">
          <img src="/xite-logo.png" alt="XITE Logo" className="h-4 w-4 object-contain" />
          <span>The #1 No-Code Website Builder for Colleges</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          Build Professional College Websites <Cover>Faster.</Cover>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Create, edit, and publish stunning, NAAC-ready college websites in minutes.
          <PointerHighlight>
            <span> No coding required.</span>
          </PointerHighlight>
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/start"
            className="flex items-center gap-2.5 rounded-xl bg-blue-600 px-7 py-4 text-base font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30"
          >
            <span>Start Building Free</span>
            <img src="/xite-logo.png" alt="XITE Logo" className="h-5 w-5 object-contain" />
          </Link>

          <Link
            href="/templates"
            className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/80 px-7 py-4 text-base font-bold text-neutral-200 transition-all hover:bg-neutral-800 hover:text-white hover:border-neutral-600"
          >
            <Layout className="h-4 w-4 text-purple-400" />
            <span>See Templates</span>
          </Link>
        </div>

        {/* Hero Mockup Screenshot / Video Frame */}
        <div className="mt-16 relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[0_20px_80px_rgba(0,0,0,0.9)] p-2">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-800 bg-neutral-950/80 rounded-t-xl">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[11px] font-mono text-neutral-500 mx-auto">
              https://xite.edu/editor/greenfield
            </span>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-b-xl bg-neutral-950">
            <img
              src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1400&h=850&fit=crop"
              alt="XITE Visual Drag and Drop Builder"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Live Drag & Drop Editor Active
              </span>
              <span>100% Responsive Preview</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
