import { EditorStudio } from "@/components/editor/EditorStudio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Visual Live Editor Studio — XITE",
};

interface SlugEditorPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function SlugEditorPage({ params }: SlugEditorPageProps) {
  const resolvedParams = await params;
  const slugArray = resolvedParams?.slug || [];
  const subdomain = slugArray[0] || "greenfield";
  const collegeName =
    subdomain
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") + " College";

  return <EditorStudio subdomain={subdomain} collegeName={collegeName} />;
}
