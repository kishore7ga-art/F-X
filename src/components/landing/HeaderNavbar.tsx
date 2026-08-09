"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function HeaderNavbar() {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-4 z-50 mx-auto max-w-6xl px-4 transition-all duration-300 transform translate-y-0 opacity-100"
      )}
    >
      <nav className="flex items-center justify-between rounded-full border border-white/15 bg-black/75 px-6 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 p-1 border border-white/20 shadow-md group-hover:scale-105 transition-transform">
            <img src="/xite-logo.png" alt="XITE Logo" className="h-full w-full object-contain rounded-md" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              XITE
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-400 border border-blue-500/30">
                Builder
              </span>
            </span>
          </div>
        </Link>

        {/* Edit Page Button */}
        <div className="flex items-center gap-3">
          <Link href="/editor/mec" className="p-[3px] relative inline-block group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            <div className="px-6 py-2 bg-black rounded-full relative group transition duration-200 text-white text-xs font-bold hover:bg-transparent flex items-center justify-center gap-1.5">
              <span>Edit Page</span>
              <span className="text-blue-400">→</span>
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}

