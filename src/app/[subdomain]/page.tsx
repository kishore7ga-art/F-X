import { PreviewSiteViewer } from "@/components/preview/PreviewSiteViewer";

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
  return <PreviewSiteViewer subdomain={subdomain} />;
}
