import { PreviewSiteViewer } from "@/components/preview/PreviewSiteViewer";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";
import { loadSiteSections } from "@/lib/site-sections.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Official Campus Portal — Powered by XITE",
};

export default async function SubdomainRootPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const initialSections = await loadSiteSections(subdomain);
  return (
    <>
      <SectionRuntimeAssets />
      <PreviewSiteViewer subdomain={subdomain} mode="live" initialSections={initialSections} />
    </>
  );
}
