import type { Metadata } from "next";

import { PublishedSite, publishedSiteMetadata } from "@/components/preview/PublishedSite";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * The same page as `/site/[subdomain]/[...path]`, reached at the bare root.
 *
 * `/[subdomain]` and `/site/[subdomain]` are the platform's two spellings of one
 * address, and both have to route a tenant's whole site rather than only its
 * home page — otherwise a link that works on a custom domain breaks when the
 * same site is opened through the platform path, which is how it is reviewed.
 *
 * Static segments win over dynamic ones at every level in Next's router, so
 * `/login`, `/editor/x` and `/api/...` still reach their own routes; this only
 * ever sees a path no platform route claims. A path that does not name a page
 * of a real site 404s — see `PublishedSite`.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; path: string[] }>;
}): Promise<Metadata> {
  const { subdomain, path } = await params;
  return publishedSiteMetadata(subdomain, `/${(path ?? []).join("/")}`);
}

export default async function SubdomainPagePath({
  params,
}: {
  params: Promise<{ subdomain: string; path: string[] }>;
}) {
  const { subdomain, path } = await params;
  return <PublishedSite subdomain={subdomain} pageSlug={`/${(path ?? []).join("/")}`} />;
}
