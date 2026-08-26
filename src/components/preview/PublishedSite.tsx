import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PreviewSiteViewer } from "@/components/preview/PreviewSiteViewer";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";
import { loadSiteView } from "@/lib/site-sections.server";
import { isHomeSlug } from "@/lib/site-sections";

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
 * Search-engine directives, from the tenant's own SEO settings.
 *
 * `robots` is the part that has to be right: a tenant who switched indexing off
 * was previously told "SEO indexing disabled!" by a toast and then indexed
 * anyway, because nothing read the toggle.
 */
export async function publishedSiteMetadata(
  subdomain: string,
  pageSlug?: string,
): Promise<Metadata> {
  const { settings, page, found } = await loadSiteView(subdomain, await requestHost(), pageSlug);

  /**
   * A page that does not exist is never indexable, whatever the site's setting
   * says. Next renders `not-found` for it and this metadata is what a crawler
   * reads while doing so.
   */
  if (!found) {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }

  const siteTitle = settings.seoTitle || "Official Campus Portal — Powered by XITE";

  /**
   * The page's own name, in front of the site's.
   *
   * Every page of every site on the platform previously carried one title —
   * the site's — because there was only ever one page. Two pages with the same
   * `<title>` are two pages a search engine has to guess between, and the guess
   * is not ours to make for a tenant.
   */
  const title =
    page && !isHomeSlug(page.slug) && page.title ? `${page.title} — ${siteTitle}` : siteTitle;

  return {
    title,
    ...(settings.seoDescription ? { description: settings.seoDescription } : {}),
    robots: settings.indexingEnabled
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
  };
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
