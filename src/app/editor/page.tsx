import { requireCurrentCollege } from "@/lib/auth/current";
import { EditorStudio } from "@/components/editor/EditorStudio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Visual Live Editor Studio — XITE",
};

export default async function EditorPage() {
  const college = await requireCurrentCollege("greenfield");
  return <EditorStudio subdomain={college.subdomain} collegeName={college.name} />;
}
