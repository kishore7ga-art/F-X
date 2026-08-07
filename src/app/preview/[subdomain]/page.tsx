import { PreviewSiteViewer } from "@/components/preview/PreviewSiteViewer";

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
  return <PreviewSiteViewer subdomain={subdomain} />;
}
