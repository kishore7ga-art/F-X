import type { Metadata } from "next";

import { PublishedSite, publishedSiteMetadata } from "@/components/preview/PublishedSite";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Title, description and robots come from the tenant's own SEO settings rather
 * than a constant. The constant was the same for every site on the platform,
 * and it ignored the indexing toggle entirely.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  return publishedSiteMetadata(subdomain);
}

export default async function SitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  // Fetched during the render rather than in the browser, so the first paint is
  // the college's own site rather than a spinner — and so maintenance mode is
  // decided before any of it is sent.
  return <PublishedSite subdomain={subdomain} />;
}
