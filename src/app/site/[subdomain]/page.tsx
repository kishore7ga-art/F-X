import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DraftBanner } from "@/components/site/DraftBanner";
import { NotBuiltYet } from "@/components/site/NotBuiltYet";
import { SiteView } from "@/components/site/SiteView";
import { resolveSiteAccess } from "@/lib/site/access";
import { buildPageMetadata } from "@/lib/site/metadata";
import { prisma } from "@/lib/db";
import { getSitePage } from "@/lib/site/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/site/[subdomain]">): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await getSitePage(subdomain);
  if (!data) return { title: "Site not found" };

  return buildPageMetadata(data, subdomain);
}

/** Home page of a college's public site. */
export default async function CollegeSiteHomePage({
  params,
}: PageProps<"/site/[subdomain]">) {
  const { subdomain } = await params;
  const data = await getSitePage(subdomain);

  if (!data) {
    // Two very different situations arrive here as the same null: a subdomain
    // nobody owns, and a college that simply has not picked a design. Only the
    // first is a 404 — the second is one click from being a website, and
    // saying "not found" about it is both wrong and a dead end.
    const college = await prisma.college.findUnique({
      where: { subdomain },
      select: { name: true },
    });
    if (!college) notFound();

    return <NotBuiltYet collegeName={college.name} subdomain={subdomain} />;
  }

  const access = await resolveSiteAccess(data);
  if (!access.allowed) notFound();

  return (
    <>
      {access.isOwnerPreview ? <DraftBanner subdomain={subdomain} /> : null}
      <SiteView data={data} />
    </>
  );
}
