import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DraftBanner } from "@/components/site/DraftBanner";
import { NotBuiltYet } from "@/components/site/NotBuiltYet";
import { SiteView } from "@/components/site/SiteView";
import { buildPageMetadata } from "@/lib/site/metadata";
import { getSitePage, isBuilt } from "@/lib/site/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/site/[subdomain]">): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await getSitePage(subdomain);
  if (!isBuilt(data)) return { title: "Site not found" };

  return buildPageMetadata(data, subdomain);
}

/** Home page of a college's public site. */
export default async function CollegeSiteHomePage({
  params,
}: PageProps<"/site/[subdomain]">) {
  const { subdomain } = await params;
  const data = await getSitePage(subdomain);

  // Nothing at this address, or a draft belonging to somebody else — the
  // backend answers both as absent, which is what they are to this visitor.
  if (data === null) notFound();

  // A college that exists but has not picked a design. Not a 404: it is one
  // click from being a website, and saying "not found" about it is a dead end.
  // The backend distinguishes the two now, so this no longer costs a second
  // query to tell them apart.
  if (!isBuilt(data)) {
    return (
      <NotBuiltYet collegeName={data.college.name} subdomain={subdomain} />
    );
  }

  return (
    <>
      {data.isOwnerPreview ? <DraftBanner subdomain={subdomain} /> : null}
      <SiteView data={data} />
    </>
  );
}
