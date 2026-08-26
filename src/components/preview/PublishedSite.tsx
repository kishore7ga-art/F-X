import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PreviewSiteViewer } from "@/components/preview/PreviewSiteViewer";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";
import { loadSiteView } from "@/lib/site-sections.server";
import type { SiteSettings } from "@/lib/site-sections.server";
import type { PageItem } from "@/lib/site-sections";
import { buildSiteMetadata, buildStructuredData, jsonLdScript, type SeoInput } from "@/lib/seo";

/**
 * A published tenant site, with its settings applied.
 *
 * `/site/[subdomain]` and `/[subdomain]` render the same thing — one is reached
 * through the proxy's rewrite, the other directly — and they had a copy of this
 * each. A second copy is where the maintenance check gets added to one route
 * and not the other, which is the failure mode that matters most here: a tenant
 * who has switched their site off and is still serving it on one of its two
 * addresses.
 */

/** The host the visitor actually asked for, for the own-domain decision. */
async function requestHost(): Promise<string | undefined> {
  const list = await headers();
  const raw = list.get("x-forwarded-host") ?? list.get("host") ?? "";
  return raw.split(",")[0]?.trim().split(":")[0]?.toLowerCase() || undefined;
}

/**
 * Everything a published page tells a search or answer engine about itself.
 *
 * This used to be a title, an optional description and `robots`, and the title
 * was the same string for every page of every site on the platform. What it
 * emits now — canonical, Open Graph, Twitter card, geographic tags, and the
 * page's own title and description where the tenant has set them — is built by
 * `@/lib/seo` from the settings the backend resolved, so the sitemap, the
 * structured data and this agree on every URL by construction.
 */
export async function publishedSiteMetadata(
  subdomain: string,
  pageSlug?: string,
): Promise<Metadata> {
  const host = await requestHost();
  const { settings, page, found } = await loadSiteView(subdomain, host, pageSlug);

  /**
   * A page that does not exist is never indexable, whatever the site's setting
   * says. Next renders `not-found` for it and this metadata is what a crawler
   * reads while doing so.
   */
  if (!found) {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }

  return buildSiteMetadata(seoInputFor(subdomain, host, settings, page));
}

/** The one place the renderer's two SEO consumers get their input. */
function seoInputFor(
  subdomain: string,
  host: string | undefined,
  settings: SiteSettings,
  page: PageItem | null,
): SeoInput {
  return {
    subdomain,
    requestHost: host ?? null,
    siteName: settings.siteName || subdomain,
    siteTitle: settings.seoTitle,
    siteDescription: settings.seoDescription,
    siteOgImage: settings.ogImageUrl,
    indexingEnabled: settings.indexingEnabled,
    page: page ? { slug: page.slug, title: page.title, seo: page.seo } : null,
    geo: settings.geo,
    aeo: settings.aeo,
  };
}

/**
 * The structured data for this page, as a script element.
 *
 * Built from the tenant's settings as *data* and serialised here — never
 * assembled as a string anywhere upstream. `</script>` inside a FAQ answer is
 * the one way a JSON-LD block becomes script injection, and `jsonLdScript`
 * escapes it at the single point every caller goes through.
 */
function StructuredData({ nodes }: { nodes: ReturnType<typeof buildStructuredData> }) {
  const payload = jsonLdScript(nodes);
  if (!payload) return null;
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON-LD has no other insertion point; escaped by `jsonLdScript`.
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}

/**
 * The page a tenant's visitors see while maintenance mode is on.
 *
 * Deliberately plain, self-contained and carrying no XITE branding or links:
 * this is the tenant's own address, and a visitor who arrives during an outage
 * should be told about the institution's site, not shown an advertisement for
 * the platform hosting it.
 */
function MaintenancePage({ message }: { message: string | null }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#0b0f16",
        color: "#e7ecf4",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "36rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, margin: 0 }}>
          We&rsquo;ll be back shortly
        </h1>
        <p style={{ fontSize: "1rem", lineHeight: 1.65, color: "#9aa5ba", margin: 0 }}>
          {message || "This website is temporarily unavailable while we make some updates."}
        </p>
      </div>
    </main>
  );
}

/** Custom markup a tenant asked to be emitted, already resolved by the backend. */
function CustomCode({ html, id }: { html: string; id: string }) {
  if (!html) return null;
  // Whether script survives to this point was decided server-side from the
  // request's host: full on the tenant's own domain, stripped on a shared
  // platform subdomain. Nothing here re-decides it.
  return <div data-xite-custom-code={id} dangerouslySetInnerHTML={{ __html: html }} />;
}

export async function PublishedSite({
  subdomain,
  pageSlug,
}: {
  subdomain: string;
  /** The path beneath the site's root, or undefined for the root itself. */
  pageSlug?: string;
}) {
  const host = await requestHost();
  const { sections, settings, theme, page, found } = await loadSiteView(subdomain, host, pageSlug);

  // Checked before anything else renders. A maintenance page that appears below
  // the site it is replacing is not a maintenance page.
  if (settings.maintenanceEnabled) {
    return <MaintenancePage message={settings.maintenanceMessage} />;
  }

  /**
   * A slug this site does not publish gets a 404, not the home page.
   *
   * Serving the home page at every address is what the renderer did when it
   * ignored pages entirely, and it is the worse failure of the two: a visitor
   * who mistypes is told nothing is wrong, and a crawler indexes the same
   * content under every URL it can invent.
   *
   * Checked after maintenance, so a tenant with their site switched off does
   * not leak which of their pages exist.
   */
  if (!found) notFound();

  return (
    <>
      <SectionRuntimeAssets />
      {/* Before the tenant's own head code, so a `<script>` they later gain the
          right to run cannot be positioned to rewrite the block above it. */}
      <StructuredData nodes={buildStructuredData(seoInputFor(subdomain, host, settings, page))} />
      <CustomCode html={settings.headHtml} id="head" />
      <PreviewSiteViewer
        subdomain={subdomain}
        mode="live"
        pageSlug={page?.slug}
        initialSections={sections as never}
        themeId={theme.themeId}
        fontId={theme.fontId}
      />
      <CustomCode html={settings.bodyEndHtml} id="body-end" />
    </>
  );
}
