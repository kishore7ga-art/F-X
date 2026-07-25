import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DraftBanner } from "@/components/site/DraftBanner";
import { SiteView } from "@/components/site/SiteView";
import { resolveSiteAccess } from "@/lib/site/access";
import { getSitePage } from "@/lib/site/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/site/[subdomain]">): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await getSitePage(subdomain);
  return { title: data ? data.college.name : "Site not found" };
}

/** Home page of a college's public site. */
export default async function CollegeSiteHomePage({
  params,
}: PageProps<"/site/[subdomain]">) {
  const { subdomain } = await params;
  const data = await getSitePage(subdomain);

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
