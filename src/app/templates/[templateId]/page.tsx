import { notFound } from "next/navigation";

import { ThemePicker } from "@/components/theme-picker/ThemePicker";
import { requireCurrentCollege } from "@/lib/auth/current";
import { getTemplateDetail, listTemplates } from "@/lib/site/templates";
import { parsePaletteColors } from "@/lib/theme/theme";

export const dynamic = "force-dynamic";

/** Screen 2 — template preview + theme pick. */
export default async function TemplateThemePickerPage({
  params,
}: PageProps<"/templates/[templateId]">) {
  const { templateId } = await params;

  const [detail, college, allTemplates] = await Promise.all([
    getTemplateDetail(templateId),
    requireCurrentCollege(),
    listTemplates(),
  ]);

  if (!detail) notFound();

  const { template, palettes, fonts } = detail;
  if (palettes.length === 0 || fonts.length === 0) {
    throw new Error("No theme palettes or font packs configured");
  }

  const paletteOptions = palettes.map((palette) => ({
    id: palette.id,
    name: palette.name,
    colors: parsePaletteColors(palette.colors),
  }));

  const fontOptions = fonts.map((font) => ({
    id: font.id,
    name: font.name,
    headingFont: font.headingFont,
    bodyFont: font.bodyFont,
  }));

  const previewFamilies = Array.from(
    new Set(fonts.flatMap((f) => [f.headingFont, f.bodyFont])),
  )
    .map((family) => `family=${family.trim().replace(/\s+/g, "+")}:wght@400;600;700`)
    .join("&");

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?${previewFamilies}&display=swap`}
      />
      <ThemePicker
        subdomain={college.subdomain}
        template={{
          id: template.id,
          name: template.name,
          description: template.description,
          demoUrl: template.demoUrl,
        }}
        allTemplates={allTemplates}
        palettes={paletteOptions}
        fonts={fontOptions}
        initialPaletteId={college.themePaletteId ?? paletteOptions[0].id}
        initialFontId={college.themeFontId ?? fontOptions[0].id}
      />
    </>
  );
}
