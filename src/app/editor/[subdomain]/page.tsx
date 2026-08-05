import { requireCurrentCollege } from "@/lib/auth/current";
import { EditorStudio } from "@/components/editor/EditorStudio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Visual Live Editor Studio — XITE",
};

export default async function TenantEditorPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const college = await requireCurrentCollege(subdomain);
  return <EditorStudio subdomain={college.subdomain} collegeName={college.name} />;
}
