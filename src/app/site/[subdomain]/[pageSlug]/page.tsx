import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DraftBanner } from "@/components/site/DraftBanner";
import { SiteView } from "@/components/site/SiteView";
import { resolveSiteAccess } from "@/lib/site/access";
import { buildPageMetadata } from "@/lib/site/metadata";
import { getSitePage } from "@/lib/site/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/site/[subdomain]/[pageSlug]">): Promise<Metadata> {
  const { subdomain, pageSlug } = await params;
  const data = await getSitePage(subdomain, pageSlug);
  if (!data) return { title: "Not found" };

  // Same builder as the home page: SEO set on an inner page must reach <head>
  // there too, or the panel would only work on one of the four.
  return buildPageMetadata(data, subdomain);
}

/** Any non-home page of a college's public site (About, Admissions, ...). */
export default async function CollegeSitePage({
  params,
}: PageProps<"/site/[subdomain]/[pageSlug]">) {
  const { subdomain, pageSlug } = await params;
  const data = await getSitePage(subdomain, pageSlug);

  if (!data) notFound();

  const access = await resolveSiteAccess(data);
  if (!access.allowed) notFound();

  return (
    <>
      {access.isOwnerPreview ? <DraftBanner subdomain={subdomain} /> : null}
      <SiteView data={data} />
    </>
  );
}
