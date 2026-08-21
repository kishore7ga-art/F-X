import type { Metadata } from "next";

import { PublishedSite, publishedSiteMetadata } from "@/components/preview/PublishedSite";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * The same site as `/site/[subdomain]`, reached at the bare root — this is where
 * the proxy's subdomain and custom-domain rewrites land.
 *
 * Both routes render one component. They used to be two copies of the same
 * fetch-and-render, which is where a rule like the maintenance check gets added
 * to one and not the other, leaving a tenant who switched their site off still
 * serving it at one of its two addresses.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  return publishedSiteMetadata(subdomain);
}

export default async function SubdomainRootPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  return <PublishedSite subdomain={subdomain} />;
}
