import { PreviewSiteViewer } from "@/components/preview/PreviewSiteViewer";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";
import { loadSiteSections } from "@/lib/site-sections.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Official Campus Portal — Powered by XITE",
};

export default async function SitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  // Fetched here rather than in the browser so the first paint is the college's
  // own site. Rendering a spinner and filling it in afterwards meant every
  // visitor saw a flash of the platform before the site they asked for.
  const initialSections = await loadSiteSections(subdomain);
  return (
    <>
      <SectionRuntimeAssets />
      <PreviewSiteViewer subdomain={subdomain} mode="live" initialSections={initialSections} />
    </>
  );
}
