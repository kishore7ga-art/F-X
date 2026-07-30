import { getVariant } from "@/components/sections/registry";
import type { RenderableSection } from "@/lib/site/queries";

/**
 * The rendering engine: walks a college's ordered `college_sections` rows and
 * renders each one through its variant component, parsing the content JSON on
 * the way. An unknown component_key or malformed content skips that section
 * rather than breaking the whole page.
 */
export function SectionList({ sections }: { sections: RenderableSection[] }) {
  return (
    <>
      {sections.map((section) => {
        const variant = getVariant(section.componentKey);
        if (!variant) return null;
        return <div key={section.id}>{variant.render(section.content)}</div>;
      })}
    </>
  );
}
