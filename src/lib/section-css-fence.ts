/**
 * Confining a section's own CSS to that section's markup.
 *
 * In the Admin each section is previewed in its own iframe, so a bare `h2 { }` in
 * one section can only ever reach that section. The editor canvas and the published
 * site put every section in one document, where the same rule reaches the whole
 * site — one section quietly restyling the next is a difference from the Admin that
 * no amount of matching stylesheets can fix.
 *
 * Browser-only: it borrows the browser's own CSS parser.
 */
import { viewportMediaToContainer } from "./section-runtime";

/** Escapes a section id for use inside an attribute selector. */
export function cssEscape(value: string): string {
  return String(value).replace(/["\\]/g, "\\$&");
}

/**
 * Prefixes every selector in `css` with the section's fence.
 *
 * `:where()` carries no specificity, which is the whole point: the fence decides
 * *what a rule can reach*, never *which rule wins*. `@scope` was the obvious tool
 * and is the wrong one — scope proximity ranks above order of appearance in the
 * cascade, so a scoped `.title { font-size: 40px }` starts beating Tailwind's
 * `.text-2xl`, which is the exact fight it loses inside the Admin's iframe.
 *
 * The rewrite goes through a real stylesheet rather than a regex because `@media`,
 * nesting and `@keyframes` each need different handling and only a parser can tell
 * them apart — a keyframe step given a descendant selector silently kills the
 * animation.
 */
export function fenceCssToSection(css: string, sectionId: string): string {
  const fence = `:where([data-xite-section="${cssEscape(sectionId)}"])`;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);

    const walk = (rules: CSSRuleList) => {
      Array.from(rules).forEach((rule) => {
        if (rule instanceof CSSKeyframesRule) return;
        if (rule instanceof CSSStyleRule) {
          rule.selectorText = rule.selectorText
            .split(",")
            .map((selector) => `${fence} ${selector.trim()}`)
            .join(", ");
          return;
        }
        const grouping = rule as CSSRule & { cssRules?: CSSRuleList };
        if (grouping.cssRules) walk(grouping.cssRules);
      });
    };

    walk(sheet.cssRules);
    const fenced = Array.from(sheet.cssRules)
      .map((rule) => rule.cssText)
      .join("\n");
    // The author's own breakpoints ask about the space the section is in, which
    // is the container on every surface and the viewport on only one of them.
    return viewportMediaToContainer(fenced);
  } catch {
    // CSS the browser will not parse is CSS the Admin could not have rendered
    // either. Pass it through rather than dropping the section's styling.
    return viewportMediaToContainer(css);
  }
}

/**
 * Attributes that mean "the framework owns this stylesheet, not us".
 *
 * React 19 stamps `data-precedence` on stylesheets it hoists; Next stamps
 * `data-href` / `data-n-href` on the ones it injects during development.
 */
const FRAMEWORK_OWNED = "[data-precedence], [data-href], [data-n-href]";

/**
 * The stylesheet Tailwind's Play CDN generates for section markup.
 *
 * The test used to be "the first `<style>` whose text contains `--tw-`", and
 * that is not specific enough on this app. `globals.css` is Tailwind 4,
 * compiled at build time, and **its output contains `--tw-` variables too** —
 * verified in `.next/static/chunks/*.css`. So the search could return the
 * application's own stylesheet.
 *
 * For `placeBeforeTailwind` that is merely wrong. For the caller in
 * `useSectionRuntime` it is destructive: that one sets `sheet.disabled = true`
 * on whatever it finds, which would switch off the entire editor UI's styling
 * the moment a device preview is opened. Production escapes it because Next
 * serves its CSS as `<link>` rather than `<style>` — which makes this the kind
 * of bug that only appears on someone's laptop, and only sometimes.
 *
 * Two discriminators, both required: the sheet must carry `--tw-`, and it must
 * not be one the framework stamped as its own.
 */
export function findSectionTailwindStyle(exclude?: Element | null): HTMLStyleElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLStyleElement>("style")).find(
      (candidate) =>
        candidate !== exclude &&
        !candidate.matches(FRAMEWORK_OWNED) &&
        !candidate.id &&
        !candidate.hasAttribute("data-xite-tw-mirror") &&
        (candidate.textContent || "").includes("--tw-"),
    ) ?? null
  );
}

/**
 * Moves `style` in front of the stylesheet Tailwind's Play CDN generates.
 *
 * In the Admin's document Tailwind's stylesheet is the last one in `<head>`, so
 * `class="text-2xl"` beats a section's own `.title { font-size: 40px }`. Injected
 * after it instead, the same section renders at 40px — plausible, and not what the
 * Admin showed. Returns false while the CDN has not produced its stylesheet yet, so
 * the caller can wait for it.
 */
export function placeBeforeTailwind(style: HTMLStyleElement): boolean {
  const twStyle = findSectionTailwindStyle(style);
  if (!twStyle || !twStyle.parentNode) return false;
  if (style.compareDocumentPosition(twStyle) & Node.DOCUMENT_POSITION_FOLLOWING) return true;
  twStyle.parentNode.insertBefore(style, twStyle);
  return true;
}
