"use client";

import React, { useState } from "react";
import Link from "next/link";

export function HeaderNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 mx-auto max-w-6xl px-4">
      <nav className="flex items-center justify-between rounded-full border border-white/15 bg-black/75 px-6 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300">
        {/* Brand Logo */}
        <Link href="#" className="flex items-center gap-3 group">
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

        {/* Landing Page Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-neutral-300">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#builder" className="hover:text-white transition-colors">
            Visual Builder
          </a>
          <a href="#compare" className="hover:text-white transition-colors">
            Before & After
          </a>
          <a href="#templates" className="hover:text-white transition-colors">
            Templates
          </a>
          <a href="#testimonials" className="hover:text-white transition-colors">
            Reviews
          </a>
        </div>

        {/* Primary CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-neutral-300 hover:text-white px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 border border-white/20"
          >
            Start Building 🚀
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white p-1 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Landing Page Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3 text-sm font-semibold text-neutral-200">
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>
            ⚡ Features
          </a>
          <a href="#builder" onClick={() => setIsMobileMenuOpen(false)}>
            🛠️ Visual Builder
          </a>
          <a href="#compare" onClick={() => setIsMobileMenuOpen(false)}>
            📊 Before & After
          </a>
          <a href="#templates" onClick={() => setIsMobileMenuOpen(false)}>
            🎨 Templates
          </a>
          <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>
            💬 Reviews
          </a>
          <hr className="border-white/10 my-1" />
          <Link
            href="/onboarding"
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-center text-xs font-bold text-white shadow-lg"
          >
            Start Building 🚀
          </Link>
        </div>
      )}
    </header>
  );
}
