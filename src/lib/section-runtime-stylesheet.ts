/**
 * The one stylesheet a canvas of sections renders against, assembled.
 *
 * This used to live inside `useSectionRuntime`, which meant the only way to ask
 * "what CSS does the editor actually put on the page?" was to render the editor.
 * A parity harness cannot do that, so the assembly is a function now and the
 * hook is the effect that installs what it returns. Same code on both sides, so
 * a test that passes is a statement about the editor rather than about a
 * reimplementation of it.
 *
 * Browser-only: `fenceCssToSection` borrows the browser's CSS parser.
 */
import { fenceCssToSection } from "./section-css-fence";
import { tokenizeCss } from "./editor-themes";
import {
  extractCssImports,
  extractStylesAndBody,
  remapDocumentSelectors,
  sectionResponsiveCss,
  sectionRuntimeCss,
  viewportUnitsToContainer,
} from "./section-runtime";

/** The element a section's own `body { … }` rule is remapped onto. */
export const SECTION_BOX_SELECTOR = ".section-canvas-box";

/** A stylesheet the canvas needs but cannot fence — a webfont is a webfont. */
export type SectionRuntimeLink = {
  /** The section that asked for it, for cleanup. */
  sectionId: string;
  /** Every attribute the author wrote, `rel` defaulted to `stylesheet`. */
  attrs: Record<string, string>;
};

export type SectionRuntimeStylesheet = {
  css: string;
  links: SectionRuntimeLink[];
};

type CodedSection = { id: string; code: string };

/**
 * @param scope         The element standing in for `<body>` — the canvas.
 * @param fillViewport  Whether the canvas reserves a screenful of the site's
 *                      own background. True for the site, false for the editor.
 */
export function buildSectionRuntimeStylesheet({
  sections,
  scope,
  fillViewport = true,
}: {
  sections: readonly CodedSection[];
  scope: string;
  fillViewport?: boolean;
}): SectionRuntimeStylesheet {
  // The environment, the responsive engine, then each section's own CSS —
  // fenced to that section, and with its width breakpoints redirected at the
  // container. One stylesheet, so its place in the cascade is knowable.
  const parts = [sectionRuntimeCss(scope, { fillViewport }), sectionResponsiveCss(scope)];
  const links: SectionRuntimeLink[] = [];
  const seenHrefs = new Set<string>();

  const addLink = (attrs: Record<string, string>, sectionId: string) => {
    const href = attrs.href;
    if (!href || seenHrefs.has(href)) return;
    seenHrefs.add(href);
    if (!attrs.rel) attrs.rel = "stylesheet";
    links.push({ sectionId, attrs });
  };

  sections.forEach((sec) => {
    const raw = extractStylesAndBody(sec.code || "");

    // The section's `@import`s, loaded as `<link>`s. The same extraction the
    // Admin's iframe now uses, so a webfont a section asks for arrives on all
    // three surfaces or on none of them. See `extractCssImports`.
    const { css: headCss, hrefs } = extractCssImports(raw.headCss);
    hrefs.forEach((href) => addLink({ href, rel: "stylesheet" }, sec.id));

    if (headCss.trim()) {
      /**
       * Tokenised before fencing, so the theme reaches a section's own CSS.
       * This is the only copy of that CSS in the document — `sectionCanvasHtml`
       * has already taken the `<style>` block out of the markup.
       */
      parts.push(
        fenceCssToSection(
          viewportUnitsToContainer(tokenizeCss(remapDocumentSelectors(headCss, SECTION_BOX_SELECTOR))),
          sec.id,
        ),
      );
    }

    const linkRegex = /<link([^>]+)>/gi;
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(raw.headLinks)) !== null) {
      const attrs: Record<string, string> = {};
      (match[1] || "").replace(
        /([\w-]+)=["']([^"']*)["']/gi,
        (_full: string, name: string, value: string) => {
          attrs[name] = value;
          return "";
        },
      );
      addLink(attrs, sec.id);
    }
  });

  return { css: parts.join("\n\n"), links };
}
