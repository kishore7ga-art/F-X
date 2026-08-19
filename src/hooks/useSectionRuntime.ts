"use client";

import { useEffect } from "react";

import { fenceCssToSection, placeBeforeTailwind } from "@/lib/section-css-fence";
import {
  extractStylesAndBody,
  remapDocumentSelectors,
  sectionResponsiveCss,
  sectionRuntimeCss,
  viewportMediaToContainer,
} from "@/lib/section-runtime";
import type { SectionItem } from "@/lib/site-sections";

/**
 * Puts a page into the environment sections are authored against.
 *
 * The editor canvas and the published site had a copy of this each — two
 * hundred-odd lines that had to agree about stylesheet order, `<style>`
 * extraction, per-section fencing and link de-duplication, and drifted the first
 * time one of them was touched. There is one copy now, and the Admin's iframe
 * builds the same stylesheets from the same functions, so all three surfaces
 * agree by construction rather than by review.
 */
const RUNTIME_STYLE_ID = "xite-section-runtime";

export function useSectionRuntime({
  sections,
  scope,
  simulatedWidth,
}: {
  sections: SectionItem[];
  /** The element standing in for `<body>` — the canvas. */
  scope: string;
  /**
   * The canvas width when a device is being simulated, or `null` when the canvas
   * is simply the page. Only used to decide whether Tailwind's own breakpoints
   * need redirecting at the container; see `useTailwindContainerQueries`.
   */
  simulatedWidth?: string | null;
}) {
  useEffect(() => {
    const head = document.head;

    // Older builds injected one <style> per section. Clear them, or a page that
    // was server-rendered by an older deploy keeps them alongside the new sheet.
    document.querySelectorAll("style[data-xite-section]").forEach((el) => el.remove());

    let runtimeStyle = document.getElementById(RUNTIME_STYLE_ID) as HTMLStyleElement | null;
    if (!runtimeStyle) {
      runtimeStyle = document.createElement("style");
      runtimeStyle.id = RUNTIME_STYLE_ID;
      head.appendChild(runtimeStyle);
    }
    const style = runtimeStyle;

    // In front of Tailwind's stylesheet, which is where the Admin's document puts
    // it: `class="text-2xl"` beats a section's own `.title { font-size: 40px }`
    // there, and has to here too.
    let placement: MutationObserver | null = null;
    if (!placeBeforeTailwind(style)) {
      placement = new MutationObserver(() => {
        if (placeBeforeTailwind(style)) placement?.disconnect();
      });
      placement.observe(document.documentElement, { childList: true, subtree: true });
    }

    // The environment, the responsive engine, then each section's own CSS —
    // fenced to that section, and with its width breakpoints redirected at the
    // container. One stylesheet, so its place in the cascade is knowable.
    const parts = [sectionRuntimeCss(scope), sectionResponsiveCss(scope)];

    sections.forEach((sec) => {
      const { headCss, headLinks } = extractStylesAndBody(sec.code || "");

      if (headCss.trim()) {
        parts.push(fenceCssToSection(remapDocumentSelectors(headCss, ".section-canvas-box"), sec.id));
      }

      // <link> tags are the one thing that cannot be fenced — a font is a font.
      const linkRegex = /<link([^>]+)>/gi;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(headLinks)) !== null) {
        const attrs = match[1] || "";
        const href = (attrs.match(/href=["']([^"']+)["']/i) || [])[1];
        if (!href || document.querySelector(`link[href="${href}"]`)) continue;
        const link = document.createElement("link");
        attrs.replace(/([\w-]+)=["']([^"']*)["']/gi, (_full: string, name: string, value: string) => {
          link.setAttribute(name, value);
          return "";
        });
        if (!link.getAttribute("rel")) link.setAttribute("rel", "stylesheet");
        link.setAttribute("data-xite-section", sec.id);
        head.appendChild(link);
      }
    });

    style.textContent = parts.join("\n\n");

    return () => {
      placement?.disconnect();
      document.querySelectorAll("link[data-xite-section]").forEach((el) => el.remove());
    };
  }, [sections, scope]);

  useTailwindContainerQueries(Boolean(simulatedWidth) && simulatedWidth !== "100%");
}

/**
 * Redirects Tailwind's own breakpoints at the container, while a device is
 * simulated.
 *
 * Everything the platform writes is container-queried, but Tailwind's Play CDN
 * generates `@media (min-width: 768px)` for `md:` and there is no configuring
 * that from here. On a real phone it is right, and inside a 375px editor frame
 * in a 1440px window it is wrong in the one way that matters: the Admin's iframe
 * *is* 375px wide, so it shows the mobile layout while the editor shows the
 * desktop one — for the same section, at the same nominal width.
 *
 * So while a device is simulated, Tailwind's sheet is mirrored with its width
 * queries pointed at the container and the original switched off. At full width
 * the container and the viewport are the same box and none of this runs.
 */
function useTailwindContainerQueries(active: boolean) {
  useEffect(() => {
    if (!active) return;

    let mirror: HTMLStyleElement | null = null;
    let source: HTMLStyleElement | null = null;
    let frame = 0;

    const findSource = () =>
      Array.from(document.querySelectorAll("style")).find(
        (candidate) =>
          candidate.id !== RUNTIME_STYLE_ID &&
          !candidate.hasAttribute("data-xite-tw-mirror") &&
          (candidate.textContent || "").includes("--tw-"),
      ) || null;

    const sync = () => {
      source = findSource();
      if (!source) return;

      const translated = viewportMediaToContainer(source.textContent || "");
      if (!mirror) {
        mirror = document.createElement("style");
        mirror.setAttribute("data-xite-tw-mirror", "true");
        source.after(mirror);
      }
      // Only write on a real change, or the observer that watches for Tailwind's
      // rebuilds would see this write and ask for another one.
      if (mirror.textContent !== translated) mirror.textContent = translated;
      if (source.sheet) source.sheet.disabled = true;
    };

    sync();

    const observer = new MutationObserver((records) => {
      const ours = records.every((record) => {
        const target = record.target as Node & { parentElement?: HTMLElement | null };
        return target === mirror || (target as HTMLElement)?.parentElement === mirror;
      });
      if (ours) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      if (source?.sheet) source.sheet.disabled = false;
      mirror?.remove();
    };
  }, [active]);
}
