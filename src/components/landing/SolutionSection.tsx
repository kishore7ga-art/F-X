"use client";

import { CheckCircle, Zap, Shield, Sparkles, Layout, MousePointer } from "lucide-react";
import { Compare } from "@/components/ui/compare";

export default function SolutionSection() {
  const solutions = [
    { title: "Pre-Built Academic Templates", desc: "Designed specifically for engineering, arts, medical, and polytechnic colleges." },
    { title: "Drag & Drop Visual Builder", desc: "Re-order hero banners, faculty grids, and course lists without writing code." },
    { title: "Real-Time Live Canvas Preview", desc: "See exact desktop and mobile preview as you type in the editor panel." },
    { title: "100% Mobile & Tablet Responsive", desc: "Flawless performance across smartphones, iPads, and high-res desktop monitors." },
    { title: "One-Click Publishing & Domain Sync", desc: "Deploy changes live in 1 second with SSL & custom college domain support." },
    { title: "Built-In Academic CMS & Version History", desc: "Manage courses, notices, admissions, and faculty profiles with full rollback capabilities." },
  ];

  return (
    <section className="w-full bg-black py-24 border-t border-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Modern Solution</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            XITE gives colleges everything they need — no developers required.
          </h2>
        </div>

        {/* Side by Side Before & After Visual Compare */}
        <div className="mb-16">
          <div className="p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100 border-neutral-200 dark:border-neutral-800 px-4 max-w-4xl mx-auto shadow-2xl">
            <Compare
              firstImage="https://assets.aceternity.com/code-problem.png"
              secondImage="https://assets.aceternity.com/code-solution.png"
              firstImageClassName="object-cover object-left-top"
              secondImageClassname="object-cover object-left-top"
              className="h-[250px] w-full md:h-[450px]"
              slideMode="hover"
            />
          </div>
          <p className="text-center text-xs font-mono text-neutral-400 mt-4">
            Hover cursor left to right to compare Legacy HTML vs XITE Modern No-Code Platform
          </p>
        </div>

        {/* 6 Core Solutions List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-md hover:border-emerald-500/50 transition"
            >
              <CheckCircle className="h-6 w-6 text-emerald-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
