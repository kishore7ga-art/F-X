"use client";

import { Hero } from "@/components/landing/Hero";
import { Bento } from "@/components/landing/Bento";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Nav } from "@/components/landing/Nav";
import { LayoutLibrary } from "@/components/landing/LayoutLibrary";
import { StatsBar } from "@/components/landing/StatsBar";
import { Tour } from "@/components/landing/Tour";
import { Showcase } from "@/components/landing/Showcase";
import { LiquidCursor } from "@/components/ui/LiquidCursor";
import { useLenis } from "@/hooks/useLenis";
import type { TemplateSummary } from "@/lib/site/templates";

/**
 * The one client boundary on the landing page.
 *
 * Smooth scroll is page-wide and has to live above every section, so this is
 * where "use client" belongs — as far down the tree as it can go while still
 * being above the thing that needs it. The page shell and the footer stay on
 * the server, and the templates arrive already fetched.
 *
 * The loading curtain, the trailing cursor and the marquee were all here and
 * are all gone. Each was defensible alone; together they were four things
 * competing for attention on a page whose argument is restraint. What is left
 * is a scroll reveal per section, a magnet on the one button that matters, and
 * a single sustained moment in the editor.
 */
export function LandingPage({
  templates,
  ctaHref,
  ctaLabel,
}: {
  templates: TemplateSummary[];
  ctaHref: string;
  ctaLabel: string;
}) {
  useLenis();

  return (
    <div className="bg-night">
      <LiquidCursor />
      <Nav ctaHref={ctaHref} ctaLabel={ctaLabel} />

      {/* First in the tab order: a page this long behind a fixed nav is
          punishing to traverse by keyboard without one. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-night"
      >
        Skip to content
      </a>

      <main id="main">
        {/*
          Dark, light, light, dark, dark, dark — the two light sections sit
          together on purpose. Alternating every section makes a page flicker;
          one sustained light passage in the middle reads as a chapter, and the
          stats band is the rule that closes it.

          ProductInMotion is deliberately not here. The bento's large cell makes
          the same argument with the same template-swap preview, and the tour
          walks the same flow — three sections demonstrating one idea is exactly
          the repetition this page has already been cut once for.
        */}
        <Hero ctaHref={ctaHref} ctaLabel={ctaLabel} />
        <Bento />
        <Tour />
        <StatsBar />
        <LayoutLibrary />
        <Showcase templates={templates} />
        <FinalCTA ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </main>
    </div>
  );
}
