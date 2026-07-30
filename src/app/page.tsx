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
const DESCRIPTION =
  "Pick a design, fill in forms, publish. A website builder for colleges: thirty section layouts, five finished templates, and no code.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    // Placeholder. The file does not exist yet, so this is the single line to
    // change once a real 1200x630 card is drawn.
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/**
 * The landing page, in the studio-site idiom.
 *
 * Seven sections where there were thirteen. The previous composition stacked one
 * effect per section — mask reveal, wobble cards, sparkles, pointer highlight, 3D
 * marquee, compare slider — each fine alone and, together, a page with no
 * hierarchy, because everything was the loudest thing. This idiom takes its weight
 * from type, space and a single accent, so there is somewhere for the eye to rest
 * and the 3D hero is the only moving thing above the fold.
 *
 * Original work in a widely used genre — near-black surface, oversized
 * tight-tracked display type, hairline rules, monospace signage. No markup, CSS,
 * asset or line of copy is taken from any particular studio's site, and nothing
 * imitates anyone's branding. Every figure and template description is this
 * project's own, read out of the seed that creates them. The palette is the one
 * the design system already documents: monochrome, with `#146ef5` spent only on
 * actions.
 *
 * `SmoothScrollProvider` stays at the root: it owns the single Lenis instance and
 * keeps ScrollTrigger in step with it.
 *
 * The thirteen previous sections are still in the repo, imported by nothing. Left
 * there while this look is judged — deleting them in the same change would turn
 * going back into a reconstruction rather than a revert.
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
