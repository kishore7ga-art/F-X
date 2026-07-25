import { SECTION_TYPE_LABELS } from "@/components/sections/registry";
import { prisma } from "@/lib/db";
import {
  isSupportedSectionType,
  type SupportedSectionType,
} from "@/lib/sections/schemas";
import {
  DEFAULT_FONTS,
  parsePaletteColors,
  type FontPack,
  type PaletteColors,
} from "@/lib/theme/theme";

export type EditorVariant = {
  id: string;
  variantName: string;
  componentKey: string;
};

export type EditorSection = {
  id: string;
  sectionId: string;
  sectionType: SupportedSectionType;
  label: string;
  variantId: string;
  componentKey: string;
  variantName: string;
  displayOrder: number;
  isVisible: boolean;
  content: unknown;
  /** All design variants of this section type, for the ↻ button. */
  variants: EditorVariant[];
};

export type AddableSection = {
  sectionId: string;
  sectionType: SupportedSectionType;
  label: string;
};

export type EditorPageData = {
  college: {
    id: string;
    name: string;
    subdomain: string;
    status: string;
    templateName: string | null;
  };
  theme: { colors: PaletteColors; fonts: FontPack };
  pages: { id: string; slug: string; title: string }[];
  currentPage: { id: string; slug: string; title: string };
  sections: EditorSection[];
  addableSections: AddableSection[];
};

/** Everything the section editor needs for one page of one college. */
export async function getEditorPage(
  subdomain: string,
  pageSlug?: string,
): Promise<EditorPageData | null> {
  const college = await prisma.college.findUnique({
    where: { subdomain },
    include: {
      themePalette: true,
      themeFont: true,
      template: {
        include: {
          sections: {
            orderBy: { defaultOrder: "asc" },
            include: { variants: { orderBy: { variantName: "asc" } } },
          },
        },
      },
      pages: { orderBy: { navOrder: "asc" } },
    },
  });

  if (!college) return null;

  const currentPage = pageSlug
    ? college.pages.find((page) => page.slug === pageSlug)
    : college.pages[0];

  if (!currentPage) return null;

  // Hidden sections are included — the editor must be able to switch them on.
  const rows = await prisma.collegeSection.findMany({
    where: { collegeId: college.id, pageId: currentPage.id },
    orderBy: { displayOrder: "asc" },
    include: {
      section: { include: { variants: { orderBy: { variantName: "asc" } } } },
      variant: true,
    },
  });

  const sections: EditorSection[] = [];
  for (const row of rows) {
    if (!isSupportedSectionType(row.section.sectionType)) continue;
    sections.push({
      id: row.id,
      sectionId: row.sectionId,
      sectionType: row.section.sectionType,
      label: SECTION_TYPE_LABELS[row.section.sectionType],
      variantId: row.variantId,
      componentKey: row.variant.componentKey,
      variantName: row.variant.variantName,
      displayOrder: row.displayOrder,
      isVisible: row.isVisible,
      content: row.content,
      variants: row.section.variants.map((v) => ({
        id: v.id,
        variantName: v.variantName,
        componentKey: v.componentKey,
      })),
    });
  }

  const addableSections: AddableSection[] = (college.template?.sections ?? [])
    .filter(
      (section) =>
        isSupportedSectionType(section.sectionType) &&
        section.variants.length > 0,
    )
    .map((section) => ({
      sectionId: section.id,
      sectionType: section.sectionType as SupportedSectionType,
      label: SECTION_TYPE_LABELS[section.sectionType as SupportedSectionType],
    }));

  return {
    college: {
      id: college.id,
      name: college.name,
      subdomain: college.subdomain,
      status: college.status,
      templateName: college.template?.name ?? null,
    },
    theme: {
      colors: parsePaletteColors(college.themePalette?.colors),
      fonts: college.themeFont
        ? {
            headingFont: college.themeFont.headingFont,
            bodyFont: college.themeFont.bodyFont,
          }
        : DEFAULT_FONTS,
    },
    pages: college.pages.map(({ id, slug, title }) => ({ id, slug, title })),
    currentPage: {
      id: currentPage.id,
      slug: currentPage.slug,
      title: currentPage.title,
    },
    sections,
    addableSections,
  };
}
