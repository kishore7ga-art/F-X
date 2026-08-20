import { requireCollegeBySubdomain } from "@/lib/auth/current";
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
  // `requireCollegeBySubdomain`, not `requireCurrentCollege`: the latter returns
  // the session's college and never looks at the subdomain in the URL, so
  // /editor/<somebody-else> rendered happily under their address. The session
  // still scoped every read and write, so no other tenant's data was reachable —
  // but a multi-tenant product should not serve one tenant at another's URL, and
  // the guard that says so already existed and simply was not used here.
  const college = await requireCollegeBySubdomain(subdomain);
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
