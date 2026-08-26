import type { Metadata } from "next";

import { PublishedSite, publishedSiteMetadata } from "@/components/preview/PublishedSite";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Any page of a published tenant site other than its root.
 *
 * This route did not exist. The proxy has always rewritten a tenant host's path
 * onto this prefix — `greenfield.webxite.org/about` becomes
 * `/site/greenfield/about` — and only `/site/[subdomain]` was routed, so every
 * address on every tenant site except the root returned the platform's 404.
 * The editor let a tenant create pages, name them, slug them and publish them;
 * the navigation inside their own header linked to them; and none of those
 * links resolved.
 *
 * The catch-all is deliberate rather than a single `[slug]`: a tenant may slug
 * a page `/admissions/fees`, which `canonicalSlug` permits, and a one-segment
 * route would 404 it.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; path: string[] }>;
}): Promise<Metadata> {
  const { subdomain, path } = await params;
  return publishedSiteMetadata(subdomain, `/${(path ?? []).join("/")}`);
}

export default async function SitePagePath({
  params,
}: {
  params: Promise<{ subdomain: string; path: string[] }>;
}) {
  const { subdomain, path } = await params;
  return <PublishedSite subdomain={subdomain} pageSlug={`/${(path ?? []).join("/")}`} />;
}
