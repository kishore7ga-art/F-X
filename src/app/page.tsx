import type { Metadata } from "next";

import { Footer } from "@/components/landing/Footer";
import { LandingPage } from "@/components/landing/LandingPage";
import { listTemplatesForLanding } from "@/lib/site/templates";

export const dynamic = "force-dynamic";

const TITLE = "XITE — College websites, live by Friday";
const DESCRIPTION =
  "Pick a design, replace the words, publish. Five designs, thirty section layouts, and content that survives every design change.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "XITE",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

/**
 * The public front door.
 *
 * A server component that fetches once and hands the result down. Only the
 * animated shell below is a client component — the templates are already in the
 * HTML, so the gallery is readable before a line of JavaScript has run, and
 * search engines see the real content rather than an empty grid.
 *
 * `editHref` is always /login, deliberately. This page used to work out where
 * to send people, which sent anyone with a design straight to the editor and
 * made onboarding and the sign-in screen unreachable from the front door — for
 * exactly the people who had never seen them. /login forwards anyone who
 * already has an identity, so entering at the top costs a returning visitor
 * nothing.
 */
export default async function HomePage() {
  // The one read on this page that swallows its own failure — see
  // listTemplatesForLanding. Someone arriving to find out what the product is
  // should not meet a 500 because the database is restarting.
  const templates = await listTemplatesForLanding();

  return (
    <>
      <LandingPage
        templates={templates}
        ctaHref="/login"
        ctaLabel="Start building"
      />
      <Footer templates={templates} />
    </>
  );
}
