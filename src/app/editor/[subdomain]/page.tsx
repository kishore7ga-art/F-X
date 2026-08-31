import { requireCollegeBySubdomain } from "@/lib/auth/current";
import { EditorStudio } from "@/components/editor/EditorStudio";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Visual Live Editor Studio — XITE",
};

/**
 * Gates the stand-in college below. Without this gate, every failed
 * `requireCollegeBySubdomain` — an expired session, a real tenant that isn't
 * signed in, a wrong subdomain — would silently render a fake college's
 * editor instead of the redirect/error the auth check is there to produce.
 * That is a real auth bypass on the tenant editor, not preview convenience,
 * so the fallback below only fires when preview mode is explicitly on.
 */
const UI_PREVIEW = process.env.NEXT_PUBLIC_UI_PREVIEW === "1";

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
  let college: { subdomain: string; name: string };
  if (UI_PREVIEW) {
    try {
      college = await requireCollegeBySubdomain(subdomain);
    } catch {
      college = { subdomain, name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} University` };
    }
  } else {
    college = await requireCollegeBySubdomain(subdomain);
  }
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
