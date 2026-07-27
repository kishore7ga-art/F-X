"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { defaultContentFor } from "@/lib/sections/defaults";
import { personalize } from "@/lib/sections/personalize";
import { isSupportedSectionType } from "@/lib/sections/schemas";
import { DEFAULT_PAGES } from "@/lib/site/starter";

const startWithDesignSchema = z.object({
  templateId: z.string().min(1),
  paletteId: z.string().min(1),
  fontId: z.string().min(1),
});

export type StartWithDesignInput = z.infer<typeof startWithDesignSchema>;

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
          include: { variants: { orderBy: [{ sortOrder: "asc" }, { variantName: "asc" }] } },
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

/**
 * Template-level refresh: the whole site's look, not one section's.
 *
 * The per-section ↻ swaps a variant within a section type. This swaps the
 * template underneath every section at once, which is only a data operation
 * because content lives in `college_sections.content` as JSONB keyed by section
 * type rather than by template — so re-pointing section_id/variant_id carries
 * the college's text across untouched.
 *
 * Three cases, and the awkward two are why this is not a one-line update:
 *  - the new template has the section type    -> re-point, keep content
 *  - it does not                              -> hide the row, never delete it,
 *    so the text is still there on the next refresh
 *  - it has a type the college never had      -> add it hidden, for them to
 *    fill in rather than publish empty
 *
 * Palette and font packs are deliberately untouched: this changes layout, not
 * the college's chosen colours.
 */
export async function cycleTemplate() {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  const collegeId = session.collegeId;

  const college = await prisma.college.findUnique({
    where: { id: collegeId },
    select: { id: true, name: true, subdomain: true, templateId: true },
  });
  if (!college) throw new Error("College not found");

  const templates = await prisma.template.findMany({
    orderBy: { name: "asc" },
    select: { id: true },
  });
  // Nothing to cycle to. Not an error — the button is disabled for this too.
  if (templates.length < 2) return;

  // A college with no template yet lands on the first: findIndex gives -1, and
  // -1 + 1 is 0.
  const currentIndex = templates.findIndex((t) => t.id === college.templateId);
  const nextId = templates[(currentIndex + 1) % templates.length].id;

  const nextTemplate = await prisma.template.findUnique({
    where: { id: nextId },
    include: {
      sections: {
        orderBy: { defaultOrder: "asc" },
        include: { variants: { orderBy: [{ sortOrder: "asc" }, { variantName: "asc" }] } },
      },
    },
  });
  if (!nextTemplate) return;

  // Section type -> where it lands in the new template. First variant by name,
  // the same default provisionStarterSite and addSection both pick.
  const target = new Map<
    string,
    { sectionId: string; variantId: string; defaultContent: unknown }
  >();
  for (const section of nextTemplate.sections) {
    const variant = section.variants[0];
    if (!variant) continue;
    if (!isSupportedSectionType(section.sectionType as never)) continue;
    if (target.has(section.sectionType)) continue;
    target.set(section.sectionType, {
      sectionId: section.id,
      variantId: variant.id,
      defaultContent: section.defaultContent,
    });
  }

  const rows = await prisma.collegeSection.findMany({
    where: { collegeId },
    include: { section: { select: { sectionType: true } } },
    orderBy: { displayOrder: "asc" },
  });

  const homePage = await prisma.page.findFirst({
    where: { collegeId },
    orderBy: { navOrder: "asc" },
  });

  await prisma.$transaction(async (tx) => {
    const covered = new Set<string>();

    for (const row of rows) {
      const match = target.get(row.section.sectionType);
      if (match) {
        covered.add(row.section.sectionType);
        await tx.collegeSection.update({
          where: { id: row.id },
          data: { sectionId: match.sectionId, variantId: match.variantId },
        });
      } else {
        await tx.collegeSection.update({
          where: { id: row.id },
          data: { isVisible: false },
        });
      }
    }

    if (homePage) {
      let displayOrder = Math.max(0, ...rows.map((r) => r.displayOrder)) + 1;
      for (const [sectionType, slot] of target) {
        if (covered.has(sectionType)) continue;
        await tx.collegeSection.create({
          data: {
            collegeId,
            pageId: homePage.id,
            sectionId: slot.sectionId,
            variantId: slot.variantId,
            displayOrder: displayOrder++,
            isVisible: false,
            // Valid starter copy rather than {}: the editor renders hidden rows
            // so they can be toggled on, and an empty object has no fields for
            // the component to draw.
            content: starterContent(
              { sectionType, defaultContent: slot.defaultContent },
              college.name,
            ) as never,
          },
        });
      }
    }

    await tx.college.update({
      where: { id: college.id },
      data: { templateId: nextTemplate.id },
    });
  });

  revalidatePath(`/editor/${college.subdomain}`);
  revalidatePath(`/site/${college.subdomain}`);
  revalidatePath(`/preview/${college.subdomain}`);
}

type TemplateSection = {
  id: string;
  sectionType: string;
  defaultContent: unknown;
  variants: { id: string }[];
};

/**
 * Starter copy for a section: the template's own, falling back to the generic
 * stub only for a template seeded before default_content existed.
 */
function starterContent(
  section: { sectionType: string; defaultContent?: unknown },
  collegeName: string,
) {
  const starter =
    (section.defaultContent as object | null) ??
    defaultContentFor(section.sectionType as never, collegeName);

  // The token only exists in the template's copy; substituting it here is what
  // puts the college's own name on the page it just created.
  return personalize(starter, collegeName);
}

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
        content: starterContent(section, collegeName) as never,
      },
    });
  }
}
