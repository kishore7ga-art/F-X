import {
  findPage,
  homePage,
  pickPages,
  type PageItem,
  type SectionItem,
} from "@/lib/site-sections";
import type { AeoSettings, GeoSettings } from "@/lib/seo";

import { serverApi } from "./api/server";

/**
 * A published site's pages, fetched during the server render.
 *
 * The browser used to do this on mount, which meant the HTML a visitor received
 * was a spinner and the college's own site arrived a round trip later — a visible
 * flash on every load, and nothing but a spinner for anything that reads the page
 * without running scripts.
 *
 * It tries the same three sources, in the same order, as the browser does: the
 * public endpoint, the editor endpoint, then the platform default. An empty array
 * is a real answer here — it means "the client should try" — and the viewer
 * carries on with its own fetch, so a backend that is briefly unreachable at
 * render time costs a flash rather than a blank site.
 */
export async function loadSiteSections(subdomain: string): Promise<SectionItem[]> {
  return (await loadSiteView(subdomain)).sections;
}

/**
 * The settings a published page has to honour before it renders anything.
 *
 * Defaults are the safe ones: indexing on (so an existing site is not
 * de-indexed by a field arriving), maintenance off (so nobody's site is taken
 * down by a failed lookup), and no custom code (so a backend that cannot be
 * reached cannot cause markup to be emitted).
 */
export type SiteSettings = {
  indexingEnabled: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Absolute URL of the site's default social preview image. */
  ogImageUrl: string | null;
  /** The institution's own name, for `og:site_name` and the structured data. */
  siteName: string;
  /** Where this institution physically is, or null if it has not said. */
  geo: GeoSettings | null;
  /** What it declares itself to be, and the questions it has answered. */
  aeo: AeoSettings | null;
  maintenanceEnabled: boolean;
  maintenanceMessage: string | null;
  headHtml: string;
  bodyEndHtml: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  indexingEnabled: true,
  seoTitle: null,
  seoDescription: null,
  ogImageUrl: null,
  siteName: "",
  geo: null,
  aeo: null,
  maintenanceEnabled: false,
  maintenanceMessage: null,
  headHtml: "",
  bodyEndHtml: "",
};

/** The theme ids a published site renders in. Null means the default. */
export type SiteTheme = { themeId: string | null; fontId: string | null };

export const DEFAULT_SITE_THEME: SiteTheme = { themeId: null, fontId: null };

export type SiteView = {
  /** The requested page's sections, or the home page's when none was asked for. */
  sections: SectionItem[];
  /** Every page this site publishes, for navigation and for the sitemap. */
  pages: PageItem[];
  /** The page these sections came from, or `null` when the site has none. */
  page: PageItem | null;
  /**
   * False when a page was asked for by slug and this site does not have it.
   *
   * The caller turns this into a 404. It is deliberately distinct from
   * `pages.length === 0`, which means "this site publishes nothing at all" — a
   * different sentence for the visitor and a different status for a crawler.
   */
  found: boolean;
  settings: SiteSettings;
  theme: SiteTheme;
};

const EMPTY_VIEW: SiteView = {
  sections: [],
  pages: [],
  page: null,
  found: true,
  settings: DEFAULT_SITE_SETTINGS,
  theme: DEFAULT_SITE_THEME,
};

/**
 * One page of a published site, with the settings that govern it.
 *
 * `host` is forwarded so the backend can decide whether this tenant's custom
 * code is being served on their own domain, which is what determines whether
 * script in it is emitted or stripped. The decision is made there, not here:
 * the renderer is the party that would benefit from getting it wrong.
 *
 * `pageSlug` is the path the visitor asked for beneath the site's root —
 * `/about`, `/admissions/fees` — or undefined for the root itself. It used not
 * to be a parameter at all: every address of a tenant's site rendered
 * `pages[0]`, so the pages the editor lets a tenant create had no address of
 * their own and the links between them led nowhere.
 */
export async function loadSiteView(
  subdomain: string,
  host?: string,
  pageSlug?: string,
): Promise<SiteView> {
  const query = host ? `?host=${encodeURIComponent(host)}` : "";
  const paths = [
    `/api/v1/public/site/${encodeURIComponent(subdomain)}${query}`,
    `/api/v1/editor/${encodeURIComponent(subdomain)}`,
    "/api/v1/default-website",
  ];

  for (const path of paths) {
    try {
      const data = await serverApi<unknown>(path);
      if (!data) continue;

      const pages = pickPages(data);
      if (pages.length === 0) continue;

      const page = pageSlug === undefined ? homePage(pages) : findPage(pages, pageSlug);

      const raw = (data as { settings?: Partial<SiteSettings> })?.settings;
      const theme = (data as { theme?: Partial<SiteTheme> })?.theme;
      const college = (data as { college?: { name?: string } | null })?.college;

      const settings = raw
        ? { ...DEFAULT_SITE_SETTINGS, ...raw }
        : { ...DEFAULT_SITE_SETTINGS };

      /**
       * The institution's name, from wherever this response happens to carry it.
       *
       * `settings` is absent on the platform-default branch of the public
       * endpoint — the one that answers for a subdomain with no college row —
       * while `college.name` is present on both. Without this, `og:site_name`
       * and the `WebSite` node would be empty strings on exactly the sites that
       * have the least other metadata to fall back on.
       */
      if (!settings.siteName && college?.name) settings.siteName = college.name;

      return {
        sections: page?.sections ?? [],
        pages,
        page,
        found: page !== null,
        settings,
        theme: theme ? { ...DEFAULT_SITE_THEME, ...theme } : DEFAULT_SITE_THEME,
      };
    } catch {
      // Unreachable or erroring backend: fall through to the next source, and to
      // the client if none of them answer.
    }
  }

  return EMPTY_VIEW;
}
