"use client";

import { useEffect } from "react";

import { findSectionTailwindStyle, placeBeforeTailwind } from "@/lib/section-css-fence";
import { buildSectionRuntimeStylesheet } from "@/lib/section-runtime-stylesheet";
import { viewportMediaToContainer } from "@/lib/section-runtime";
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
 *
 * What that stylesheet *contains* is `buildSectionRuntimeStylesheet`; this hook
 * is only the effect that installs it. The split exists so the parity harness
 * can ask for the editor's real CSS without rendering the editor.
 */
const RUNTIME_STYLE_ID = "xite-section-runtime";

export function useSectionRuntime({
  sections,
  scope,
  simulatedWidth,
  fillViewport = true,
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
  /**
   * Whether the canvas reserves a screenful of the site's own background.
   *
   * The published site wants it; the editor does not. In the editor the canvas
   * sits on the studio's white surface, so reserving height paints a dark band
   * below the last section that looks like a broken section rather than the end
   * of the page.
   */
  fillViewport?: boolean;
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

    const { css, links } = buildSectionRuntimeStylesheet({ sections, scope, fillViewport });

    // <link> tags are the one thing that cannot be fenced — a font is a font.
    links.forEach(({ sectionId, attrs }) => {
      if (attrs.href && document.querySelector(`link[href="${attrs.href}"]`)) return;
      const link = document.createElement("link");
      Object.entries(attrs).forEach(([name, value]) => link.setAttribute(name, value));
      link.setAttribute("data-xite-section", sectionId);
      head.appendChild(link);
    });

    style.textContent = css;

    return () => {
      placement?.disconnect();
      document.querySelectorAll("link[data-xite-section]").forEach((el) => el.remove());
    };
  }, [sections, scope, fillViewport]);

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

    // Shared with `placeBeforeTailwind`, so both agree on which sheet is the
    // section engine's. This one *disables* what it finds, and the old test —
    // "any <style> containing --tw-" — also matches the app's own Tailwind 4
    // build output, which would have switched off the entire editor UI.
    const findSource = () => findSectionTailwindStyle(mirror);

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
