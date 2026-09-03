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
import { sanitizeCssUrls } from "./sections/section-managed-css";

/** Escapes a section id for use inside an attribute selector. */
export function cssEscape(value: string): string {
  return String(value).replace(/["\\]/g, "\\$&");
}

/**
 * Selectors that mean "the document itself" rather than an element inside it.
 *
 * Matched as a whole leading token, so `body` is rewritten and `body-copy` is
 * not. A compound such as `body.dark` keeps everything after the token.
 */
const ROOT_TOKEN = /^(?::root|html|body)\b/;

/**
 * Rewrites one selector so it can only reach inside a section.
 *
 * ── The bug this is the fix for ────────────────────────────────────────────
 *
 * Fencing prefixed every selector with `fence <selector>` — a descendant
 * combinator. That is right for `.title`, `h2` and `nav a`, and silently fatal
 * for the three selectors that name the document: `:root` became
 * `:where([data-xite-section="…"]) :root`, which matches nothing, because
 * `:root` is `<html>` and `<html>` is nobody's descendant. Same for `html` and
 * `body`.
 *
 * Almost every section in this library opens with
 *
 *     :root { --brand-font: 'Times New Roman', serif; --nav-font: 'Arial'; }
 *
 * and then uses `var(--brand-font)` throughout. In the Admin's iframe that
 * `<style>` goes into `<head>`, `:root` is the iframe's own `<html>`, and the
 * variables resolve. On the editor canvas and the published site the rule
 * matched nothing, so every one of those custom properties was **undefined**,
 * every `var()` referencing one became invalid at computed-value time, and the
 * property fell back to whatever was inherited — the canvas's own Inter.
 *
 * So a header authored with a serif wordmark and an Arial nav was previewed
 * that way in the Admin and published in Inter, and the same silent
 * substitution applied to every colour, size and spacing token a section
 * declared this way. It is measurable: the platform's own default header
 * renders `.brand-sub` in `"Times New Roman", Georgia, serif` in the Admin and
 * in `Inter, system-ui, sans-serif` live.
 *
 * ── The rule ───────────────────────────────────────────────────────────────
 *
 * Inside a section's own subtree the fence element *is* the document root: it
 * is what `sectionRuntimeCss` already styles in place of `html, body`. So a
 * selector that names the document is rewritten to the fence itself rather
 * than to a descendant of it, and anything that follows the token is kept:
 *
 *     :root            → :where([data-xite-section="…"])
 *     body.dark        → :where([data-xite-section="…"]).dark
 *     :root .title     → :where([data-xite-section="…"]) .title
 *     .title           → :where([data-xite-section="…"]) .title
 */
export function rescopeSelector(selector: string, fence: string): string {
  const trimmed = selector.trim();
  if (!trimmed) return trimmed;

  const match = trimmed.match(ROOT_TOKEN);
  if (!match) return `${fence} ${trimmed}`;

  // Everything the author attached to the token — `.dark`, `[data-x]`, `:has()`
  // — stays attached to the fence. A descendant part keeps its space.
  const rest = trimmed.slice(match[0].length);
  return `${fence}${rest}`;
}

/**
 * Prefixes every selector in `css` with the section's fence.
 *
 * Prefix every rule in a stylesheet with `:where([data-xite-section="id"])`.
 *
 * Scopes a section's stylesheet to its own element, so rules like `p { color: red }`
 * cannot bleed into other sections on the page. Uses the native CSS parser to
 * rewrite selector text rule by rule, preserving media queries and at-rules.
 */
export function fenceCssToSection(css: string, sectionId: string): string {
  const cleanCss = sanitizeCssUrls(css);
  const fence = `:where([data-xite-section="${cssEscape(sectionId)}"])`;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cleanCss);

    const walk = (rules: CSSRuleList) => {
      Array.from(rules).forEach((rule) => {
        if (rule instanceof CSSKeyframesRule) return;
        if (rule instanceof CSSStyleRule) {
          rule.selectorText = rule.selectorText
            .split(",")
            .map((selector) => rescopeSelector(selector, fence))
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
