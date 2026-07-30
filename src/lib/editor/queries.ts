import { SECTION_TYPE_LABELS } from "@/components/sections/registry";
import type { EditorPagePayload } from "@/lib/api-contract";
import { serverApi } from "@/lib/api/server";
import {
  isSupportedSectionType,
  type SupportedSectionType,
} from "@/lib/sections/schemas";
import { DEFAULT_PAGES } from "@/lib/site/starter";
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
  /** When this section was last written, for the autosave indicator. */
  lastSavedAt: string | null;
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
  currentPage: {
    id: string;
    slug: string;
    title: string;
    /** Per-page SEO, edited from the page tools panel. */
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    canonicalSlug: string | null;
  };
  sections: EditorSection[];
  addableSections: AddableSection[];
  /** Whether there is more than one design to cycle through. */
  templateCount: number;
};

/*
 * What `GET /api/v1/editor/:subdomain` answers with used to be described here,
 * derived from the view type above by subtraction: take EditorPageData, remove
 * the three fields the frontend adds, put back what the wire actually carries.
 * It was accurate and entirely unenforced — a field added to the backend's
 * response, or dropped from it, changed nothing here and failed at runtime.
 *
 * `EditorPagePayload` in the shared contract is that description, in the one
 * place the backend also annotates its own return with.
 */

/**
 * Everything the section editor needs for one page of one college.
 *
 * The query behind this ran here, against the frontend's own database
 * connection — a second copy of the same credential, which is one more place
 * for it to be wrong than the data is worth. The backend owns it now.
 *
 * Labels and the theme are assembled on this side on purpose. Both are how the
 * data is *shown*, the registry and palette parser already live here, and
 * shipping either to the backend would mean a tenth file kept in step across
 * two repos by hand.
 */
export async function getEditorPage(
  subdomain: string,
  pageSlug?: string,
): Promise<EditorPageData | null> {
  const query = pageSlug ? `?page=${encodeURIComponent(pageSlug)}` : "";
  const payload = await serverApi<EditorPagePayload>(
    `/api/v1/editor/${encodeURIComponent(subdomain)}${query}`,
  );
  if (!payload) return null;

  // The backend filters to supported types already; this narrows the string it
  // sends back to the union, and drops anything a version skew leaves unknown
  // rather than rendering a section with no label.
  const sections: EditorSection[] = [];
  for (const section of payload.sections) {
    if (!isSupportedSectionType(section.sectionType)) continue;
    sections.push({
      ...section,
      sectionType: section.sectionType,
      label: SECTION_TYPE_LABELS[section.sectionType],
    });
  }

  const addableSections: AddableSection[] = [];
  for (const section of payload.addableSections) {
    if (!isSupportedSectionType(section.sectionType)) continue;
    addableSections.push({
      sectionId: section.sectionId,
      sectionType: section.sectionType,
      label: SECTION_TYPE_LABELS[section.sectionType],
    });
  }

  // Build complete page list combining default college pages with API payload pages
  const pageMap = new Map<string, { id: string; slug: string; title: string }>();
  for (const p of DEFAULT_PAGES) {
    pageMap.set(p.slug, { id: `page-${p.slug}`, slug: p.slug, title: p.title });
  }
  for (const p of payload.pages) {
    pageMap.set(p.slug, p);
  }
  const fullPages = Array.from(pageMap.values());

  const currentSlug = pageSlug || payload.currentPage?.slug || "home";
  const activePage = pageMap.get(currentSlug) || {
    id: `page-${currentSlug}`,
    slug: currentSlug,
    title: currentSlug.charAt(0).toUpperCase() + currentSlug.slice(1),
  };

  const currentPage = {
    ...activePage,
    metaTitle: payload.currentPage?.metaTitle ?? null,
    metaDescription: payload.currentPage?.metaDescription ?? null,
    ogImage: payload.currentPage?.ogImage ?? null,
    canonicalSlug: payload.currentPage?.canonicalSlug ?? null,
  };

  return {
    college: payload.college,
    theme: {
      colors: parsePaletteColors(payload.theme.paletteColors),
      fonts:
        payload.theme.headingFont && payload.theme.bodyFont
          ? {
              headingFont: payload.theme.headingFont,
              bodyFont: payload.theme.bodyFont,
            }
          : DEFAULT_FONTS,
    },
    pages: fullPages,
    currentPage,
    sections,
    addableSections,
    templateCount: payload.templateCount,
  };
}
