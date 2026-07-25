import { notFound, redirect } from "next/navigation";

import { getVariant } from "@/components/sections/registry";
import { EditorShell } from "@/components/editor/EditorShell";
import { SectionBlock } from "@/components/editor/SectionBlock";
import { SiteFrame } from "@/components/site/SiteFrame";
import { requireCollegeBySubdomain } from "@/lib/auth/current";
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
  // it to pick a design rather than showing an empty editor.
  if (!college.templateId) redirect("/templates");

  const data = await getEditorPage(subdomain, pageSlug);
  if (!data) notFound();

  const { sections, theme } = data;

  return (
    <EditorShell data={data}>
      {/*
        Sections are rendered on the server with the very same components the
        public site uses, then handed to the client block wrapper as children.
        The editor shows the real site, not a mock of it.
      */}
      <SiteFrame colors={theme.colors} fonts={theme.fonts}>
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
