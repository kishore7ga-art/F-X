import { SectionList } from "@/components/site/SectionList";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFrame } from "@/components/site/SiteFrame";
import { SiteHeader } from "@/components/site/SiteHeader";
import { collectAttributions } from "@/lib/sections/attributions";
import type { SitePageData } from "@/lib/site/queries";

/** A complete public page for one college. Used by every /site/* route. */
export function SiteView({ data }: { data: SitePageData }) {
  const { college, theme, pages, currentPage, sections } = data;

  return (
    <SiteFrame colors={theme.colors} fonts={theme.fonts}>
      <SiteHeader
        collegeName={college.name}
        subdomain={college.subdomain}
        pages={pages}
        currentSlug={currentPage.slug}
      />

      <main>
        {sections.length > 0 ? (
          <SectionList sections={sections} />
        ) : (
          <div className="px-6 py-24 text-center">
            <p className="text-lg opacity-60">
              This page has no sections yet.
            </p>
          </div>
        )}
      </main>

      <SiteFooter
        collegeName={college.name}
        attributions={collectAttributions(
          sections.map((section) => section.componentKey),
        )}
      />
    </SiteFrame>
  );
}
