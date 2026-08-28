import { requireCurrentCollege, requireOnboarded } from "@/lib/auth/current";
import { EditorStudio } from "@/components/editor/EditorStudio";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Visual Live Editor Studio — XITE",
};

export default async function EditorPage() {
  // Gated on onboarding for the same reason /editor/[subdomain] is: the login
  // response's `next` is a hint to the browser, and typing this path skips it.
  const college = requireOnboarded(await requireCurrentCollege("greenfield"));
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
