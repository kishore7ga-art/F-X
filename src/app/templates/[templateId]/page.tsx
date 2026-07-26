import { notFound } from "next/navigation";

import { ThemePicker } from "@/components/theme-picker/ThemePicker";
import { requireCurrentCollege } from "@/lib/auth/current";
import { prisma } from "@/lib/db";
import { parsePaletteColors } from "@/lib/theme/theme";

export const dynamic = "force-dynamic";

/** Screen 2 — template preview + theme pick. */
export default async function TemplateThemePickerPage({
  params,
}: PageProps<"/templates/[templateId]">) {
  const { templateId } = await params;

  const [template, palettes, fonts, college] = await Promise.all([
    prisma.template.findUnique({ where: { id: templateId } }),
    prisma.themePalette.findMany({ orderBy: { name: "asc" } }),
    prisma.themeFont.findMany({ orderBy: { name: "asc" } }),
    requireCurrentCollege(),
  ]);

  // Pages, not templateId: the "View demo site" link renders a page, and a
  // college can carry a templateId while still having nothing to show.
  const pageCount = await prisma.page.count({ where: { collegeId: college.id } });

  if (!template) notFound();
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

  // Load every font pack's families so the picker can render each option in
  // its own typeface.
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
        collegeId={college.id}
        subdomain={college.subdomain}
        template={{
          id: template.id,
          name: template.name,
          description: template.description,
        }}
        palettes={paletteOptions}
        fonts={fontOptions}
        initialPaletteId={college.themePaletteId ?? paletteOptions[0].id}
        initialFontId={college.themeFontId ?? fontOptions[0].id}
        hasSite={pageCount > 0}
      />
    </>
  );
}
