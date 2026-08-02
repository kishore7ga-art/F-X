import { notFound, redirect } from "next/navigation";

import { getVariant } from "@/components/sections/registry";
import { EditorShell } from "@/components/editor/EditorShell";
import { SectionBlock } from "@/components/editor/SectionBlock";
import { SiteFrame } from "@/components/site/SiteFrame";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { requireCollegeBySubdomain } from "@/lib/auth/current";
import { AUTH_DISABLED } from "@/lib/auth/open-access";
import { getEditorPage } from "@/lib/editor/queries";

export const dynamic = "force-dynamic";

/** Screen 3 — the section editor. */
export default async function EditorPage({
  params,
  searchParams,
}: PageProps<"/editor/[subdomain]">) {
  const { subdomain } = await params;
  const { page } = await searchParams;
  const pageSlug = typeof page === "string" ? page : undefined;

  // Signed out -> /login. Signed in as a different college -> own editor.
  const college = await requireCollegeBySubdomain(subdomain);

  // A freshly signed-up college has no template, pages or sections yet — send
  // it to auto-build with the Admin template rather than showing an empty editor.
  if (!college.templateId) redirect("/start");

  const data = await getEditorPage(subdomain, pageSlug);
  if (!data) notFound();

  const { sections, theme } = data;

  return (
    <EditorShell
      data={data}
      canSignOut={!AUTH_DISABLED}
      canCycleTemplate={data.templateCount > 1}
    >
      <SiteFrame colors={theme.colors} fonts={theme.fonts}>
        {/* Render real college header navbar */}
        <SiteHeader
          collegeName={college.name}
          subdomain={college.subdomain}
          pages={data.pages}
          currentSlug={data.currentPage.slug}
          isEditor={true}
        />

        {sections.map((section, index) => {
          const variant = getVariant(section.componentKey);
          return (
            <SectionBlock
              key={section.id}
              section={section}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
            >
              {variant ? (
                variant.render(section.content)
              ) : (
                <UnknownVariant componentKey={section.componentKey} />
              )}
            </SectionBlock>
          );
        })}

        {/* Render real college footer */}
        <SiteFooter collegeName={college.name} />
      </SiteFrame>
    </EditorShell>
  );
}

function UnknownVariant({ componentKey }: { componentKey: string }) {
  return (
    <div className="bg-amber-50 px-6 py-10 text-center text-sm text-amber-800">
      No component registered for <code>{componentKey}</code>.
    </div>
  );
}
