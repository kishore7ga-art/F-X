import { notFound } from "next/navigation";

import { PreviewThemeBridge } from "@/components/preview/PreviewThemeBridge";
import { SiteView } from "@/components/site/SiteView";
import { requireCollegeBySubdomain } from "@/lib/auth/current";
import { getSitePage, getTemplatePreview, isBuilt } from "@/lib/site/queries";

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
  const { page, template } = await searchParams;
  const pageSlug = typeof page === "string" ? page : undefined;
  const templateId = typeof template === "string" ? template : undefined;

  await requireCollegeBySubdomain(subdomain);

  const own = await getSitePage(subdomain, pageSlug);

  // A college that has not picked a design yet has no pages, so there is
  // genuinely nothing of its own to render. Screen 2 passes the template it is
  // offering, which is exactly what should fill the frame in that moment.
  // `isBuilt` covers both "no such site" and "site with nothing on it", which
  // the backend now reports separately and which land here the same way.
  const data = isBuilt(own)
    ? own
    : templateId
      ? await getTemplatePreview(subdomain, templateId)
      : null;

  if (!data) notFound();

  return (
    <>
      <PreviewThemeBridge />
      <SiteView data={data} />
    </>
  );
}
