import { notFound } from "next/navigation";

import { PreviewThemeBridge } from "@/components/preview/PreviewThemeBridge";
import { SiteView } from "@/components/site/SiteView";
import { requireCollegeBySubdomain } from "@/lib/auth/current";
import { getSitePage } from "@/lib/site/queries";

export const dynamic = "force-dynamic";

/**
 * The college's real site, rendered for embedding in an editor iframe. Using a
 * real iframe (rather than a scaled-down div) means the mobile toggle exercises
 * the actual CSS breakpoints.
 */
export default async function PreviewPage({
  params,
  searchParams,
}: PageProps<"/preview/[subdomain]">) {
  const { subdomain } = await params;
  const { page } = await searchParams;
  const pageSlug = typeof page === "string" ? page : undefined;

  await requireCollegeBySubdomain(subdomain);

  const data = await getSitePage(subdomain, pageSlug);
  if (!data) notFound();

  return (
    <>
      <PreviewThemeBridge />
      <SiteView data={data} />
    </>
  );
}
