"use client";

import { CTA } from "@/components/landing/CTA";
import { Hero } from "@/components/landing/Hero";
import { KeyFacts } from "@/components/landing/KeyFacts";
import { Nav } from "@/components/landing/Nav";
import { Philosophy } from "@/components/landing/Philosophy";
import { Process } from "@/components/landing/Process";
import { ProductInMotion } from "@/components/landing/ProductInMotion";
import { Showcase } from "@/components/landing/Showcase";
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
        <Hero ctaHref={ctaHref} ctaLabel={ctaLabel} />
        <Philosophy />
        <KeyFacts />
        <ProductInMotion />
        <Process />
        <Showcase templates={templates} />
        <CTA ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </main>
    </div>
  );
}
