"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { stableStringify } from "@/lib/json-stable";
import { defaultContentFor } from "@/lib/sections/defaults";
import { personalize } from "@/lib/sections/personalize";
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
      section: true,
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

  /**
   * The designs for this section's *type*, from the shared library.
   *
   * Was `row.section.variants` — the designs attached to this one template slot.
   * Now that the library is shared, the ↻ button reaches every active design of
   * the type, which is what the schema always claimed it did.
   */
  const variants = await prisma.sectionVariant.findMany({
    where: { sectionType: row.section.sectionType, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { variantName: "asc" }],
    select: { id: true },
  });
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

// --- Duplicate ----------------------------------------------------------------

export async function duplicateSection(input: z.infer<typeof sectionRefSchema>) {
  const { collegeSectionId } = sectionRefSchema.parse(input);
  const collegeId = await currentCollegeId();
  const row = await loadOwnedSection(collegeSectionId, collegeId);

  await prisma.$transaction([
    prisma.collegeSection.updateMany({
      where: { collegeId, pageId: row.pageId, displayOrder: { gt: row.displayOrder } },
      data: { displayOrder: { increment: 1 } },
    }),
    prisma.collegeSection.create({
      data: {
        collegeId,
        pageId: row.pageId,
        sectionId: row.sectionId,
        variantId: row.variantId,
        displayOrder: row.displayOrder + 1,
        isVisible: true,
        content: JSON.parse(JSON.stringify(row.content ?? {})),
      },
    }),
  ]);

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
    prisma.section.findUnique({ where: { id: sectionId } }),
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

  /**
   * The slot's own lead design, falling back to the library's first.
   *
   * `defaultVariantId` is what the migration preserved so that adding a section
   * lands on this template's look rather than on whichever design the shared
   * library happens to list first.
   */
  const variantId =
    (section.defaultVariantId
      ? (
          await prisma.sectionVariant.findFirst({
            where: { id: section.defaultVariantId, isActive: true },
            select: { id: true },
          })
        )?.id
      : null) ??
    (
      await prisma.sectionVariant.findFirst({
        where: { sectionType: section.sectionType, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { variantName: "asc" }],
        select: { id: true },
      })
    )?.id;
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
        content: personalize(
          section.defaultContent ??
            defaultContentFor(section.sectionType, college.name),
          college.name,
        ) as never,
      },
    }),
  ]);

  revalidateEditor(college.subdomain);
}

// --- Content ------------------------------------------------------------------

const SAVE_TRIGGERS = [
  "typing",
  "drag",
  "color",
  "font",
  "image",
  "delete",
  "resize",
  "section_update",
  "restore",
] as const;

/**
 * Snapshots kept per section.
 *
 * A two-second debounce across every action type writes history faster than
 * anyone will read it, so this is bounded rather than swept on a schedule: a
 * cron that has not run yet is not a retention policy. Fifty covers a long
 * editing session; older than that, the college wants the published site back,
 * not keystroke 51.
 */
const RETAINED_VERSIONS = 50;

const contentSchema = z.object({
  collegeSectionId: idSchema,
  content: z.unknown(),
  trigger: z.enum(SAVE_TRIGGERS).default("typing"),
});

/**
 * Saves the content-edit form, validated against the section type's schema.
 *
 * Called on a debounce as the college types rather than from a Save button, so
 * it runs often and must stay cheap. Concurrent editors are last-write-wins:
 * two tabs on one section will overwrite each other, which is the documented
 * MVP trade rather than an oversight.
 *
 * Returns the save time so the caller can show it without a round trip.
 */
export async function updateSectionContent(
  input: z.infer<typeof contentSchema>,
): Promise<{ savedAt: string }> {
  const { collegeSectionId, content, trigger } = contentSchema.parse(input);
  const row = await loadOwnedSection(collegeSectionId, await currentCollegeId());

  if (!isSupportedSectionType(row.section.sectionType)) {
    throw new Error("Section type is not editable");
  }

  const parsed = parseSectionContent(row.section.sectionType, content);

  // A save that changed nothing still happens — refocusing a field, a retry
  // landing after the first attempt already succeeded — and each one would add
  // an identical snapshot, burying the versions that differ.
  const changed =
    stableStringify(parsed) !== stableStringify(row.content ?? null);

  const savedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.collegeSection.update({
      where: { id: row.id },
      data: { content: parsed, lastSavedAt: savedAt },
    });

    if (!changed) return;

    await tx.collegeSectionHistory.create({
      data: {
        collegeSectionId: row.id,
        contentSnapshot: parsed,
        saveTrigger: trigger,
        savedAt,
      },
    });

    // Prune here rather than on a schedule, so the bound holds even if no
    // scheduled job is ever wired up.
    const stale = await tx.collegeSectionHistory.findMany({
      where: { collegeSectionId: row.id },
      orderBy: { savedAt: "desc" },
      skip: RETAINED_VERSIONS,
      select: { id: true },
    });
    if (stale.length) {
      await tx.collegeSectionHistory.deleteMany({
        where: { id: { in: stale.map((s) => s.id) } },
      });
    }
  });

  revalidateEditor(row.college.subdomain);

  return { savedAt: savedAt.toISOString() };
}

/** Snapshots for one section, newest first, for the restore timeline. */
export async function listSectionHistory(
  input: z.infer<typeof sectionRefSchema>,
): Promise<
  { id: string; savedAt: string; saveTrigger: string; isCurrent: boolean }[]
> {
  const { collegeSectionId } = sectionRefSchema.parse(input);
  const row = await loadOwnedSection(collegeSectionId, await currentCollegeId());

  const versions = await prisma.collegeSectionHistory.findMany({
    where: { collegeSectionId: row.id },
    orderBy: { savedAt: "desc" },
    select: { id: true, savedAt: true, saveTrigger: true, contentSnapshot: true },
  });

  const live = stableStringify(row.content ?? null);

  return versions.map((version) => ({
    id: version.id,
    savedAt: version.savedAt.toISOString(),
    saveTrigger: version.saveTrigger,
    isCurrent: stableStringify(version.contentSnapshot) === live,
  }));
}

const restoreSchema = z.object({
  collegeSectionId: idSchema,
  versionId: idSchema,
});

/**
 * Rolls a section's content back to a snapshot.
 *
 * The restore is itself a save, so it gets its own history row. Rolling back
 * must never be the one action you cannot undo.
 */
export async function restoreSectionVersion(
  input: z.infer<typeof restoreSchema>,
): Promise<{ savedAt: string }> {
  const { collegeSectionId, versionId } = restoreSchema.parse(input);
  const row = await loadOwnedSection(collegeSectionId, await currentCollegeId());

  const version = await prisma.collegeSectionHistory.findFirst({
    // Scoped to this section, so a known id from another college is useless.
    where: { id: versionId, collegeSectionId: row.id },
  });
  if (!version) throw new Error("That version no longer exists");

  return updateSectionContent({
    collegeSectionId: row.id,
    content: version.contentSnapshot,
    trigger: "restore",
  });
}
