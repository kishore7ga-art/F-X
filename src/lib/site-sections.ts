/**
 * Reading a published site's pages out of whatever the API answered.
 *
 * Three endpoints can serve a site — the public one, the editor one, and the
 * platform default — and they wrap the same page array in three slightly
 * different envelopes. Both the server render and the browser's refresh need to
 * unwrap them the same way, so the unwrapping lives here rather than inside the
 * viewer, which is a client component and therefore cannot lend its functions to
 * a Server Component.
 *
 * ── Why this file grew a page concept ──────────────────────────────────────
 *
 * It used to answer one question — "the section array" — and answered it with
 * `payload.pages[0].sections`. A tenant's site is a list of pages; the editor
 * creates them, names them, slugs them, saves them and publishes them, and the
 * backend stores and returns all of them. The renderer then threw every page
 * but the first away, so a published site was permanently its home page: a
 * visitor following the site's own `<a href="/about">` got a 404 from the
 * platform, and every SEO field the tenant set applied to the only page anyone
 * could reach.
 *
 * Pages are the unit here now. `pickSections` still exists, and still answers
 * the old question, because "the home page's sections" is a real question — it
 * is just no longer the only one.
 */

export type SectionItem = {
  id: string;
  title: string;
  code: string;
};

/** A page's own search metadata. Every field null means "inherit the site's". */
export type PageSeoItem = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
  indexable: boolean | null;
};

export type PageItem = {
  /** Canonical: leading slash, lowercase, no trailing slash. Never empty. */
  slug: string;
  title: string;
  /** Null for every page saved before per-page SEO existed. */
  seo: PageSeoItem | null;
  sections: SectionItem[];
};

/**
 * `/about`, `about`, `//About/` and `about/` all name the same page.
 *
 * Deliberately the same rule as `canonicalSlug` in `useEditorPages` and in the
 * backend's `website-config-service`. A slug that three parts of the system
 * spell differently is a page that saves to one address and publishes to
 * another, which is the class of bug this platform has already had once.
 */
export function canonicalPageSlug(raw: unknown): string {
  const value = String(raw ?? "").trim().toLowerCase();
  const trimmed = value.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!trimmed) return "";
  return `/${trimmed.replace(/\s+/g, "-").replace(/[^a-z0-9/_-]/g, "")}`;
}

/** The slug the home page is stored under. */
export const HOME_SLUG = "/home";

/** Whether a slug names the home page, under either of its two spellings. */
export function isHomeSlug(slug: string): boolean {
  const canonical = canonicalPageSlug(slug);
  return canonical === "" || canonical === HOME_SLUG || canonical === "/";
}

/** The page array, whichever envelope it arrived in. */
export function pickPages(data: unknown): PageItem[] {
  const payload = (data || {}) as {
    sections?: unknown[];
    pages?: unknown[];
    config?: { pages?: unknown[] };
  };

  const rawPages = Array.isArray(payload.pages)
    ? payload.pages
    : Array.isArray(payload.config?.pages)
      ? payload.config.pages
      : null;

  if (rawPages) {
    const pages = rawPages
      .map((entry, index) => normalizePage(entry, index))
      .filter((page): page is PageItem => page !== null);
    if (pages.length > 0) return pages;
  }

  // An envelope carrying a bare section array — the older shape, and what the
  // default-website endpoint answers for a deployment with no pages. One page,
  // so every caller downstream has the same shape to read.
  if (Array.isArray(payload.sections) && payload.sections.length > 0) {
    return [
      { slug: HOME_SLUG, title: "Home", seo: null, sections: normalizeSections(payload.sections) },
    ];
  }

  return [];
}

/**
 * The page a visitor asked for, or `null` if this site has no such page.
 *
 * `null` is the honest answer and the caller turns it into a 404. Falling back
 * to the home page — which is what rendering the first page unconditionally
 * amounted to — makes every mistyped URL on a tenant's site return 200 and the
 * wrong content, which is worse for the visitor and much worse for a search
 * engine indexing it.
 */
export function findPage(pages: PageItem[], slug: unknown): PageItem | null {
  if (pages.length === 0) return null;

  const wanted = canonicalPageSlug(slug);
  if (!wanted || wanted === "/") return homePage(pages);

  return pages.find((page) => page.slug === wanted) ?? null;
}

/**
 * The page served at the site's root.
 *
 * `/home` by name where one exists, because that is the slug the editor and the
 * platform default both use; otherwise the first page, because a site whose
 * pages are `/admissions` and `/contact` still has to answer at `/`.
 */
export function homePage(pages: PageItem[]): PageItem | null {
  if (pages.length === 0) return null;
  return pages.find((page) => isHomeSlug(page.slug)) ?? pages[0] ?? null;
}

/**
 * The home page's sections, whichever envelope they arrived in.
 *
 * Kept because "what does this site show at its root" is still asked in two
 * places — the preview screen, which has no page routing, and the client-side
 * refresh's fallback.
 */
export function pickSections(data: unknown): SectionItem[] {
  return homePage(pickPages(data))?.sections ?? [];
}

/**
 * Trims an API section to the three fields that decide what renders.
 *
 * `code` is the section: raw HTML, authored in the Admin, rendered verbatim. The
 * id and title are only ever used for keying and for spotting the header, so
 * everything else the API sends is dropped here rather than carried around.
 */
export function normalizeSections(raw: unknown[]): SectionItem[] {
  return raw.map((entry, idx) => {
    const sec = (entry || {}) as { id?: string; title?: string; code?: string };
    return {
      id: sec.id || `sec-${idx}`,
      title: sec.title || `Section ${idx + 1}`,
      code: sec.code || "",
    };
  });
}

function normalizePage(raw: unknown, index: number): PageItem | null {
  if (!raw || typeof raw !== "object") return null;
  const page = raw as { slug?: unknown; title?: unknown; seo?: unknown; sections?: unknown };

  // A page with no usable slug cannot be linked to or routed at, so it is
  // dropped rather than filed under a guessed address. The first page is the
  // one exception: a config whose only page is unnamed is still a home page.
  const slug = canonicalPageSlug(page.slug) || (index === 0 ? HOME_SLUG : "");
  if (!slug) return null;

  const sections = Array.isArray(page.sections) ? normalizeSections(page.sections) : [];
  const title =
    typeof page.title === "string" && page.title.trim()
      ? page.title.trim()
      : titleFromSlug(slug);

  return { slug, title, seo: normalizePageSeo(page.seo), sections };
}

/**
 * A page's SEO overrides, or null.
 *
 * Null rather than an all-null object, so "this page has nothing of its own to
 * say" is one value that every reader tests the same way. Anything that is not
 * a usable string or boolean is dropped: this data reaches a `<meta>` tag, and
 * a number arriving where a title belongs should read as absent, not as "0".
 */
function normalizePageSeo(raw: unknown): PageSeoItem | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Record<string, unknown>;

  const text = (value: unknown): string | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
  };

  const seo: PageSeoItem = {
    title: text(entry.title),
    description: text(entry.description),
    ogImageUrl: text(entry.ogImageUrl),
    indexable: typeof entry.indexable === "boolean" ? entry.indexable : null,
  };

  const hasAnything =
    seo.title !== null ||
    seo.description !== null ||
    seo.ogImageUrl !== null ||
    seo.indexable !== null;

  return hasAnything ? seo : null;
}

function titleFromSlug(slug: string): string {
  const base = slug.replace(/^\//, "").replace(/[-_/]+/g, " ").trim();
  if (!base) return "Home";
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}
