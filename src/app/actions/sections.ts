"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { defaultContentFor } from "@/lib/sections/defaults";
import {
  isSupportedSectionType,
  parseSectionContent,
} from "@/lib/sections/schemas";

const idSchema = z.string().min(1);

/**
 * The tenant for this request. Never taken from the client: a caller who knew
 * another college's ids could otherwise edit their site.
 */
async function currentCollegeId(): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  return session.collegeId;
}

/** Loads a college_section, refusing anything outside the current tenant. */
async function loadOwnedSection(collegeSectionId: string, collegeId: string) {
  const row = await prisma.collegeSection.findFirst({
    where: { id: collegeSectionId, collegeId },
    include: {
      section: { include: { variants: { orderBy: { variantName: "asc" } } } },
      college: { select: { subdomain: true, name: true } },
    },
  });
  if (!row) throw new Error("Section not found for this college");
  return row;
}

function revalidateEditor(subdomain: string) {
  revalidatePath(`/editor/${subdomain}`);
  revalidatePath(`/site/${subdomain}`);
  revalidatePath(`/preview/${subdomain}`);
}

// --- Reorder -----------------------------------------------------------------

const moveSchema = z.object({
  collegeSectionId: idSchema,
  direction: z.enum(["up", "down"]),
});

/** Swaps display_order with the adjacent section on the same page. */
export async function moveSection(input: z.infer<typeof moveSchema>) {
  const { collegeSectionId, direction } = moveSchema.parse(input);
  const collegeId = await currentCollegeId();
  const row = await loadOwnedSection(collegeSectionId, collegeId);

  const neighbour = await prisma.collegeSection.findFirst({
    where: {
      collegeId,
      pageId: row.pageId,
      displayOrder:
        direction === "up"
          ? { lt: row.displayOrder }
          : { gt: row.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  // Already at the top or bottom.
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.collegeSection.update({
      where: { id: row.id },
      data: { displayOrder: neighbour.displayOrder },
    }),
    prisma.collegeSection.update({
      where: { id: neighbour.id },
      data: { displayOrder: row.displayOrder },
    }),
  ]);

  revalidateEditor(row.college.subdomain);
}

// --- Refresh (swap design variant) -------------------------------------------

const sectionRefSchema = z.object({ collegeSectionId: idSchema });

/**
 * The ↻ button: advances to the next design variant of the same section type.
 *
 * Only `variant_id` changes. The `content` column is never read or written
 * here, which is what guarantees a refresh cannot lose a college's text.
 */
export async function cycleSectionVariant(
  input: z.infer<typeof sectionRefSchema>,
) {
  const { collegeSectionId } = sectionRefSchema.parse(input);
  const row = await loadOwnedSection(collegeSectionId, await currentCollegeId());

  const variants = row.section.variants;
  if (variants.length < 2) return;

  const currentIndex = variants.findIndex((v) => v.id === row.variantId);
  const next = variants[(currentIndex + 1) % variants.length];

  await prisma.collegeSection.update({
    where: { id: row.id },
    data: { variantId: next.id },
  });

  revalidateEditor(row.college.subdomain);
}

// --- Visibility ---------------------------------------------------------------

export async function toggleSectionVisibility(
  input: z.infer<typeof sectionRefSchema>,
) {
  const { collegeSectionId } = sectionRefSchema.parse(input);
  const row = await loadOwnedSection(collegeSectionId, await currentCollegeId());

  await prisma.collegeSection.update({
    where: { id: row.id },
    data: { isVisible: !row.isVisible },
  });

  revalidateEditor(row.college.subdomain);
}

// --- Delete -------------------------------------------------------------------

export async function deleteSection(input: z.infer<typeof sectionRefSchema>) {
  const { collegeSectionId } = sectionRefSchema.parse(input);
  const row = await loadOwnedSection(collegeSectionId, await currentCollegeId());

  if (row.section.isRequired) {
    throw new Error("This section is required by the template");
  }

  await prisma.collegeSection.delete({ where: { id: row.id } });
  revalidateEditor(row.college.subdomain);
}

// --- Add ----------------------------------------------------------------------

const addSchema = z.object({
  pageId: idSchema,
  sectionId: idSchema,
  /** Insert directly below the section with this display_order. */
  afterOrder: z.number().int().nonnegative(),
});

/** The + button: inserts a new section at that point in the page. */
export async function addSection(input: z.infer<typeof addSchema>) {
  const { pageId, sectionId, afterOrder } = addSchema.parse(input);
  const collegeId = await currentCollegeId();

  const [college, page, section] = await Promise.all([
    prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true, name: true, subdomain: true, templateId: true },
    }),
    prisma.page.findFirst({ where: { id: pageId, collegeId } }),
    prisma.section.findUnique({
      where: { id: sectionId },
      include: { variants: { orderBy: { variantName: "asc" } } },
    }),
  ]);

  if (!college) throw new Error("College not found");
  if (!page) throw new Error("Page not found for this college");
  if (!section) throw new Error("Section not found");
  if (section.templateId !== college.templateId) {
    throw new Error("Section does not belong to this college's template");
  }
  if (!isSupportedSectionType(section.sectionType)) {
    throw new Error("Section type is not renderable yet");
  }

  const variantId = section.variants[0]?.id;
  if (!variantId) throw new Error("Section has no design variants");

  // Make room, then insert.
  await prisma.$transaction([
    prisma.collegeSection.updateMany({
      where: { collegeId, pageId, displayOrder: { gt: afterOrder } },
      data: { displayOrder: { increment: 1 } },
    }),
    prisma.collegeSection.create({
      data: {
        collegeId,
        pageId,
        sectionId: section.id,
        variantId,
        displayOrder: afterOrder + 1,
        isVisible: true,
        content: defaultContentFor(section.sectionType, college.name),
      },
    }),
  ]);

  revalidateEditor(college.subdomain);
}

// --- Content ------------------------------------------------------------------

const contentSchema = z.object({
  collegeSectionId: idSchema,
  content: z.unknown(),
});

/** Saves the content-edit form, validated against the section type's schema. */
export async function updateSectionContent(
  input: z.infer<typeof contentSchema>,
) {
  const { collegeSectionId, content } = contentSchema.parse(input);
  const row = await loadOwnedSection(collegeSectionId, await currentCollegeId());

  if (!isSupportedSectionType(row.section.sectionType)) {
    throw new Error("Section type is not editable");
  }

  const parsed = parseSectionContent(row.section.sectionType, content);

  await prisma.collegeSection.update({
    where: { id: row.id },
    data: { content: parsed },
  });

  revalidateEditor(row.college.subdomain);
}
