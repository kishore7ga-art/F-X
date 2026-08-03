import { EditorStudio } from "@/components/editor/EditorStudio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Visual Live Editor Studio — XITE",
};

export default async function TenantEditorPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  return <EditorStudio subdomain={subdomain} collegeName={`${subdomain.toUpperCase()} College`} />;
}
