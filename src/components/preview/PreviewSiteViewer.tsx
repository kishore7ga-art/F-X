"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit3 } from "lucide-react";

import { api } from "@/lib/api-client";
import { useSectionRuntime } from "@/hooks/useSectionRuntime";
import { sectionCanvasHtml } from "@/lib/section-runtime";
import { useViewport } from "@/hooks/useViewport";
import { ResponsiveCanvas } from "@/components/preview/ResponsiveCanvas";
import { ViewportControl } from "@/components/editor/ViewportControl";
import {
  findPage,
  homePage,
  pickPages,
  type SectionItem,
} from "@/lib/site-sections";
import { tokenizeSectionHtml } from "@/lib/editor-themes";
import { resolveCategory } from "@/lib/sections/categories";
import { isHeaderOverlaid } from "@/lib/sections/section-edit";
import { handleInteractiveSectionClick, attachInteractiveSectionListeners } from "@/lib/interactive-section-runtime";


/**
 * The published college website.
 *
 * Sections arrive as raw HTML strings and are rendered into this page — not into
 * an iframe — so the page has to *become* the environment the Admin previews them
 * in. That environment is defined once in `@/lib/section-runtime` and used by both
 * apps; everything below is about applying it faithfully:
 *
 *   - the base stylesheet, scoped to the canvas rather than to `html, body`;
 *   - Tailwind's Play CDN, because sections are authored with Tailwind classes
 *     that a compiled build cannot know about;
 *   - each section's own `<style>` and `<link>`, moved into `document.head`,
 *     because a browser silently ignores both when they arrive via innerHTML.
 *
 * Cascade order is load-bearing. Tailwind's CDN appends its generated stylesheet
 * to the end of `<head>` when it loads, so in the Admin's document it sits after
 * the base and author CSS and wins ties against both. To reproduce that, this page
 * keeps *one* style element, created before the CDN script is appended, and
 * rewrites its contents in place — so it can never drift past Tailwind's and start
 * winning fights that the Admin loses.
 */

/** The element that stands in for `<body>`, and the scope every runtime rule is written against. */
const CANVAS_SCOPE = ".xite-site-canvas";
/** The page behind the canvas, so a short site does not end in a band of the app's own colour. */
const RUNTIME_PAGE_BG = "#09090b";

export type PreviewSiteMode = "live" | "preview" | "draft";

export function PreviewSiteViewer({
  subdomain,
  mode = "preview",
  pageSlug,
  initialSections = [],
  themeId = null,
  fontId = null,
}: {
  subdomain: string;
  /**
   * Which of the site's pages this is.
   *
   * The refresh below re-reads the whole site and has to come back with the
   * same page the server rendered. Without it the refresh picked `pages[0]`,
   * so a visitor who opened `/about` watched it turn into the home page a
   * moment after it loaded.
   */
  pageSlug?: string;
  /**
   * `live` is a visitor on the published site: no editor chrome, no polling.
   * `preview` is somebody checking the *published* site with the device dock.
   * `draft` is the tenant checking their own unpublished work — same dock,
   * but it polls `/api/v1/my-website` (their session, their draft) instead of
   * the published-site sources, which is the whole difference between it and
   * `preview`: those settle on `publishedSiteConfig` once a tenant has ever
   * published, however recent the draft is.
   *
   * A prop rather than something read off `window.location`, because the published
   * site reaches this component through a rewrite — the visitor's URL is
   * `https://college.webxite.org/`, never `/site/college` — so sniffing the path put
   * the editor dock on live college websites.
   */
  mode?: PreviewSiteMode;
  /** Rendered on the server, so the first paint is the site rather than a spinner. */
  initialSections?: SectionItem[];
  /**
   * The tenant's theme, resolved on the server.
   *
   * Ids, not colours: the tokens for all four themes are already in the
   * document, so applying one is an attribute and the published markup stays
   * exactly as it was authored.
   */
  themeId?: string | null;
  fontId?: string | null;
}) {
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [loading, setLoading] = useState(initialSections.length === 0);
  const isLive = mode === "live";
  const isDraft = mode === "draft";

  /**
   * The preview viewport — the same object, ladder and rules as the editor.
   *
   * Shared deliberately: this screen and the editor canvas are two views of one
   * website, and a section signed off at "tablet" here has to mean the same
   * width as "tablet" there. They had separate ladders and separate cycling
   * code, so the two agreed only for as long as nobody edited one of them.
   *
   * Live mode never reads it. A visitor's browser *is* the viewport; there is
   * nothing to simulate, no frame to draw and no scaling to do — see the render
   * below, which keeps the published path exactly as it was.
   */
  const [viewport, setViewport] = useViewport();
  const [canvasScale, setCanvasScale] = useState(1);

  // `sections` is replaced only when its contents actually change (see the fetch
  // effect below), so the effects can depend on it directly: they re-run when the
  // site changes, and not once every poll.

  // The environment, the responsive engine and every section's own CSS — shared
  // with the editor canvas, and built from the same functions the Admin's iframe
  // uses, so the three surfaces cannot drift apart.
  useSectionRuntime({
    sections,
    scope: CANVAS_SCOPE,
    simulatedWidth: isLive ? null : `${viewport.width}px`,
  });

  // ─── Section scripts ────────────────────────────────────────────────────────
  // A browser will not run a <script> that arrives through innerHTML, so each
  // section's scripts are re-created as real elements. Keyed on the section HTML
  // rather than on every render: a poll that changed nothing used to bind a second
  // copy of every handler.
  useEffect(() => {
    document.querySelectorAll("script[data-xite-preview-script]").forEach((el) => el.remove());

    const timer = setTimeout(() => {
      sections.forEach((sec) => {
        if (!sec.code) return;
        const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
        let m: RegExpExecArray | null;
        while ((m = scriptRegex.exec(sec.code)) !== null) {
          const attrs = m[1] || "";
          const inlineJs = m[2] || "";
          const srcMatch = attrs.match(/src=["']([^"']+)["']/i);

          const scriptEl = document.createElement("script");
          scriptEl.setAttribute("data-xite-preview-script", sec.id);

          if (srcMatch && srcMatch[1]) {
            scriptEl.src = srcMatch[1];
          } else if (inlineJs.trim()) {
            // The section is injected long after DOMContentLoaded has fired, so a
            // handler waiting for it would never run. Unwrap it and run it now.
            const processed = inlineJs.replace(
              /(?:document|window)\.addEventListener\(\s*['"](?:DOMContentLoaded|load)['"]\s*,\s*(?:function\s*\([^)]*\)\s*|\([^)]*\)\s*=>\s*)\{([\s\S]*)\}\s*\);?/gi,
              "$1",
            );
            scriptEl.textContent = `try { (function(){\n${processed}\n})(); } catch(e) { console.warn("Section script error:", e); }`;
          } else {
            continue;
          }
          document.body.appendChild(scriptEl);
        }
      });
    }, 120);

    return () => {
      clearTimeout(timer);
      document.querySelectorAll("script[data-xite-preview-script]").forEach((el) => el.remove());
    };
  }, [sections]);

  // ─── Interactive Navbar Menus, Drawers & Mobile navigation ────────────────
  // Delegated from the document so it survives the markup being replaced, and so a
  // re-render cannot leave a second listener behind on the same button.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const handled = handleInteractiveSectionClick(event);
      if (handled) return;
    };
    document.addEventListener("click", onClick);
    const cleanupListeners = attachInteractiveSectionListeners();
    return () => {
      document.removeEventListener("click", onClick);
      cleanupListeners();
    };
  }, []);

  // ─── Links between the site's own pages ─────────────────────────────────────
  /**
   * A tenant's header links to `/about`. Whether that resolves depends on which
   * of the site's two addresses the visitor is on, and the markup cannot know:
   *
   *   - on `greenfield.webxite.org`, `/about` is the right URL and the proxy
   *     rewrites it onto `/site/greenfield/about`;
   *   - on `webxite.org/site/greenfield`, `/about` leaves the site entirely and
   *     lands on the platform, where it names a *college* called "about".
   *
   * So the link is resolved against the base the page is actually being served
   * under. Nothing is rewritten on a tenant's own domain, where the base is
   * empty and the markup was already correct.
   *
   * Delegated, like the hamburger above, because the markup is replaced whole
   * on every refresh and a listener bound to an anchor would not survive it.
   */
  useEffect(() => {
    const path = window.location.pathname;
    const base = path.startsWith(`/site/${subdomain}`)
      ? `/site/${subdomain}`
      : path === `/${subdomain}` || path.startsWith(`/${subdomain}/`)
        ? `/${subdomain}`
        : "";

    if (!base) return;

    const onClick = (event: MouseEvent) => {
      // A modified click is the visitor asking for a new tab or a download; the
      // browser's own handling of it is correct and must not be replaced.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (!anchor.closest(CANVAS_SCOPE)) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (href.startsWith(base + "/") || href === base) return;

      event.preventDefault();
      window.location.assign(base + href);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [subdomain]);

  // ─── Published sections ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    /**
     * The site's sections, from the database.
     *
     * The same three sources the server render tries, in the same order, so the
     * markup the browser settles on is the markup it was sent: the tenant's own
     * published site, the editor's copy of it, then the platform default that
     * the Admin Studio maintains.
     *
     * Every request goes through `api()`, which is the one place that knows
     * where the backend is. This used to build its own base URL by sniffing
     * `window.location.hostname` and hard-coding `https://api.webxite.org` for
     * anything that was not localhost — so a deployment that serves the API on
     * its own origin through the rewrites in `next.config.ts` was bypassed
     * entirely, and any host other than the two it knew about got a
     * cross-origin request to a domain it may not be allowed to call. Local and
     * live now resolve the backend the same way, from the same variable.
     */
    const fetchSiteSections = async () => {
      try {
        let pageSecs: SectionItem[] = [];

        // `draft` reads the signed-in tenant's own unpublished work, the same
        // endpoint the editor saves to — never the published-site sources
        // below, which settle on the last publish once there has been one.
        const sources = isDraft
          ? ["/api/v1/my-website"]
          : [
              `/api/v1/public/site/${encodeURIComponent(subdomain)}`,
              `/api/v1/editor/${encodeURIComponent(subdomain)}`,
              "/api/v1/default-website",
            ];

        for (const path of sources) {
          try {
            const data = await api<unknown>(path);
            const pages = pickPages(data);
            if (pages.length === 0) continue;

            // The page the server rendered, not the first one in the config.
            const page = pageSlug === undefined ? homePage(pages) : findPage(pages, pageSlug);

            // A page that exists but is empty is a real answer and stops the
            // search — falling through to the next source would serve the
            // platform default's home page under this page's address.
            if (!page) continue;
            pageSecs = page.sections;
            break;
          } catch {
            // 404 or an unreachable backend: try the next source, then fall
            // through to whatever the server render already put on the page.
          }
        }

        if (cancelled) return;

        /* The database, or whatever the server render already put on the page.
           There used to be a third source here: a localStorage draft cache the
           editor wrote on every keystroke. The editor no longer writes it — the
           database is the only store — so reading it could only ever serve a
           copy from before that change, forever, with nothing to invalidate it.
           A stale answer is worse than the server's. */
        const finalSecs = pageSecs.length > 0 ? pageSecs : initialSections;

        // Replace state only on a real change. An identical array restarts every
        // effect above — re-injecting styles and re-running section scripts once
        // per poll, which is what made the preview flicker every five seconds.
        setSections((prev) => (sameSections(prev, finalSecs) ? prev : finalSecs));
      } catch (err) {
        // Keep what the server render put on the page rather than replacing a
        // correct site with a cached guess.
        console.warn("Could not load the published site sections:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchSiteSections();

    // A visitor's page has nothing to poll for; an editor's preview does, so that an
    // edit in the studio shows up here without a reload.
    if (isLive) {
      return () => {
        cancelled = true;
      };
    }

    const interval = setInterval(() => {
      void fetchSiteSections();
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [subdomain, isLive, isDraft, initialSections, pageSlug]);

  // Every hook above runs on every render. The loading branch below is deliberately
  // the last thing in this component: React counts hooks per render, and returning
  // early from the middle of the list — as this component used to — throws
  // "Rendered more hooks than during the previous render" the moment sections
  // arrive, which took the published site down to its error boundary.
  if (loading && sections.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading published website preview...</p>
        </div>
      </div>
    );
  }

  // A site with no sections used to render a fabricated five-section college —
  // header, hero, statistics, programmes and footer for a "Greenfield
  // University" that does not exist — at the tenant's own address. It looked
  // like a published site, so an institution whose sections had not saved, or
  // whose backend was briefly unreachable, had no way to tell that what the
  // world could see was not theirs. An empty site now says it is empty.
  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-lg font-bold tracking-tight">This site has no published sections yet</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            {isLive
              ? "The website for this address has not been published. Please check back shortly."
              : "Add sections in the editor and save — they will appear here as soon as they are stored."}
          </p>
          {!isLive && (
            <a
              href={`/editor/${subdomain || "greenfield"}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-extrabold text-white no-underline transition-colors hover:bg-blue-700"
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              Open Editor Studio
            </a>
          )}
        </div>
      </div>
    );
  }

  const body = sections.map((sec, idx) => {
      const isHeader = resolveCategory({ title: sec.title, code: sec.code }) === "navbar";
      const isOverlaid = isHeader && isHeaderOverlaid(sec);
      const isFollowsOverlaidHeader = idx === 1 && sections[0] && isHeaderOverlaid(sections[0]);
      return (
        <div
          key={sec.id}
          data-xite-section={sec.id}
          style={{
            ...(isOverlaid ? {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              width: "100%",
              zIndex: 100,
              backgroundColor: "transparent",
              overflow: "visible",
            } : isHeader ? {
              zIndex: 90,
              position: "relative",
              overflow: "visible",
            } : {
              position: "relative",
              zIndex: 10,
              ...(isFollowsOverlaidHeader ? { paddingTop: "85px" } : null),
            }),
          }}
          className="w-full relative transition-all group section-wrapper-container"
          dangerouslySetInnerHTML={{ __html: tokenizeSectionHtml(sectionCanvasHtml(sec.code)) }}
        />
      );
    });

  return (
    <div className="min-h-screen w-full font-sans relative" style={{ backgroundColor: RUNTIME_PAGE_BG }}>

      {/* Responsive Device Resolution Switcher Dock - Centered at bottom (Hidden in Live Mode) */}
      {!isLive && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
          }}
          className="bg-white/95 backdrop-blur-xl border border-slate-200/90 p-1.5 px-3 rounded-full shadow-[0_16px_40px_rgba(15,23,42,0.14),0_4px_12px_rgba(0,0,0,0.06)] flex items-center justify-center gap-1.5 select-none transition-all duration-200"
        >
          <ViewportControl
            viewport={viewport}
            onChange={setViewport}
            scale={canvasScale}
            orientation="horizontal"
          />

          <div className="h-4.5 w-[1px] bg-slate-200 shrink-0 mx-0.5" />

          {/* 4. Open Editor Studio Button */}
          <a
            href={`/editor/${subdomain || "greenfield"}`}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-[0_2px_8px_rgba(37,99,235,0.3)] transition-all duration-200 cursor-pointer no-underline shrink-0"
            title="Open Full Visual Editor Studio with Floating Toolbar"
          >
            <Edit3 className="w-3.5 h-3.5 shrink-0" />
            <span>Open Editor Studio</span>
          </a>
        </div>
      )}

      {/* The site itself */}
      <main
        className={`w-full flex-1 flex flex-col items-stretch justify-start ${
          isLive ? "p-0 m-0" : "py-8 px-4 pb-36 bg-slate-100/90"
        }`}
      >
        {/*
          Two paths, and the split is the point.

          Live is a visitor's browser: the window *is* the viewport, so there is
          nothing to simulate. It renders exactly what it always did — a plain
          full-width canvas, no wrapper, no frame, no transform — because the one
          thing a preview feature must never do is change the published site.

          Preview is an inspection tool, so it gets the real thing: the canvas is
          laid out at the chosen width whether or not that width fits on this
          screen, and a transform makes it visible. The old code clamped it with
          `maxWidth: "100%"`, which silently laid the site out for the pane and
          then labelled it 1920.
        */}
        {isLive ? (
          <div
            /* The tenant's theme, applied by attribute. Every theme's tokens are
               already in the stylesheet `SectionRuntimeAssets` emitted, so this
               costs nothing and cannot flash: the correct colours are resolved on
               the first paint of the server-rendered HTML. */
            data-xite-theme={themeId ?? undefined}
            data-xite-font={fontId ?? undefined}
            className="xite-site-canvas block w-full min-h-screen m-0 p-0"
          >
            {body}
          </div>
        ) : (
          <ResponsiveCanvas
            viewport={viewport}
            themeId={themeId}
            fontId={fontId}
            onScaleChange={setCanvasScale}
            chromeClassName="shadow-2xl rounded-2xl border border-slate-300 bg-white"
            canvasClassName="min-h-[75vh]"
          >
            {body}
          </ResponsiveCanvas>
        )}
      </main>
    </div>
  );
}

/**
 * A section's markup, ready to inject.
 *
 * `<style>` and `<link>` come out because the browser ignores both when they arrive
 * through innerHTML and the environment effect has already moved them into
 * `document.head` — the same split the Admin's iframe makes when it builds `<head>`.
 */
function sameSections(a: SectionItem[], b: SectionItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (sec, i) => sec.id === b[i]?.id && sec.code === b[i]?.code && sec.title === b[i]?.title,
  );
}
