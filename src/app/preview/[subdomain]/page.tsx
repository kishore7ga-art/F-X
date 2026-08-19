import { PreviewSiteViewer } from "@/components/preview/PreviewSiteViewer";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";
import { loadSiteSections } from "@/lib/site-sections.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Live Published Website Preview — XITE",
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const initialSections = await loadSiteSections(subdomain);
  // `preview` keeps the device dock and the five-second refresh: this URL is for
  // whoever is editing the site, not for its visitors.
  return (
    <>
      <SectionRuntimeAssets />
      <PreviewSiteViewer subdomain={subdomain} mode="preview" initialSections={initialSections} />
    </>
  );
}
