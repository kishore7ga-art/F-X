"use client";

import { useEffect, useState } from "react";
import { Monitor, Tablet, Smartphone, Edit3 } from "lucide-react";

import { api } from "@/lib/api-client";
import { useSectionRuntime } from "@/hooks/useSectionRuntime";
import {
  extractStylesAndBody,
  nextSectionDeviceWidth,
  sectionDeviceWidths,
} from "@/lib/section-runtime";
import { normalizeSections, pickSections, type SectionItem } from "@/lib/site-sections";


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

export type PreviewSiteMode = "live" | "preview";

export function PreviewSiteViewer({
  subdomain,
  mode = "preview",
  initialSections = [],
}: {
  subdomain: string;
  /**
   * `live` is a visitor on the published site: no editor chrome, no polling.
   * `preview` is somebody checking their work, and keeps the device dock.
   *
   * A prop rather than something read off `window.location`, because the published
   * site reaches this component through a rewrite — the visitor's URL is
   * `https://college.webxite.org/`, never `/site/college` — so sniffing the path put
   * the editor dock on live college websites.
   */
  mode?: PreviewSiteMode;
  /** Rendered on the server, so the first paint is the site rather than a spinner. */
  initialSections?: SectionItem[];
}) {
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [loading, setLoading] = useState(initialSections.length === 0);
  const [previewWidth, setPreviewWidth] = useState<string>("100%");
  const isLive = mode === "live";

  // `sections` is replaced only when its contents actually change (see the fetch
  // effect below), so the effects can depend on it directly: they re-run when the
  // site changes, and not once every poll.

  // The environment, the responsive engine and every section's own CSS — shared
  // with the editor canvas, and built from the same functions the Admin's iframe
  // uses, so the three surfaces cannot drift apart.
  useSectionRuntime({ sections, scope: CANVAS_SCOPE, simulatedWidth: previewWidth });

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

  // ─── Mobile navigation ──────────────────────────────────────────────────────
  // Delegated from the document so it survives the markup being replaced, and so a
  // re-render cannot leave a second listener behind on the same button.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest?.(".hamburger-toggle-btn");
      if (!button) return;
      event.stopPropagation();
      const menu = button.closest("header")?.querySelector(".mobile-drawer-menu");
      menu?.classList.toggle("active");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // ─── Published sections ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    /**
     * The editor's unsaved draft, from the browser that made it.
     *
     * Only ever read in `preview` mode. On a published site this is the wrong
     * answer by construction: the cache exists in exactly one person's browser,
     * so the owner would be served their local draft while every other visitor
     * got the database — the same URL rendering two different websites, with no
     * way to tell which one you were looking at.
     */
    const readEditorDraft = (): SectionItem[] | null => {
      if (isLive || typeof window === "undefined") return null;
      try {
        const keysToTry = [
          `xite_active_sections_${subdomain}_/home`,
          `xite_active_sections_${subdomain}_home`,
          `xite_active_sections_${subdomain}`,
        ];
        for (const key of keysToTry) {
          const savedActive = localStorage.getItem(key);
          if (savedActive && savedActive !== "undefined" && savedActive !== "null") {
            const parsed = JSON.parse(savedActive);
            if (Array.isArray(parsed) && parsed.length > 0) return normalizeSections(parsed);
          }
        }
      } catch (err) {
        console.warn("Could not read the editor draft cache:", err);
      }
      return null;
    };

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
        let pageSecs: unknown[] = [];

        const sources = [
          `/api/v1/public/site/${encodeURIComponent(subdomain)}`,
          `/api/v1/editor/${encodeURIComponent(subdomain)}`,
          "/api/v1/default-website",
        ];

        for (const path of sources) {
          try {
            const data = await api<unknown>(path);
            pageSecs = pickSections(data);
            if (pageSecs.length > 0) break;
          } catch {
            // 404 or an unreachable backend: try the next source, then fall
            // through to whatever the server render already put on the page.
          }
        }

        if (cancelled) return;

        const finalSecs =
          pageSecs.length > 0
            ? normalizeSections(pageSecs)
            : readEditorDraft() ?? initialSections;

        // Replace state only on a real change. An identical array restarts every
        // effect above — re-injecting styles and re-running section scripts once
        // per poll, which is what made the preview flicker every five seconds.
        setSections((prev) => (sameSections(prev, finalSecs) ? prev : finalSecs));
      } catch (err) {
        console.warn("Could not load the published site sections:", err);
        if (!cancelled) {
          const draft = readEditorDraft();
          if (draft) setSections((prev) => (sameSections(prev, draft) ? prev : draft));
        }
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
  }, [subdomain, isLive, initialSections]);

  // One ladder, shared with the editor toolbar and the Admin preview, so "Tablet"
  // is the same width wherever somebody checks a section.
  const DESKTOP_WIDTHS = sectionDeviceWidths("desktop");
  const TABLET_WIDTHS = sectionDeviceWidths("tablet");
  const MOBILE_WIDTHS = sectionDeviceWidths("mobile");

  const isDesktop = DESKTOP_WIDTHS.includes(previewWidth);
  const isTablet = TABLET_WIDTHS.includes(previewWidth);
  const isMobile = MOBILE_WIDTHS.includes(previewWidth);

  // The same rule the editor toolbar presses, from the same place: stay in the
  // group and you advance a width, switch group and you enter it at its first.
  const handleDesktopClick = () => setPreviewWidth(nextSectionDeviceWidth("desktop", previewWidth));
  const handleTabletClick = () => setPreviewWidth(nextSectionDeviceWidth("tablet", previewWidth));
  const handleMobileClick = () => setPreviewWidth(nextSectionDeviceWidth("mobile", previewWidth));

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
          {/* Vertical Divider Line */}
          <div className="h-4.5 w-[1px] bg-slate-200 shrink-0 mx-0.5" />

          {/* 1. Desktop Button */}
          <button
            type="button"
            onClick={handleDesktopClick}
            className={`flex items-center gap-2 h-9 transition-all duration-200 cursor-pointer rounded-full text-xs ${
              isDesktop
                ? "bg-white border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.08),0_1px_2px_rgba(0,0,0,0.04)] px-3.5 text-slate-900 font-extrabold"
                : "bg-transparent border border-transparent px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
            }`}
            title="Desktop Resolution (Click to Cycle 100% / 1200px / 1024px)"
          >
            <Monitor className={`w-4.5 h-4.5 shrink-0 ${isDesktop ? "text-slate-900" : "text-slate-500"}`} />
            {isDesktop && (
              <span className="font-mono font-extrabold text-[12.5px] text-slate-900 tracking-tight">
                {previewWidth}
              </span>
            )}
          </button>

          {/* 2. Tablet Button */}
          <button
            type="button"
            onClick={handleTabletClick}
            className={`flex items-center gap-2 h-9 transition-all duration-200 cursor-pointer rounded-full text-xs ${
              isTablet
                ? "bg-white border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.08),0_1px_2px_rgba(0,0,0,0.04)] px-3.5 text-slate-900 font-extrabold"
                : "bg-transparent border border-transparent px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
            }`}
            title="Tablet Resolution (Click to Cycle 768px / 640px)"
          >
            <Tablet className={`w-4.5 h-4.5 shrink-0 ${isTablet ? "text-slate-900" : "text-slate-500"}`} />
            {isTablet && (
              <span className="font-mono font-extrabold text-[12.5px] text-slate-900 tracking-tight">
                {previewWidth}
              </span>
            )}
          </button>

          {/* 3. Mobile Button */}
          <button
            type="button"
            onClick={handleMobileClick}
            className={`flex items-center gap-2 h-9 transition-all duration-200 cursor-pointer rounded-full text-xs ${
              isMobile
                ? "bg-white border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.08),0_1px_2px_rgba(0,0,0,0.04)] px-3.5 text-slate-900 font-extrabold"
                : "bg-transparent border border-transparent px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
            }`}
            title="Mobile Phone Resolution (Click to Cycle 375px / 425px)"
          >
            <Smartphone className={`w-4.5 h-4.5 shrink-0 ${isMobile ? "text-slate-900" : "text-slate-500"}`} />
            {isMobile && (
              <span className="font-mono font-extrabold text-[12.5px] text-slate-900 tracking-tight">
                {previewWidth}
              </span>
            )}
          </button>

          {/* Vertical Divider */}
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

      {/* Main Live Site View */}
      <main
        className={`w-full flex-1 flex flex-col items-center justify-start transition-all ${
          previewWidth === "100%" ? "p-0 m-0" : "py-12 px-4 bg-slate-100/90"
        } ${isLive ? "" : "pb-36"}`}
      >
        {/* The device frame is chrome, and it carries its own border — which would
            otherwise come out of the canvas's content box and make a "375px"
            preview report 373px to the container queries. Kept on a wrapper so
            the canvas is exactly the width the label claims. */}
        {/* The device frame is chrome and shrink-wraps the canvas. The width goes
            on the canvas itself: a border on the element that carries the width
            comes out of its content box, so a "375px" preview would be 373px to
            the container queries — and at the 640px preset that is the mobile
            breakpoint firing two pixels early. */}
        <div
          className={`transition-all duration-300 mx-auto max-w-full ${
            previewWidth === "100%"
              ? "w-full rounded-none border-none shadow-none m-0 p-0"
              : "w-fit shadow-2xl rounded-2xl border border-slate-300 my-4 overflow-hidden"
          }`}
        >
        <div
          className={`xite-site-canvas block max-w-full ${
            previewWidth === "100%" ? "w-full min-h-screen m-0 p-0" : "min-h-[75vh]"
          }`}
          style={{ width: previewWidth, maxWidth: "100%" }}
        >
          {sections.map((sec, idx) => {
            const isHeader =
              idx === 0 ||
              (sec.title || "").toLowerCase().includes("header") ||
              (sec.title || "").toLowerCase().includes("nav");
            return (
              <div
                key={sec.id}
                data-xite-section={sec.id}
                style={{
                  // A header that sticks has to sit above what follows it; the rest
                  // stack in source order. No clipping — the Admin's iframe does not
                  // clip either, and `overflow: hidden` here cut off every shadow,
                  // dropdown and sticky element a section had.
                  //
                  // The rest carried a descending z-index, which stacked every
                  // section above the one after it — the reverse of how HTML paints,
                  // so an overlapping decoration rendered over its neighbour instead
                  // of under it. Natural order is both correct and what the Admin
                  // shows.
                  ...(isHeader ? { zIndex: 40 } : null),
                  position: "relative",
                }}
                className="w-full relative transition-all group section-wrapper-container"
                dangerouslySetInnerHTML={{ __html: sectionCanvasHtml(sec.code) }}
              />
            );
          })}
          {!isLive && <div className="w-full h-36 bg-transparent pointer-events-none shrink-0" />}
        </div>
        </div>
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
function sectionCanvasHtml(code: string): string {
  const { bodyHtml } = extractStylesAndBody(code || "");
  return `<div class="section-canvas-box">${bodyHtml}</div>`;
}

function sameSections(a: SectionItem[], b: SectionItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (sec, i) => sec.id === b[i]?.id && sec.code === b[i]?.code && sec.title === b[i]?.title,
  );
}
