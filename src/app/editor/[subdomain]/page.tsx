import { requireCurrentCollege } from "@/lib/auth/current";
import { EditorStudio } from "@/components/editor/EditorStudio";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";

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
  // The same environment the published site renders in — Tailwind's Play CDN has
  // to be in the HTML rather than appended later, or sections written with Tailwind
  // classes render unstyled in the studio and styled once published.
  return (
    <>
      <SectionRuntimeAssets />
      <EditorStudio subdomain={college.subdomain} collegeName={college.name} />
    </>
  );
}
