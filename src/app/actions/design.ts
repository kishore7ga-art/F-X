"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { defaultContentFor } from "@/lib/sections/defaults";
import { isSupportedSectionType } from "@/lib/sections/schemas";

const startWithDesignSchema = z.object({
  templateId: z.string().min(1),
  paletteId: z.string().min(1),
  fontId: z.string().min(1),
});

export type StartWithDesignInput = z.infer<typeof startWithDesignSchema>;

const DEFAULT_PAGES = [
  { slug: "home", title: "Home", navOrder: 0 },
  { slug: "about", title: "About", navOrder: 1 },
  { slug: "admissions", title: "Admissions", navOrder: 2 },
  { slug: "contact", title: "Contact", navOrder: 3 },
];

/**
 * Screen 2's "Start with this design": saves the chosen template + theme onto
 * the college, provisions starter sections if it has none, then opens the
 * editor.
 *
 * Existing content is never touched — re-picking a theme only rewrites the
 * three foreign keys on `colleges`.
 */
export async function startWithThisDesign(input: StartWithDesignInput) {
  const { templateId, paletteId, fontId } = startWithDesignSchema.parse(input);

  // Tenant comes from the session, never from the request body.
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  const collegeId = session.collegeId;

  const [college, template, palette, font] = await Promise.all([
    prisma.college.findUnique({ where: { id: collegeId } }),
    prisma.template.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: { defaultOrder: "asc" },
          include: { variants: { orderBy: { variantName: "asc" } } },
        },
      },
    }),
    prisma.themePalette.findUnique({ where: { id: paletteId } }),
    prisma.themeFont.findUnique({ where: { id: fontId } }),
  ]);

  if (!college) throw new Error("College not found");
  if (!template) throw new Error("Template not found");
  if (!palette) throw new Error("Theme palette not found");
  if (!font) throw new Error("Font pack not found");

  await prisma.college.update({
    where: { id: college.id },
    data: {
      templateId: template.id,
      themePaletteId: palette.id,
      themeFontId: font.id,
    },
  });

  const existingSections = await prisma.collegeSection.count({
    where: { collegeId: college.id },
  });

  if (existingSections === 0) {
    await provisionStarterSite(college.id, college.name, template.sections);
  }

  redirect(`/editor/${college.subdomain}`);
}

type TemplateSection = {
  id: string;
  sectionType: string;
  variants: { id: string }[];
};

/** Creates the default pages and a starter set of sections for a new site. */
async function provisionStarterSite(
  collegeId: string,
  collegeName: string,
  templateSections: TemplateSection[],
) {
  const existingPages = await prisma.page.count({ where: { collegeId } });

  if (existingPages === 0) {
    await prisma.page.createMany({
      data: DEFAULT_PAGES.map((page) => ({ collegeId, ...page })),
    });
  }

  const homePage = await prisma.page.findFirst({
    where: { collegeId },
    orderBy: { navOrder: "asc" },
  });
  if (!homePage) return;

  let displayOrder = 1;
  for (const section of templateSections) {
    const variantId = section.variants[0]?.id;
    if (!variantId) continue;
    if (!isSupportedSectionType(section.sectionType as never)) continue;

    await prisma.collegeSection.create({
      data: {
        collegeId,
        sectionId: section.id,
        variantId,
        pageId: homePage.id,
        displayOrder: displayOrder++,
        isVisible: true,
        content: defaultContentFor(section.sectionType as never, collegeName),
      },
    });
  }
}
