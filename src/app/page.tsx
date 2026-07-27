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
import { getCurrentCollege } from "@/lib/auth/current";

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
  const college = await getCurrentCollege();

  // The entry point is the flow, not a deep link past it. Checking templateId
  // first sent anyone whose college already had a design straight to the
  // editor, skipping onboarding entirely — which made /start and /onboarding
  // unreachable from the front door for exactly the people who had never seen
  // them.
  //
  // Onboarding first, then the choice screen. /start carries a "continue
  // editing" link, so a returning site is still one click away.
  const editHref = college
    ? college.collegeType
      ? "/start"
      : "/onboarding"
    : "/login";

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
