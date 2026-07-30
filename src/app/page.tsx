import type { Metadata } from "next";

import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { StudioClosing } from "@/components/landing/studio/StudioClosing";
import { StudioHero } from "@/components/landing/studio/StudioHero";
import { StudioNav } from "@/components/landing/studio/StudioNav";
import {
  StudioFigures,
  StudioIndex,
  StudioMarquee,
  StudioProcess,
} from "@/components/landing/studio/StudioSections";
import { StudioTemplates } from "@/components/landing/studio/StudioTemplates";

export const dynamic = "force-dynamic";

const TITLE = "XITE — Websites for colleges, without the website part";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Pick a design, fill in forms, publish. A website builder for colleges: thirty section layouts, five finished templates, and no code.",
};

/**
 * The landing page, rebuilt in the studio-site idiom.
 *
 * Seven sections where there were thirteen. The previous composition stacked one
 * effect per section — mask reveal, wobble cards, sparkles, pointer highlight,
 * 3D marquee, compare slider — each impressive alone and, together, a page with
 * no hierarchy: everything was the loudest thing. The genre this now follows gets
 * its weight from type, space and one accent, so there is somewhere for the eye
 * to rest and the 3D hero is the only moving thing above the fold.
 *
 * Nothing is copied from any particular studio's site. The look is a widely used
 * idiom — near-black surface, oversized tight-tracked display type, hairline
 * rules, monospace signage — and every token, figure and line of copy here is
 * this project's own. The palette is the one the design system already documents:
 * monochrome with `#146ef5` spent only on actions.
 *
 * `SmoothScrollProvider` stays at the root, unchanged: it owns the single Lenis
 * instance and keeps ScrollTrigger in step with it.
 *
 * The thirteen old sections are still in the repo and still imported by nothing
 * else. Left in place rather than deleted — this is a look being tried, and
 * removing the previous one in the same change would make going back a
 * reconstruction rather than a revert.
 */
export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <main className="min-h-svh bg-night text-chalk antialiased selection:bg-accent selection:text-night">
        <StudioNav />
        <StudioHero />
        <StudioMarquee />
        <StudioIndex />
        <StudioTemplates />
        <StudioProcess />
        <StudioFigures />
        <StudioClosing />
      </main>
    </SmoothScrollProvider>
  );
}
