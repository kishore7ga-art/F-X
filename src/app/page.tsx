import type { Metadata } from "next";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import {
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingSegments,
  LandingShowcase,
  LandingStats,
  LandingTemplates,
} from "@/components/landing/LandingSections";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "XITE — College websites, live by Friday",
  description:
    "Pick a design, replace the words, publish. Five templates, thirty section layouts, and content that survives every design change.",
};

/**
 * The public front door.
 *
 * This used to redirect straight into the editor, which meant the product had
 * no page that explained itself — every visitor landed inside a tool they had
 * not chosen yet.
 */
export default async function HomePage() {
  // The entry point is the flow, not a deep link past it. Checking templateId
  // first sent anyone whose college already had a design straight to the
  // editor, skipping onboarding entirely — which made /start and /onboarding
  // unreachable from the front door for exactly the people who had never seen
  // them.
  //
  // Onboarding first, then the choice screen. /start carries a "continue
  // editing" link, so a returning site is still one click away.
  // Always step 1. Signing in is optional there, and /login forwards anyone who
  // already has an identity, so entering at the top costs a returning visitor
  // nothing — and stops the sign-in screen being unreachable, which is what
  // happened when this page tried to be clever about where to send people.
  //
  // It also means the landing page needs no database query at all: the public
  // front door now renders the same for everyone.
  const editHref = "/login";

  return (
    <>
      <LandingHeader editHref={editHref} />
      <main>
        <LandingHero editHref={editHref} />
        <LandingStats />
        <LandingFeatures />
        <LandingSegments />
        <LandingShowcase editHref={editHref} />
        <LandingTemplates editHref={editHref} />
        <LandingCta editHref={editHref} />
      </main>
      <LandingFooter />
    </>
  );
}
