import { prisma } from "@/lib/db";
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
