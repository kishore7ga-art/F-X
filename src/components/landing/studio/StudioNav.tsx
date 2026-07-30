"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Fixed, and almost nothing.
 *
 * Four links and a wordmark. A studio-genre page carries its navigation as a
 * thin line at the top and lets the work fill the screen, so this holds no
 * dropdown, no search and no second row.
 *
 * The backdrop only appears once the page has moved. Over the hero it would put
 * a grey band across the largest type on the page for no reason; past it, the
 * blur is what keeps the links legible against whatever is scrolling under them.
 */
export function StudioNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Passive: this listener only reads scroll position and must never be the
    // reason a scroll frame is late.
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "border-b border-night-line bg-night/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="font-mono text-[13px] font-semibold uppercase tracking-[0.3em] text-chalk transition-opacity hover:opacity-70"
        >
          XITE
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {[
            ["Templates", "#templates"],
            ["How it works", "#process"],
            ["Sections", "#index"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-chalk-dim/70 transition-colors hover:text-chalk"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-chalk-dim/70 transition-colors hover:text-chalk"
          >
            Log in
          </Link>
          {/*
            Points at /start, unchanged. /start decides where a visitor actually
            goes — /request-access when signed out, the editor or onboarding when
            not — and that decision belongs there rather than duplicated here.
          */}
          <Link
            href="/start"
            className="rounded-full bg-chalk px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-night transition-opacity hover:opacity-80"
          >
            Start
          </Link>
        </div>
      </div>
    </header>
  );
}
