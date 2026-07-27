import type { Metadata } from "next";

import { prisma } from "@/lib/db";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import type { LandingTemplate } from "@/components/landing/LandingSections";
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
/**
 * The gallery, straight from the database.
 *
 * A failure here must not take the marketing page down with it: someone
 * arriving to read what the product is should not meet a 500 because Postgres
 * is restarting. An empty grid is a worse page; a broken one is no page.
 */
async function landingTemplates(): Promise<LandingTemplate[]> {
  try {
    return await prisma.template.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        description: true,
        thumbnailUrl: true,
        demoUrl: true,
      },
    });
  } catch (error) {
    console.error("[landing] could not load templates:", (error as Error).message);
    return [];
  }
}

export default async function HomePage() {
  const templates = await landingTemplates();

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
        <LandingTemplates editHref={editHref} templates={templates} />
        <LandingCta editHref={editHref} />
      </main>
      <LandingFooter templates={templates} />
    </>
  );
}
