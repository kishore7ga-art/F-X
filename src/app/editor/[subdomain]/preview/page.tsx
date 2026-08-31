import { requireCollegeBySubdomain } from "@/lib/auth/current";
import { PreviewSiteViewer } from "@/components/preview/PreviewSiteViewer";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";
import { loadMyDraftSections } from "@/lib/site-sections.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Draft Preview — XITE",
};

/**
 * What the editor's "Preview" button actually opens.
 *
 * `/site/[subdomain]` and `/preview/[subdomain]` both read `publishedSiteConfig`
 * on the backend — the tenant's last *published* snapshot, not their last
 * *saved* one. Once a tenant has published even once, that fallback stops
 * covering their draft (see `publishedSiteConfig` in xite-B), so opening either
 * of those after an edit shows old, possibly unrelated content and looks
 * exactly like a broken save.
 *
 * This route is gated the same way `/editor/[subdomain]` is — real tenant
 * auth, no `NEXT_PUBLIC_UI_PREVIEW` fallback — and reads the draft through
 * `/api/v1/my-website`, the session-scoped endpoint the editor itself saves
 * to. So a click here shows the same content Save just persisted, whether or
 * not the site has ever been published.
 */
export default async function DraftPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { subdomain } = await params;
  const { page } = await searchParams;
  const college = await requireCollegeBySubdomain(subdomain);
  const initialSections = await loadMyDraftSections(page);

  return (
    <>
      <SectionRuntimeAssets />
      <PreviewSiteViewer
        subdomain={college.subdomain}
        mode="draft"
        pageSlug={page}
        initialSections={initialSections}
      />
    </>
  );
}
