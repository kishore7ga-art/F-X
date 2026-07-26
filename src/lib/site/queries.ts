import { prisma } from "@/lib/db";
import { defaultContentFor } from "@/lib/sections/defaults";
import { isSupportedSectionType } from "@/lib/sections/schemas";
import { DEFAULT_PAGES } from "@/lib/site/starter";
import {
  DEFAULT_FONTS,
  parsePaletteColors,
  type FontPack,
  type PaletteColors,
} from "@/lib/theme/theme";
import type { SectionType } from "@/generated/prisma/enums";

export type RenderableSection = {
  id: string;
  sectionType: SectionType;
  componentKey: string;
  variantId: string;
  variantName: string;
  displayOrder: number;
  isVisible: boolean;
  content: unknown;
};

export type SiteNavPage = {
  id: string;
  slug: string;
  title: string;
};

export type SitePageData = {
  college: {
    id: string;
    name: string;
    subdomain: string;
    status: string;
  };
  theme: { colors: PaletteColors; fonts: FontPack };
  pages: SiteNavPage[];
  currentPage: SiteNavPage;
  sections: RenderableSection[];
};

/**
 * Everything needed to render one page of one college's site. A single query
 * path serves every tenant — this is the multi-tenant rendering engine.
 *
 * `includeHidden` is used by the editor, which must show hidden sections so
 * they can be toggled back on.
 */
export async function getSitePage(
  subdomain: string,
  pageSlug?: string,
  options: { includeHidden?: boolean } = {},
): Promise<SitePageData | null> {
  const college = await prisma.college.findUnique({
    where: { subdomain },
    include: {
      themePalette: true,
      themeFont: true,
      pages: { orderBy: { navOrder: "asc" } },
    },
  });

  if (!college) return null;

  const currentPage = pageSlug
    ? college.pages.find((page) => page.slug === pageSlug)
    : college.pages[0];

  if (!currentPage) return null;

  const collegeSections = await prisma.collegeSection.findMany({
    where: {
      collegeId: college.id,
      pageId: currentPage.id,
      ...(options.includeHidden ? {} : { isVisible: true }),
    },
    orderBy: { displayOrder: "asc" },
    include: { section: true, variant: true },
  });

  return {
    college: {
      id: college.id,
      name: college.name,
      subdomain: college.subdomain,
      status: college.status,
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
    sections: collegeSections.map((row) => ({
      id: row.id,
      sectionType: row.section.sectionType,
      componentKey: row.variant.componentKey,
      variantId: row.variantId,
      variantName: row.variant.variantName,
      displayOrder: row.displayOrder,
      isVisible: row.isVisible,
      content: row.content,
    })),
  };
}

/**
 * The same page shape, but derived from a template instead of read from a
 * college's saved sections — nothing is written.
 *
 * Screen 2 asks a college with no site yet to judge a design, which it cannot
 * do from an empty frame: before this, `getSitePage` correctly returned null
 * for a college with no pages and the preview iframe 404ed at exactly the
 * moment the template most needed showing. This renders what "Start with this
 * design" is about to create, using the same starter pages, the same first
 * variant per section and the same default copy, so the preview is a promise
 * the action keeps.
 */
export async function getTemplatePreview(
  subdomain: string,
  templateId: string,
): Promise<SitePageData | null> {
  const [college, template] = await Promise.all([
    prisma.college.findUnique({
      where: { subdomain },
      include: { themePalette: true, themeFont: true },
    }),
    prisma.template.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: { defaultOrder: "asc" },
          include: { variants: { orderBy: { variantName: "asc" } } },
        },
      },
    }),
  ]);

  if (!college || !template) return null;

  // Ids that cannot collide with a real row: these sections are never saved,
  // and treating one as a database id would silently edit the wrong thing.
  const pages = DEFAULT_PAGES.map((page) => ({
    id: `preview:${page.slug}`,
    slug: page.slug,
    title: page.title,
  }));

  const sections: RenderableSection[] = [];
  let displayOrder = 1;

  for (const section of template.sections) {
    // First variant by name, matching provisionStarterSite's choice.
    const variant = section.variants[0];
    if (!variant) continue;
    if (!isSupportedSectionType(section.sectionType as never)) continue;

    sections.push({
      id: `preview:${section.id}`,
      sectionType: section.sectionType,
      componentKey: variant.componentKey,
      variantId: variant.id,
      variantName: variant.variantName,
      displayOrder: displayOrder++,
      isVisible: true,
      content: defaultContentFor(section.sectionType as never, college.name),
    });
  }

  return {
    college: {
      id: college.id,
      name: college.name,
      subdomain: college.subdomain,
      status: college.status,
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
    pages,
    currentPage: pages[0],
    sections,
  };
}
