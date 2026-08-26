/**
 * What a published site tells search engines and answer engines about itself.
 *
 * ── What was here before ───────────────────────────────────────────────────
 *
 * Three things: a title, an optional description, and `robots`. That is the
 * whole of what any tenant site on this platform said about itself.
 *
 * No canonical, so the same page served at `greenfield.webxite.org/about` and
 * `webxite.org/site/greenfield/about` was two pages as far as a crawler is
 * concerned, each diluting the other. No Open Graph, so every link anyone
 * shared to a college's site rendered as a bare URL. No structured data, so an
 * answer engine asked "where is Greenfield College" had a page of prose and no
 * fact it could quote. No geographic metadata at all, for a platform whose
 * tenants are physical institutions that people search for by place. And no
 * sitemap or robots.txt, so a crawler's only way in was a link from elsewhere.
 *
 * The settings the backend *did* store were half-connected too: `seo.title` and
 * `seo.description` had a column, an API and a renderer, and no UI anywhere in
 * the product that could set either.
 *
 * ── Why one module ────────────────────────────────────────────────────────
 *
 * Metadata, structured data, the sitemap and robots.txt all answer the same
 * question — what does this site publish, and under which addresses — and they
 * disagree the moment they each work it out. The canonical URL a page declares
 * and the URL the sitemap lists for that page have to be the same string; the
 * pages robots.txt allows and the pages the sitemap advertises have to be the
 * same set. So the URL rules live here, once, and everything is built from them.
 *
 * Everything in this file is pure. It takes the settings the backend resolved
 * and returns data; it reads no request, no environment beyond the root domain,
 * and no database. That is what makes it testable, and it is why the escaping
 * rule below can be stated as a property rather than hoped for.
 */

import type { Metadata } from "next";

import { rootDomain } from "@/lib/host-routing";
import { canonicalPageSlug, isHomeSlug } from "@/lib/site-sections";

/** Where this institution is. Mirrors `IGeoSettings` in the backend. */
export type GeoSettings = {
  streetAddress?: string | null;
  locality?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  telephone?: string | null;
  serviceAreas?: string[] | null;
};

/** What this institution is, in a form a machine can quote. */
export type AeoSettings = {
  organizationType?: string | null;
  legalName?: string | null;
  foundingYear?: number | null;
  sameAs?: string[] | null;
  faqs?: { question: string; answer: string }[] | null;
};

/** A page's own overrides. Null in every field means "inherit from the site". */
export type PageSeo = {
  title?: string | null;
  description?: string | null;
  ogImageUrl?: string | null;
  indexable?: boolean | null;
};

export type SeoInput = {
  /** The tenant's subdomain — what the canonical host is built from. */
  subdomain: string;
  /**
   * The host the visitor actually used, or undefined when it is not known.
   *
   * A tenant's own verified domain is the canonical one when the visitor is on
   * it. The platform's own addresses never are; see `canonicalOrigin`.
   */
  requestHost?: string | null;
  siteName: string;
  siteTitle: string | null;
  siteDescription: string | null;
  siteOgImage: string | null;
  indexingEnabled: boolean;
  /** The page being rendered, or null for a site that publishes nothing. */
  page: { slug: string; title: string; seo?: PageSeo | null } | null;
  geo?: GeoSettings | null;
  aeo?: AeoSettings | null;
};

const DEFAULT_SITE_TITLE = "Official Campus Portal — Powered by XITE";

/**
 * The one address this site's pages are canonical at.
 *
 * A tenant site answers on at least two hosts and often three — the platform
 * path `webxite.org/site/greenfield`, the platform subdomain
 * `greenfield.webxite.org`, and whatever custom domain they have connected —
 * and a crawler that finds the same content at all three has three competing
 * candidates for the same page. Declaring one canonical is how that stops
 * being a problem, and *which* one is declared has to be the same answer from
 * every address, or each address simply points at itself again.
 *
 * The rule: a tenant's own connected domain if the visitor is on it, otherwise
 * the platform subdomain. Never the `/site/<tenant>` path form — that is an
 * internal spelling produced by a rewrite, and it should not be the address a
 * search result sends people to.
 */
export function canonicalOrigin(subdomain: string, requestHost?: string | null): string {
  const host = (requestHost ?? "").trim().toLowerCase();
  const root = rootDomain();

  /**
   * A host that is not one of ours is a tenant's own domain, and a visitor who
   * arrived on it should stay on it.
   *
   * `localhost` is excluded so that development does not emit canonicals
   * pointing at a machine nobody else can reach; it falls through to the
   * subdomain form, which is what production would produce.
   */
  const isPlatformHost =
    !host ||
    host === root ||
    host.endsWith(`.${root}`) ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.startsWith("127.") ||
    host === "::1";

  if (!isPlatformHost) return `https://${host}`;

  return `https://${subdomain}.${root}`;
}

/** The path a page is canonical at, relative to the site's own root. */
export function canonicalPath(slug: string | null | undefined): string {
  const canonical = canonicalPageSlug(slug);
  if (!canonical || isHomeSlug(canonical)) return "/";
  return canonical;
}

/** The full canonical URL of one page of one site. */
export function canonicalUrl(
  subdomain: string,
  slug: string | null | undefined,
  requestHost?: string | null,
): string {
  const path = canonicalPath(slug);
  return path === "/"
    ? `${canonicalOrigin(subdomain, requestHost)}/`
    : `${canonicalOrigin(subdomain, requestHost)}${path}`;
}

/**
 * The title of one page.
 *
 * A page's own title wins; otherwise the page's name is placed in front of the
 * site's, which is what distinguishes two pages of one site in a result list.
 * The home page is the site, so it does not get its own name prefixed onto it.
 */
export function pageTitle(input: SeoInput): string {
  const siteTitle = input.siteTitle?.trim() || input.siteName?.trim() || DEFAULT_SITE_TITLE;
  const own = input.page?.seo?.title?.trim();
  if (own) return own;

  const page = input.page;
  if (!page || isHomeSlug(page.slug) || !page.title?.trim()) return siteTitle;
  return `${page.title.trim()} — ${siteTitle}`;
}

/** The description of one page: its own, or the site's, or none. */
export function pageDescription(input: SeoInput): string | null {
  return input.page?.seo?.description?.trim() || input.siteDescription?.trim() || null;
}

/** The social preview image for one page: its own, or the site's, or none. */
export function pageImage(input: SeoInput): string | null {
  return input.page?.seo?.ogImageUrl?.trim() || input.siteOgImage?.trim() || null;
}

/**
 * Whether this page may be indexed.
 *
 * The site's switch is a floor, not a default. A tenant who has switched
 * indexing off is saying the site is not ready to be found, and a page-level
 * `indexable: true` must not be able to overrule that — otherwise the switch
 * means "unless some page disagrees", which is not what anybody reads it as.
 * A page may only ever be *less* indexable than its site.
 */
export function pageIndexable(input: SeoInput): boolean {
  if (!input.indexingEnabled) return false;
  return input.page?.seo?.indexable !== false;
}

/**
 * Geographic meta tags.
 *
 * `geo.region`, `geo.placename` and `ICBM` are the long-standing informal set —
 * not part of any current standard, still read by a number of local-search
 * consumers, and cheap. They are emitted only when the tenant has actually
 * supplied the values; a `geo.region` of "undefined" is worse than silence.
 *
 * The authoritative statement of the same facts is the `PostalAddress` in the
 * structured data below. These are the belt to its braces.
 */
export function geoMetaTags(geo: GeoSettings | null | undefined): Record<string, string> {
  if (!geo) return {};
  const tags: Record<string, string> = {};

  const region = geo.region?.trim();
  const country = geo.country?.trim();
  // `geo.region` is an ISO-3166 code. A tenant who typed "Tamil Nadu" rather
  // than "IN-TN" gets the country code alone rather than a malformed subdivision.
  if (region && /^[A-Za-z]{2}-[A-Za-z0-9]{1,3}$/.test(region)) tags["geo.region"] = region.toUpperCase();
  else if (country) tags["geo.region"] = country.toUpperCase();

  const placename = geo.locality?.trim();
  if (placename) tags["geo.placename"] = placename;

  if (typeof geo.latitude === "number" && typeof geo.longitude === "number") {
    tags["geo.position"] = `${geo.latitude};${geo.longitude}`;
    tags["ICBM"] = `${geo.latitude}, ${geo.longitude}`;
  }

  return tags;
}

/**
 * Everything a published page declares about itself, as Next metadata.
 *
 * `metadataBase` is set to the canonical origin so that a relative image path a
 * tenant enters still resolves to *their* site rather than failing the build or
 * resolving against the platform.
 */
export function buildSiteMetadata(input: SeoInput): Metadata {
  const origin = canonicalOrigin(input.subdomain, input.requestHost);
  const url = canonicalUrl(input.subdomain, input.page?.slug, input.requestHost);
  const title = pageTitle(input);
  const description = pageDescription(input);
  const image = pageImage(input);
  const indexable = pageIndexable(input);

  return {
    metadataBase: new URL(origin),
    title,
    /**
     * `null`, not omitted, when the tenant has written no description.
     *
     * Next merges metadata down the segment tree, and the root layout carries
     * the platform's own marketing copy — "Pick a template, edit content,
     * publish your college website with XITE." Omitting the field inherits it,
     * so every college site with no description of its own was advertising the
     * platform in its search result, on its own domain. `null` clears it.
     */
    description: description ?? null,
    /**
     * Same reason, and a sharper one: the root layout sets the XITE logo as the
     * favicon, so a college's own domain showed the platform's mark in the
     * browser tab and in every bookmark. A tenant has no way to upload a
     * favicon yet, and no icon is more honest than somebody else's.
     */
    icons: null,
    alternates: { canonical: url },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: "website",
      url,
      title,
      ...(description ? { description } : {}),
      siteName: input.siteName || undefined,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      // `summary_large_image` only when there is an image to be large; the
      // card renders as a broken box otherwise.
      card: image ? "summary_large_image" : "summary",
      title,
      ...(description ? { description } : {}),
      ...(image ? { images: [image] } : {}),
    },
    other: geoMetaTags(input.geo),
  };
}

/** One JSON-LD node. Deliberately loose: schema.org is not a fixed shape. */
export type JsonLdNode = Record<string, unknown>;

/**
 * The structured data a published page emits.
 *
 * Four nodes, each of which answers a question a person actually asks:
 *
 *   - the **organisation** — what this institution is, where it is, how to
 *     reach it, and which other profiles are the same entity;
 *   - the **website** — that these pages are one site, under one name;
 *   - the **breadcrumb** — where this page sits inside it;
 *   - the **FAQ** — the questions the tenant has written answers to, which is
 *     the one thing on the page an answer engine can quote verbatim.
 *
 * Emitted only when there is something to say. An `Organization` node carrying
 * nothing but a name is not structured data, it is noise, and a `FAQPage` with
 * no questions is invalid.
 */
export function buildStructuredData(input: SeoInput): JsonLdNode[] {
  const origin = canonicalOrigin(input.subdomain, input.requestHost);
  const url = canonicalUrl(input.subdomain, input.page?.slug, input.requestHost);
  const nodes: JsonLdNode[] = [];

  const geo = input.geo;
  const aeo = input.aeo;

  const address = postalAddress(geo);
  const hasCoordinates =
    typeof geo?.latitude === "number" && typeof geo?.longitude === "number";

  const organization: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": aeo?.organizationType?.trim() || "CollegeOrUniversity",
    "@id": `${origin}/#organization`,
    name: input.siteName,
    url: `${origin}/`,
  };

  if (aeo?.legalName?.trim()) organization.legalName = aeo.legalName.trim();
  if (input.siteDescription?.trim()) organization.description = input.siteDescription.trim();
  if (input.siteOgImage?.trim()) organization.image = input.siteOgImage.trim();
  if (address) organization.address = address;
  if (hasCoordinates) {
    organization.geo = {
      "@type": "GeoCoordinates",
      latitude: geo!.latitude,
      longitude: geo!.longitude,
    };
  }
  if (geo?.telephone?.trim()) organization.telephone = geo.telephone.trim();
  if (aeo?.foundingYear) organization.foundingDate = String(aeo.foundingYear);
  if (aeo?.sameAs?.length) organization.sameAs = aeo.sameAs;

  const serviceAreas = (geo?.serviceAreas ?? []).filter((area) => area?.trim());
  if (serviceAreas.length > 0) {
    organization.areaServed = serviceAreas.map((area) => ({
      "@type": "AdministrativeArea",
      name: area.trim(),
    }));
  }

  // A name and a URL are what every site has by definition, so the node is only
  // worth emitting once it carries a fact that is specific to this institution.
  const organizationIsSubstantive =
    Boolean(address) ||
    hasCoordinates ||
    Boolean(organization.telephone) ||
    Boolean(organization.sameAs) ||
    Boolean(organization.foundingDate) ||
    Boolean(organization.description);

  if (organizationIsSubstantive) nodes.push(organization);

  nodes.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: input.siteName,
    url: `${origin}/`,
    ...(organizationIsSubstantive ? { publisher: { "@id": `${origin}/#organization` } } : {}),
  });

  const page = input.page;
  if (page && !isHomeSlug(page.slug)) {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
        { "@type": "ListItem", position: 2, name: page.title || page.slug, item: url },
      ],
    });
  }

  const faqs = (aeo?.faqs ?? []).filter((faq) => faq?.question?.trim() && faq?.answer?.trim());
  if (faqs.length > 0) {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question.trim(),
        acceptedAnswer: { "@type": "Answer", text: faq.answer.trim() },
      })),
    });
  }

  return nodes;
}

function postalAddress(geo: GeoSettings | null | undefined): JsonLdNode | null {
  if (!geo) return null;

  const address: JsonLdNode = { "@type": "PostalAddress" };
  let filled = false;

  const put = (key: string, value: string | null | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed) return;
    address[key] = trimmed;
    filled = true;
  };

  put("streetAddress", geo.streetAddress);
  put("addressLocality", geo.locality);
  put("addressRegion", geo.region);
  put("postalCode", geo.postalCode);
  put("addressCountry", geo.country);

  return filled ? address : null;
}

/**
 * JSON-LD as a string safe to drop inside a `<script>` element.
 *
 * `</script>` inside a tenant's FAQ answer closes the block it is being
 * serialised into and everything after it becomes markup — which is the one
 * way structured data turns into script injection, and the reason the backend
 * sends these as data rather than as HTML. `<` is exactly equivalent to
 * `<` inside a JSON string and cannot begin a tag; it is what the Next
 * documentation prescribes for this, and it is applied here rather than at each
 * call site so that no call site can forget.
 */
export function jsonLdScript(nodes: JsonLdNode[]): string {
  if (nodes.length === 0) return "";
  const payload = nodes.length === 1 ? nodes[0] : nodes;
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
