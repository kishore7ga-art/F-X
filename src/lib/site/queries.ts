import { serverApi } from "@/lib/api/server";
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

/** What the public page renders into <head>. */
export type SiteSeo = {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalSlug: string | null;
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
  seo: SiteSeo;
  sections: RenderableSection[];
  /** True when this is a draft being shown to the college that owns it. */
  isOwnerPreview: boolean;
};

/** A college that exists but has not picked a design, so has nothing to render. */
export type SiteNotBuilt = {
  built: false;
  college: { name: string; subdomain: string };
};

/** What `GET /api/v1/sites/:subdomain` answers with. */
type SitePayload =
  | SiteNotBuilt
  | {
      built: true;
      college: SitePageData["college"];
      theme: {
        paletteColors: unknown;
        headingFont: string | null;
        bodyFont: string | null;
      };
      pages: SiteNavPage[];
      currentPage: SiteNavPage;
      seo: SiteSeo;
      sections: RenderableSection[];
      isOwnerPreview: boolean;
    };

/**
 * One page of one college's site, from the backend.
 *
 * This was a Prisma query against the frontend's own connection, which is
 * exactly why a wrong `DATABASE_URL` here turned every published site into a
 * 500 while the API reported itself healthy. The multi-tenant read lives in the
 * service that owns the data now.
 *
 * Draft visibility moved with it. The rule used to be applied afterwards, by
 * the caller, against a payload it had already been given — which works only
 * for as long as every caller remembers to ask. The backend decides it now, so
 * an unpublished site is simply not in the answer.
 *
 * `null` means nothing to show; a `built: false` result means the college is
 * real and one click from being a website, which is a different page.
 */
export async function getSitePage(
  subdomain: string,
  pageSlug?: string,
): Promise<SitePageData | SiteNotBuilt | null> {
  const query = pageSlug ? `?page=${encodeURIComponent(pageSlug)}` : "";
  const payload = await serverApi<SitePayload>(
    `/api/v1/sites/${encodeURIComponent(subdomain)}${query}`,
  );

  if (!payload) return null;
  if (!payload.built) return payload;

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
    pages: payload.pages,
    currentPage: payload.currentPage,
    seo: payload.seo,
    sections: payload.sections,
    isOwnerPreview: payload.isOwnerPreview,
  };
}

/** Narrows the union above, so callers read as intent rather than as a field check. */
export function isBuilt(
  data: SitePageData | SiteNotBuilt | null,
): data is SitePageData {
  return data !== null && !("built" in data && data.built === false);
}

/**
 * What a template would look like on this college, without writing anything.
 *
 * Screen 2 asks a college with no site yet to judge a design, which it cannot do
 * from an empty frame: the site read correctly answers "nothing here" for a
 * college with no pages, and the preview iframe went blank at exactly the moment
 * the template most needed showing. The backend generates what "Start with this
 * design" is about to create — same starter pages, same lead variant, same
 * default copy — so the preview is a promise the action keeps.
 *
 * It answers in the same shape as the site read, which is why one renderer draws
 * both and this only has to map the theme.
 */
export async function getTemplatePreview(
  subdomain: string,
  templateId: string,
): Promise<SitePageData | null> {
  const payload = await serverApi<Extract<SitePayload, { built: true }>>(
    `/api/v1/sites/${encodeURIComponent(subdomain)}/preview` +
      `?template=${encodeURIComponent(templateId)}`,
  );
  if (!payload) return null;

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
    pages: payload.pages,
    currentPage: payload.currentPage,
    seo: payload.seo,
    sections: payload.sections,
    isOwnerPreview: payload.isOwnerPreview,
  };
}

