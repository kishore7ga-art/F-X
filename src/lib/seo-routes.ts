import { headers } from "next/headers";

import { canonicalOrigin, canonicalUrl, pageIndexable } from "@/lib/seo";
import { loadSiteView } from "@/lib/site-sections.server";

/**
 * `robots.txt` and `sitemap.xml`, for one tenant's site.
 *
 * Neither existed. A crawler arriving at a college's domain had no statement of
 * what it might read and no list of what there was to read — so the only pages
 * that could be discovered were the ones something else already linked to,
 * which for a site published last week is none of them.
 *
 * Both are built from `@/lib/seo`, which is also what the pages themselves use
 * to declare their canonical URL. That is the point of routing them through one
 * module: a sitemap that advertises `https://x.webxite.org/about` while the page
 * at that address declares itself canonical somewhere else is a sitemap that
 * actively costs the tenant ranking, and the two cannot disagree if neither
 * computes the URL itself.
 *
 * Shared by four routes — the `/site/<tenant>` spelling and the bare
 * `/<tenant>` one, times two files — because a rule that lives in four copies
 * is a rule with four chances to drift.
 */

/** The host the visitor actually asked for. */
async function requestHost(): Promise<string | undefined> {
  const list = await headers();
  const raw = list.get("x-forwarded-host") ?? list.get("host") ?? "";
  return raw.split(",")[0]?.trim().split(":")[0]?.toLowerCase() || undefined;
}

const NO_STORE = "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0";

/**
 * What a crawler may read on this tenant's site.
 *
 * A site with indexing switched off gets a blanket `Disallow: /`. That is the
 * tenant saying the site is not ready to be found, and it has to be said here
 * as well as in the page's own `robots` meta tag: a crawler reads this file
 * first, and a `noindex` tag it never fetches the page to see does nothing.
 */
export async function tenantRobotsTxt(subdomain: string): Promise<Response> {
  const host = await requestHost();
  const { settings } = await loadSiteView(subdomain, host);
  const origin = canonicalOrigin(subdomain, host);

  const body = settings.indexingEnabled
    ? [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${origin}/sitemap.xml`,
        "",
      ].join("\n")
    : ["User-agent: *", "Disallow: /", ""].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // A tenant who switches indexing off should not keep being crawled
      // because an edge cached the permissive version of this file.
      "Cache-Control": NO_STORE,
    },
  });
}

/**
 * Every page of this tenant's site that is fit to be indexed.
 *
 * Three exclusions, each of which would otherwise put a URL in front of a
 * crawler that should not be there:
 *
 *   - a page the tenant marked `indexable: false`;
 *   - a page with no sections, which renders as "this page has nothing on it
 *     yet" and is a thin-content penalty waiting to happen;
 *   - every page, when the site's own indexing switch is off.
 */
export async function tenantSitemapXml(subdomain: string): Promise<Response> {
  const host = await requestHost();
  const { pages, settings } = await loadSiteView(subdomain, host);

  const urls = settings.indexingEnabled
    ? pages
        .filter((page) => page.sections.length > 0)
        .filter((page) =>
          pageIndexable({
            subdomain,
            requestHost: host ?? null,
            siteName: settings.siteName,
            siteTitle: settings.seoTitle,
            siteDescription: settings.seoDescription,
            siteOgImage: settings.ogImageUrl,
            indexingEnabled: settings.indexingEnabled,
            page: { slug: page.slug, title: page.title, seo: page.seo },
          }),
        )
        .map((page) => canonicalUrl(subdomain, page.slug, host))
    : [];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": NO_STORE,
    },
  });
}

/**
 * XML escaping for a URL.
 *
 * A slug cannot contain `&` or `<` — `canonicalPageSlug` strips both — so this
 * is defence rather than a live requirement. It is here because the day
 * something else starts feeding this function is the day an unescaped `&`
 * silently invalidates the whole sitemap, and a crawler discards an
 * unparseable one entirely rather than the one bad line.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
