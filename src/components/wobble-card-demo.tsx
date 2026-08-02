"use client";

import React from "react";
import { WobbleCard } from "@/components/ui/wobble-card";

export default function WobbleCardDemo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4 py-16">
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-black min-h-[450px] lg:min-h-[350px]"
        className=""
      >
        <div className="max-w-md">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 rounded-full border border-indigo-500/30 mb-4">
            AI-POWERED GENERATION
          </span>
          <h2 className="text-left text-balance text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Generate Complete College Websites in Seconds
          </h2>
          <p className="mt-4 text-left text-sm md:text-base text-neutral-300 leading-relaxed">
            Answer two simple questions about your institution, and XITE AI builds an entire multi-page, NAAC-compliant college portal automatically.
          </p>
        </div>
        {/* Mockup Preview Card */}
        <div className="absolute -right-6 lg:-right-[15%] -bottom-10 w-[320px] sm:w-[420px] rounded-2xl border border-white/20 bg-black/90 backdrop-blur-xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[10px] text-neutral-400 font-mono ml-2">college.xite.co.in</span>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-white/10 p-3 flex flex-col justify-end">
              <span className="text-xs font-bold text-white">Official College Portal</span>
              <span className="text-[10px] text-neutral-300">NAAC A++ Accredited Autonomous Portal</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-md bg-white/5 border border-white/10 p-2 text-[10px] text-neutral-300 flex items-center justify-center">Academics & Admissions</div>
              <div className="h-10 rounded-md bg-white/5 border border-white/10 p-2 text-[10px] text-neutral-300 flex items-center justify-center">NAAC Compliance Center</div>
            </div>
          </div>
        </div>
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 bg-gradient-to-br from-neutral-900 to-black min-h-[350px]">
        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 rounded-full border border-emerald-500/30 mb-4">
          ZERO CODE PUBLISHING
        </span>
        <h2 className="max-w-80 text-left text-balance text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
          Visual Drag-and-Drop Editor
        </h2>
        <p className="mt-4 max-w-[26rem] text-left text-sm text-neutral-300 leading-relaxed">
          Edit notice boards, faculty rosters, syllabus PDFs, and department pages visually without technical knowledge or coding.
        </p>
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-gradient-to-r from-blue-950 via-indigo-950 to-neutral-950 min-h-[450px] lg:min-h-[320px]">
        <div className="max-w-lg">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 rounded-full border border-blue-500/30 mb-4">
            INSTANT DEPLOYMENT
          </span>
          <h2 className="max-w-md md:max-w-lg text-left text-balance text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Publish Instantly to Custom Subdomains & Live Domains
          </h2>
          <p className="mt-4 max-w-[28rem] text-left text-sm md:text-base text-neutral-300 leading-relaxed">
            One-click publishing with automatic SSL, global CDN distribution, and 99.99% uptime SLA for educational institutions.
          </p>
        </div>
        {/* Secondary Mockup Card */}
        <div className="absolute -right-10 md:-right-[10%] lg:-right-[5%] -bottom-10 w-[300px] sm:w-[400px] rounded-2xl border border-white/20 bg-black/90 backdrop-blur-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live & SSL Secured
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">100% NAAC Ready</span>
          </div>
          <div className="space-y-2">
            <div className="h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center justify-between text-xs text-white">
              <span>https://roevingg.edu.in</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Published</span>
            </div>
            <div className="h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 flex items-center justify-between text-xs text-white">
              <span>https://rit.xite.co.in</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">Active Subdomain</span>
            </div>
          </div>
        </div>
      </WobbleCard>
    </div>
  );
}
