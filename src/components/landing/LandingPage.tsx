"use client";

import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { LiquidCursor } from "@/components/ui/LiquidCursor";
import { useLenis } from "@/hooks/useLenis";
export function LandingPage({
  templates,
  ctaHref,
  ctaLabel,
}: {
  templates?: any[];
  ctaHref: string;
  ctaLabel: string;
}) {
  useLenis();

  return (
    <div className="bg-night min-h-screen flex flex-col">
      <LiquidCursor />
      <Nav ctaHref={ctaHref} ctaLabel={ctaLabel} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-night"
      >
        Skip to content
      </a>

      <main id="main" className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Link
          href={ctaHref}
          className="rounded-full bg-accent px-8 py-4 text-base font-bold text-night transition hover:opacity-85 shadow-lg"
        >
          {ctaLabel} →
        </Link>
      </main>
    </div>
  );
}
