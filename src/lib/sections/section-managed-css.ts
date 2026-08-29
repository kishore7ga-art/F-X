/**
 * The stylesheet the toolbar owns, inside the stylesheet the author owns.
 *
 * ── Why the toolbar writes CSS rather than inline styles ───────────────────
 *
 * A section is a string of HTML. The obvious way to make "heading size" work is
 * to set `style="font-size: …"` on the heading, and it is wrong for one reason
 * that decides everything else: **an inline style has no device.** The editor
 * has Desktop / Tablet / Mobile modes and the platform's whole responsive
 * engine is container queries; a control that writes inline styles can only
 * ever set one value, so changing the mobile heading size would change the
 * desktop one. That is precisely the failure §20 of the brief forbids.
 *
 * So every styling control writes into a **managed region of the section's own
 * stylesheet**, keyed by element and by device:
 *
 *     [data-xite-el="e3"]{font-size:56px !important}
 *     @media (max-width: 1024px){ [data-xite-el="e3"]{font-size:44px !important} }
 *     @media (max-width: 640px){ [data-xite-el="e3"]{font-size:32px !important} }
 *
 * The runtime already rewrites width `@media` as `@container xite` on every
 * surface (`viewportMediaToContainer`), so those three rules resolve against
 * the box the section actually occupies — the editor's simulated width, the
 * Admin's iframe, the visitor's window — rather than against the operator's
 * monitor. Nothing new had to be built for that; the brief's responsive
 * requirement is satisfied by writing CSS the existing engine already handles.
 *
 * ── Why `!important` ───────────────────────────────────────────────────────
 *
 * Not a shortcut. The library is authored almost entirely in inline styles —
 * the platform's own hero opens `<h1 style="font-size:56px;font-weight:900…">`
 * — and **no selector beats an inline style**, at any specificity. A managed
 * rule without `!important` would be dead on arrival for the majority of real
 * sections, and the control would look broken while working perfectly.
 *
 * Between the managed region and the platform's own responsive engine, both
 * `!important`, the tie breaks on source order: `buildSectionRuntimeStylesheet`
 * appends each section's own CSS *after* `sectionResponsiveCss`, so an explicit
 * choice by the person editing wins over the automatic behaviour. That is the
 * right way round.
 *
 * ── Why sentinels rather than a marked `<style>` element ───────────────────
 *
 * A `<style data-xite-controls>` attribute does not survive the round trip.
 * `extractStylesAndBody` merges every block into one, and the backend's
 * `sanitizeSectionHtml` rebuilds `<style>` with its attributes dropped —
 * deliberately, and with one hard-coded exception that is not ours. CSS
 * comments survive both, and `safeCss` leaves them alone, so the region is
 * delimited by comments. What the *browser* eventually sees has the comments
 * stripped by `fenceCssToSection` — which is fine, because the sentinels are a
 * property of what is stored, not of what is rendered.
 */

import { SECTION_BREAKPOINTS, extractStylesAndBody } from "@/lib/section-runtime";

/** The three columns of the responsive editor, as this module names them. */
export type Device = "desktop" | "tablet" | "mobile";

export const DEVICES: readonly Device[] = ["desktop", "tablet", "mobile"];

/**
 * Where a managed rule is written.
 *
 * The three devices are **cascading** tiers: `tablet` is `max-width: 1024px`,
 * so it is in force on a phone too, and `mobile` layered after it is what makes
 * a mobile value override a tablet one. That is the right model for a size or a
 * colour — set it once on Desktop and it applies everywhere unless overridden.
 *
 * It is the wrong model for hiding. "Hide on tablet" must not hide on mobile,
 * and there is no way to say that in a cascading tier: `display: none` on the
 * tablet tier reaches the phone, and there is no value that undoes it — `revert`
 * rolls back past the *author's own* `display: flex` to the browser default,
 * turning a flex row into a block the moment somebody unhides it.
 *
 * So visibility gets two **exclusive** tiers of its own, whose ranges cannot
 * overlap: `desktop-only` is `min-width: 1025px` and `tablet-only` is the band
 * between the breakpoints. Hiding on mobile needs no third one, because
 * `max-width: 640px` — the mobile tier — is already exactly the phone band.
 */
export type Tier = Device | "desktop-only" | "tablet-only";

export const TIERS: readonly Tier[] = ["desktop", "tablet", "mobile", "desktop-only", "tablet-only"];

/**
 * The attribute that gives an element a stable identity across edits.
 *
 * Stamped lazily — only when a control first writes a style to an element — so
 * a section nobody has styled through the toolbar carries no trace of it, and
 * `data-*` is on the tenant sanitiser's allowlist so the stamp survives the
 * round trip through the backend.
 *
 * Duplicating a card copies the stamp with it, and that is deliberate: the two
 * cards then share their managed styling, which is what "duplicate" means in a
 * card grid. Anyone wanting them to differ edits the item's own content
 * controls, which act on the markup rather than on the key.
 */
export const ELEMENT_KEY_ATTR = "data-xite-el";

const START = "/* xite:controls */";
const END = "/* /xite:controls */";

/** Declarations for one element, per tier. Insertion order is not meaningful. */
export type ElementStyles = Partial<Record<Tier, Record<string, string>>>;

/** The whole managed region: element key -> device -> property -> value. */
export type ManagedStyles = Record<string, ElementStyles>;

/**
 * The CSS selector a managed key resolves to.
 *
 * The attribute is written **twice** on purpose. It costs nothing and it wins
 * the one fight a single attribute selector loses: the theme layer's font rule,
 * `[data-xite-font] :where(*):not(i):not(svg):not([class*="icon"])
 * { font-family: … !important }`, which is `(0,1,3)` and would otherwise beat a
 * managed `font-family` at `(0,1,0)`. Doubled it is `(0,2,0)`, which wins on the
 * class column before the element column is ever reached. Nothing else in the
 * document targets this attribute, so there is no rule it beats by accident.
 */
export function keySelector(key: string): string {
  const attr = `[${ELEMENT_KEY_ATTR}="${key.replace(/["\\]/g, "\\$&")}"]`;
  return `${attr}${attr}`;
}

/** The media condition wrapping a tier's rules, or null for the base tier. */
export function tierCondition(tier: Tier): string | null {
  switch (tier) {
    case "tablet":
      return `(max-width: ${SECTION_BREAKPOINTS.tablet}px)`;
    case "mobile":
      return `(max-width: ${SECTION_BREAKPOINTS.mobile}px)`;
    case "desktop-only":
      return `(min-width: ${SECTION_BREAKPOINTS.tablet + 1}px)`;
    case "tablet-only":
      return `(min-width: ${SECTION_BREAKPOINTS.mobile + 1}px) and (max-width: ${SECTION_BREAKPOINTS.tablet}px)`;
    default:
      return null;
  }
}

/* ── Reading ────────────────────────────────────────────────────────────── */

/** Splits a stylesheet into what the author wrote and what the toolbar owns. */
export function splitManagedRegion(css: string): { authored: string; managed: string } {
  const text = css || "";
  const from = text.indexOf(START);
  if (from < 0) return { authored: text, managed: "" };
  const to = text.indexOf(END, from);
  if (to < 0) return { authored: text.slice(0, from), managed: text.slice(from + START.length) };
  return {
    authored: text.slice(0, from) + text.slice(to + END.length),
    managed: text.slice(from + START.length, to),
  };
}

/**
 * Reads the managed region back into the model.
 *
 * Tolerant on purpose: anything it cannot make sense of is dropped rather than
 * throwing. The worst case is that a few overrides are forgotten and the
 * controls fall back to reading the author's own values — which is a visible,
 * recoverable state. Throwing here would take the whole toolbar down over one
 * malformed declaration.
 */
export function parseManagedStyles(css: string): ManagedStyles {
  const { managed } = splitManagedRegion(css);
  const out: ManagedStyles = {};
  if (!managed.trim()) return out;

  const record = (key: string, tier: Tier, decls: Record<string, string>) => {
    if (Object.keys(decls).length === 0) return;
    const entry = (out[key] ??= {});
    entry[tier] = { ...(entry[tier] ?? {}), ...decls };
  };

  const readRules = (block: string, tier: Tier) => {
    let index = 0;
    while (index < block.length) {
      const open = block.indexOf("{", index);
      if (open < 0) break;
      const close = findClosingBrace(block, open);
      if (close < 0) break;
      const selector = block.slice(index, open).trim();
      const key = keyFromSelector(selector);
      if (key) record(key, tier, parseDeclarations(block.slice(open + 1, close)));
      index = close + 1;
    }
  };

  let index = 0;
  let base = "";
  while (index < managed.length) {
    const at = managed.indexOf("@media", index);
    if (at < 0) {
      base += managed.slice(index);
      break;
    }
    base += managed.slice(index, at);
    const open = managed.indexOf("{", at);
    if (open < 0) break;
    const close = findClosingBrace(managed, open);
    if (close < 0) break;
    const condition = managed.slice(at + "@media".length, open).trim();
    const tier = tierFromCondition(condition);
    if (tier) readRules(managed.slice(open + 1, close), tier);
    index = close + 1;
  }
  readRules(base, "desktop");

  return out;
}

/**
 * A media condition back to the tier that produced it.
 *
 * Matched by its numbers rather than by string equality, so a region written by
 * an older build — or one a formatter has been through — still reads back. A
 * condition that is not one of ours is skipped entirely rather than guessed at:
 * silently filing a stranger's rule under `desktop` would then rewrite it into
 * the wrong query on the next save.
 */
function tierFromCondition(condition: string): Tier | null {
  const max = /max-width\s*:\s*(\d+)px/i.exec(condition);
  const min = /min-width\s*:\s*(\d+)px/i.exec(condition);
  const maxWidth = max ? Number(max[1]) : null;
  const minWidth = min ? Number(min[1]) : null;
  const { mobile, tablet } = SECTION_BREAKPOINTS;

  if (minWidth === tablet + 1 && maxWidth === null) return "desktop-only";
  if (minWidth === mobile + 1 && maxWidth === tablet) return "tablet-only";
  if (minWidth === null && maxWidth === mobile) return "mobile";
  if (minWidth === null && maxWidth === tablet) return "tablet";
  return null;
}

function keyFromSelector(selector: string): string | null {
  // One or two copies of the attribute: regions written before the specificity
  // fix carry one, and reading them back is how those overrides survive.
  const attr = `\\[${ELEMENT_KEY_ATTR}="([^"]+)"\\]`;
  const match = new RegExp(`^${attr}(?:${attr})?$`).exec(selector.trim());
  return match ? match[1]! : null;
}

/** The index of the brace closing the one at `open`, or -1. */
function findClosingBrace(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * `prop: value; prop: value` into an object, with `!important` stripped.
 *
 * Splitting on `;` and `:` naively breaks on `url(data:image/png;base64,…)`
 * and on `background-image: linear-gradient(…)`, both of which the background
 * controls produce — so the split is depth-aware over brackets and quotes.
 */
export function parseDeclarations(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  let depth = 0;
  let quote = "";
  let start = 0;

  const push = (chunk: string) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;
    const colon = indexOfTopLevel(trimmed, ":");
    if (colon <= 0) return;
    const name = trimmed.slice(0, colon).trim().toLowerCase();
    const value = trimmed.slice(colon + 1).replace(/!\s*important\s*$/i, "").trim();
    if (name && value) out[name] = value;
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    if (quote) {
      if (ch === quote && text[i - 1] !== "\\") quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === ";" && depth === 0) {
      push(text.slice(start, i));
      start = i + 1;
    }
  }
  push(text.slice(start));
  return out;
}

function indexOfTopLevel(text: string, char: string): number {
  let depth = 0;
  let quote = "";
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    if (quote) {
      if (ch === quote && text[i - 1] !== "\\") quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === char && depth === 0) return i;
  }
  return -1;
}

/* ── Writing ────────────────────────────────────────────────────────────── */

/**
 * A custom property the toolbar stores to remember what a control was set to.
 *
 * Some controls do not map to one declaration. "Overlay colour" and "overlay
 * opacity" are two controls that together become one `background-image` layer,
 * and there is no reading either of them back out of the composed value. So the
 * inputs are stored as custom properties beside the composed declaration —
 * valid CSS, inert, and the only honest way to reopen the panel showing what
 * the person actually chose.
 */
export const VAR_PREFIX = "--x-";

const isVar = (prop: string) => prop.startsWith("--");

/** Serialises the model back into a managed region. */
export function serializeManagedStyles(styles: ManagedStyles): string {
  const rulesFor = (tier: Tier): string[] =>
    Object.keys(styles)
      .sort()
      .flatMap((key) => {
        const decls = styles[key]?.[tier];
        if (!decls) return [];
        const body = Object.keys(decls)
          .sort()
          .map((prop) => {
            const value = decls[prop]!;
            // A custom property is a stored input, never a rendered one, so it
            // has nothing to win against and takes no `!important`.
            return isVar(prop) ? `${prop}:${value}` : `${prop}:${value} !important`;
          })
          .join(";");
        return body ? [`${keySelector(key)}{${body}}`] : [];
      });

  const lines: string[] = [];
  lines.push(...rulesFor("desktop"));

  // Tablet before mobile, so that at a mobile width — where both conditions are
  // true — the mobile rule is the later one and wins. The two exclusive
  // visibility tiers come last; their ranges cannot overlap each other, so
  // their order among themselves carries no meaning.
  (["tablet", "mobile", "desktop-only", "tablet-only"] as const).forEach((tier) => {
    const rules = rulesFor(tier);
    if (rules.length === 0) return;
    lines.push(`@media ${tierCondition(tier)}{`, ...rules, `}`);
  });

  if (lines.length === 0) return "";
  return `\n${START}\n${lines.join("\n")}\n${END}\n`;
}

/** Replaces the managed region of a stylesheet, keeping the author's CSS. */
export function writeManagedRegion(css: string, styles: ManagedStyles): string {
  const { authored } = splitManagedRegion(css);
  const region = serializeManagedStyles(styles);
  const base = authored.replace(/\s+$/, "");
  if (!region) return base;
  return `${base}${region}`;
}

/**
 * One property set, cleared, on one element and one device.
 *
 * An empty value **removes** the declaration rather than writing `prop: ;`.
 * That is what makes a control's "reset" free: clearing the mobile heading size
 * falls back through the cascade to the tablet value, then to the desktop one,
 * then to whatever the author wrote — which is the behaviour a person expects
 * from emptying a field, and the reason nothing here ever needs to store "not
 * set" as a value.
 */
export function setManagedProperty(
  styles: ManagedStyles,
  key: string,
  tier: Tier,
  prop: string,
  value: string | null,
): ManagedStyles {
  const next: ManagedStyles = { ...styles };
  const forKey: ElementStyles = { ...(next[key] ?? {}) };
  const forTier: Record<string, string> = { ...(forKey[tier] ?? {}) };

  if (value === null || value === "") delete forTier[prop];
  else forTier[prop] = value;

  if (Object.keys(forTier).length === 0) delete forKey[tier];
  else forKey[tier] = forTier;

  if (Object.keys(forKey).length === 0) delete next[key];
  else next[key] = forKey;

  return next;
}

/** Several properties at once, so one control change is one write. */
export function setManagedProperties(
  styles: ManagedStyles,
  key: string,
  tier: Tier,
  props: Record<string, string | null>,
): ManagedStyles {
  return Object.entries(props).reduce(
    (acc, [prop, value]) => setManagedProperty(acc, key, tier, prop, value),
    styles,
  );
}

/** Keys the markup no longer contains, dropped. Called after structural edits. */
export function pruneManagedStyles(styles: ManagedStyles, liveKeys: ReadonlySet<string>): ManagedStyles {
  const stale = Object.keys(styles).filter((key) => !liveKeys.has(key));
  if (stale.length === 0) return styles;
  const next = { ...styles };
  stale.forEach((key) => delete next[key]);
  return next;
}

/** Everything the toolbar has ever set on one element, on every device. */
export function forgetKey(styles: ManagedStyles, key: string): ManagedStyles {
  if (!(key in styles)) return styles;
  const next = { ...styles };
  delete next[key];
  return next;
}

/**
 * A managed value, read the way the cascade resolves it.
 *
 * Mobile falls back to tablet, tablet to desktop. Without that, opening the
 * panel on Mobile would show every field empty for a section whose sizes were
 * all set on Desktop — implying nothing is set, when in fact the mobile canvas
 * is rendering the desktop value.
 */
export function resolveManagedValue(
  styles: ManagedStyles,
  key: string,
  device: Device,
  prop: string,
): { value: string | null; from: Device | null } {
  const chain: Device[] =
    device === "mobile" ? ["mobile", "tablet", "desktop"] : device === "tablet" ? ["tablet", "desktop"] : ["desktop"];
  for (const tier of chain) {
    const value = styles[key]?.[tier]?.[prop];
    if (value !== undefined) return { value, from: tier };
  }
  return { value: null, from: null };
}

/* ── The section's stored code ──────────────────────────────────────────── */

/** A section's code split into the three parts every edit works on. */
export type SectionParts = { headLinks: string; headCss: string; bodyHtml: string };

export function splitSectionCode(code: string): SectionParts {
  const { headCss, headLinks, bodyHtml } = extractStylesAndBody(code || "");
  return { headLinks: headLinks.trim(), headCss, bodyHtml };
}

/**
 * The inverse, in the shape `recomposeSectionCode` produces.
 *
 * Kept byte-compatible with that function on purpose: a section written by the
 * toolbar and a section written by the inline text editor have to be the same
 * kind of string, or the two paths would fight over formatting on every save.
 */
export function joinSectionCode(parts: SectionParts): string {
  const out: string[] = [];
  if (parts.headLinks.trim()) out.push(parts.headLinks.trim());
  if (parts.headCss.trim()) out.push(`<style>\n${parts.headCss.trim()}\n</style>`);
  out.push(parts.bodyHtml.trim());
  return out.filter(Boolean).join("\n");
}
