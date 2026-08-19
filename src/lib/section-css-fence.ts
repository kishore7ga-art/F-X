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
    return Array.from(sheet.cssRules)
      .map((rule) => rule.cssText)
      .join("\n");
  } catch {
    // CSS the browser will not parse is CSS the Admin could not have rendered
    // either. Pass it through rather than dropping the section's styling.
    return css;
  }
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
  const twStyle = Array.from(document.querySelectorAll("style")).find(
    (candidate) => candidate !== style && (candidate.textContent || "").includes("--tw-"),
  );
  if (!twStyle || !twStyle.parentNode) return false;
  if (style.compareDocumentPosition(twStyle) & Node.DOCUMENT_POSITION_FOLLOWING) return true;
  twStyle.parentNode.insertBefore(style, twStyle);
  return true;
}
