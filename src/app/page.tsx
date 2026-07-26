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

  // Where "Edit Template" goes depends on how far along the visitor is: back
  // into a site they have already built, to the gallery if they have a college
  // but no design yet, or to sign-in when there is no session at all.
  const editHref = college
    ? college.templateId
      ? `/editor/${college.subdomain}`
      : "/templates"
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
