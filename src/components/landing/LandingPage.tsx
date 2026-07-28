"use client";

import { CTA } from "@/components/landing/CTA";
import { Editing } from "@/components/landing/Editing";
import { Hero } from "@/components/landing/Hero";
import { Nav } from "@/components/landing/Nav";
import { Process } from "@/components/landing/Process";
import { Showcase } from "@/components/landing/Showcase";
import { Stats } from "@/components/landing/Stats";
import { Cursor } from "@/components/ui/Cursor";
import { Loader } from "@/components/ui/Loader";
import { useLenis } from "@/hooks/useLenis";
import type { TemplateSummary } from "@/lib/site/templates";

/**
 * The one client boundary on the landing page.
 *
 * Smooth scroll and the cursor are page-wide and have to live above every
 * section, so this is where "use client" belongs — pushed as far down the tree
 * as it can go while still being above the things that need it. The page shell
 * and the footer stay on the server, and the templates arrive already fetched.
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
    <>
      <Loader />
      <Cursor />
      <Nav ctaHref={ctaHref} ctaLabel={ctaLabel} />

      {/* Skip link, first in the tab order: a page this long with a fixed nav
          is punishing to traverse by keyboard without one. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-brand-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <main id="main">
        <Hero ctaHref={ctaHref} />
        <Stats />
        <Process />
        <Showcase templates={templates} />
        <Editing />
        <CTA ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </main>
    </>
  );
}
