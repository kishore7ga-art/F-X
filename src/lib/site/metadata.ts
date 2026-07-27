import type { Metadata } from "next";

import type { SitePageData } from "@/lib/site/queries";

/**
 * Turns a page's SEO fields into the tags a crawler or link preview reads.
 *
 * Every field falls back rather than going missing: an unset meta title means
 * "use the page's own title", not "publish an untitled page". Somebody who
 * never opens the SEO panel should still get something sensible in <head>.
 */
export function buildPageMetadata(
  data: SitePageData,
  subdomain: string,
): Metadata {
  const { seo, college, currentPage } = data;

  const title =
    seo.metaTitle ??
    (currentPage.slug === "home"
      ? college.name
      : `${currentPage.title} — ${college.name}`);

  // Canonical is a path, not a host: the site is served from a subdomain today
  // and may be on a custom domain tomorrow, and a hardcoded origin would age
  // into a wrong one.
  const canonicalPath =
    seo.canonicalSlug ?? (currentPage.slug === "home" ? "" : currentPage.slug);

  return {
    title,
    description: seo.metaDescription ?? undefined,
    alternates: {
      canonical: `/site/${subdomain}${canonicalPath ? `/${canonicalPath}` : ""}`,
    },
    openGraph: {
      title,
      description: seo.metaDescription ?? undefined,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}
