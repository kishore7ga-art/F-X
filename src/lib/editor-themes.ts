/**
 * The four editor themes.
 *
 * ── What this replaces ─────────────────────────────────────────────────────
 *
 * Choosing a theme used to run a find-and-replace over every section's stored
 * HTML: a dozen hardcoded hex values, swapped for a dozen others, written back
 * into `sec.code` and autosaved. Three consequences, all of them observed:
 *
 *  1. It was destructive and one-way. `#2563eb` became `#f59e0b`, and switching
 *     back turned *every* `#f59e0b` blue — including the ones the section was
 *     authored with. A tenant who tried two themes could not get their original
 *     colours back, because the information needed to do it had been overwritten.
 *  2. It missed almost everything. Only twelve exact hex strings in four exact
 *     CSS property spellings were matched, so `rgb(37,99,235)`, `#2563EB`,
 *     `background:#2563eb` with no space, and every colour inside a `<style>`
 *     block were left as they were. A "theme switch" recoloured some buttons
 *     and left the page otherwise untouched, which reads as a broken feature.
 *  3. It could not be instant across pages. The rewrite only touched the
 *     sections currently in state — the page being looked at. Other pages kept
 *     the old colours until they were opened and re-themed, so a site could be
 *     half one theme and half another.
 *
 * ── What happens instead ───────────────────────────────────────────────────
 *
 * Nothing is written to `sec.code`, ever. Two mechanisms, both reversible:
 *
 *  1. `themeStylesheet()` emits all four themes' tokens as CSS custom
 *     properties, keyed on a `data-xite-theme` attribute. Switching the theme
 *     sets one attribute on one element. Every section under it retints in the
 *     same frame — no refetch, no re-render of section markup, no reload, and
 *     no dependency on which page happens to be open.
 *  2. `tokenizeSectionCss()` rewrites brand colours to `var(--xite-…, #original)`
 *     *at render time only*. The original hex stays in the file as the
 *     fallback, so a section renders identically with no theme applied, and
 *     removing the theme restores it exactly. This is what lets the tokens
 *     reach colours the old approach could not: it runs over the section's
 *     `<style>` blocks and its inline `style` attributes alike, and it
 *     understands `#rgb`, `#rrggbb` in any case, and `rgb()`/`rgba()`.
 */

export type EditorThemeId = "academic-blue" | "emerald-gold" | "crimson-slate" | "midnight-purple";
export type EditorFontId = "inter" | "outfit" | "serif";

export type EditorTheme = {
  id: EditorThemeId;
  name: string;
  description: string;
  /** The two colours the picker shows as a swatch. */
  swatch: { base: string; accent: string };
  tokens: {
    /** Page background, and the background of full-bleed bands. */
    surface: string;
    /** Cards, panels and anything raised off the surface. */
    surfaceRaised: string;
    /** Navbar background. Usually the darkest value in the theme. */
    header: string;
    /** Footer background. */
    footer: string;
    /** Buttons, links, active states — the colour the brand is recognised by. */
    accent: string;
    /** Accent text on a dark surface: the same hue, lightened to stay legible. */
    accentSoft: string;
    /** Text on the accent colour. */
    onAccent: string;
    /** Body text. */
    text: string;
    /** Secondary text, captions, metadata. */
    textMuted: string;
    /** Hairlines and dividers. */
    border: string;
  };
};

/**
 * The four.
 *
 * Chosen from the ten that were hardcoded in `PALETTES_MAP` and the five the
 * picker actually offered — the four that appeared in both lists, so no tenant
 * loses a theme they could have selected. `light-minimal` is deliberately not
 * here: its surface is white, and every section in the library is authored
 * against a dark background, so selecting it produced white text on white.
 */
export const EDITOR_THEMES: readonly EditorTheme[] = [
  {
    id: "academic-blue",
    name: "Academic Navy",
    description: "Deep navy with a clear institutional blue. The platform default.",
    swatch: { base: "#0f172a", accent: "#2563eb" },
    tokens: {
      surface: "#0f172a",
      surfaceRaised: "#1e293b",
      header: "#0d1527",
      footer: "#090d16",
      accent: "#2563eb",
      accentSoft: "#60a5fa",
      onAccent: "#ffffff",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      border: "rgba(148, 163, 184, 0.22)",
    },
  },
  {
    id: "emerald-gold",
    name: "Emerald & Gold",
    description: "Forest green with a warm gold accent. Reads as established and formal.",
    swatch: { base: "#064e3b", accent: "#f59e0b" },
    tokens: {
      surface: "#022c22",
      surfaceRaised: "#064e3b",
      header: "#01201a",
      footer: "#01201a",
      accent: "#f59e0b",
      accentSoft: "#fbbf24",
      onAccent: "#1c1917",
      text: "#f0fdf4",
      textMuted: "#a7c4b5",
      border: "rgba(167, 196, 181, 0.22)",
    },
  },
  {
    id: "crimson-slate",
    name: "Crimson Maroon",
    description: "Maroon and rose. The traditional heritage-institution palette.",
    swatch: { base: "#881337", accent: "#e11d48" },
    tokens: {
      surface: "#4c0519",
      surfaceRaised: "#881337",
      header: "#3b0413",
      footer: "#3b0413",
      accent: "#e11d48",
      accentSoft: "#fb7185",
      onAccent: "#ffffff",
      text: "#fff1f2",
      textMuted: "#e5a3b3",
      border: "rgba(229, 163, 179, 0.24)",
    },
  },
  {
    id: "midnight-purple",
    name: "Midnight Obsidian",
    description: "Near-black with a violet accent. The most modern of the four.",
    swatch: { base: "#180828", accent: "#a855f7" },
    tokens: {
      surface: "#0d0418",
      surfaceRaised: "#180828",
      header: "#080211",
      footer: "#080211",
      accent: "#a855f7",
      accentSoft: "#c084fc",
      onAccent: "#ffffff",
      text: "#faf5ff",
      textMuted: "#b8a4cc",
      border: "rgba(184, 164, 204, 0.24)",
    },
  },
] as const;

export const EDITOR_THEME_IDS = EDITOR_THEMES.map((t) => t.id);
export const DEFAULT_THEME_ID: EditorThemeId = "academic-blue";

export type EditorFont = {
  id: EditorFontId;
  name: string;
  description: string;
  /** The full stack, including fallbacks a browser will actually have. */
  stack: string;
  /** The Google Fonts families to load, or none for a system stack. */
  families: readonly string[];
};

export const EDITOR_FONTS: readonly EditorFont[] = [
  {
    id: "inter",
    name: "Inter",
    description: "Clean modern sans-serif. High readability at small sizes.",
    stack: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    families: ["Inter"],
  },
  {
    id: "outfit",
    name: "Outfit",
    description: "Geometric sans with a technical feel.",
    stack: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
    families: ["Outfit"],
  },
  {
    id: "serif",
    name: "Playfair Display",
    description: "Classic academic serif. Formal, high contrast.",
    stack: "'Playfair Display', Georgia, 'Times New Roman', serif",
    families: ["Playfair Display"],
  },
] as const;

export const EDITOR_FONT_IDS = EDITOR_FONTS.map((f) => f.id);
export const DEFAULT_FONT_ID: EditorFontId = "inter";

export function themeById(id: string | null | undefined): EditorTheme {
  return EDITOR_THEMES.find((t) => t.id === id) ?? EDITOR_THEMES[0]!;
}

export function fontById(id: string | null | undefined): EditorFont {
  return EDITOR_FONTS.find((f) => f.id === id) ?? EDITOR_FONTS[0]!;
}

/* ── Tokenising a section's colours ─────────────────────────────────────── */

/**
 * The colours the section library is authored in, and the token each maps to.
 *
 * These are the values that actually appear in the platform's own default
 * sections and in the Admin Studio's templates — read out of them rather than
 * guessed. A colour not on this list is left exactly as the author wrote it,
 * which is the point: a photograph's overlay tint or a chart's series colour is
 * not a brand colour and must not move when the theme does.
 */
const COLOUR_TOKENS: ReadonlyArray<readonly [string, keyof EditorTheme["tokens"]]> = [
  // Institutional blues — the default theme's accent.
  ["#2563eb", "accent"],
  ["#3b82f6", "accent"],
  ["#1d4ed8", "accent"],
  ["#38bdf8", "accentSoft"],
  ["#60a5fa", "accentSoft"],
  ["#7dd3fc", "accentSoft"],
  // The other three themes' accents, so a section authored under one theme
  // still moves when a tenant selects another.
  ["#f59e0b", "accent"],
  ["#eab308", "accent"],
  ["#fbbf24", "accentSoft"],
  ["#fde047", "accentSoft"],
  ["#e11d48", "accent"],
  ["#f43f5e", "accent"],
  ["#fb7185", "accentSoft"],
  ["#a855f7", "accent"],
  ["#9333ea", "accent"],
  ["#c084fc", "accentSoft"],
  // Surfaces from the default sections.
  ["#0f172a", "surface"],
  ["#0b1329", "surface"],
  ["#1e293b", "surfaceRaised"],
  ["#334155", "surfaceRaised"],
  ["#0d1527", "header"],
  ["#090d16", "footer"],
  ["#09090b", "surface"],
  // Text.
  ["#ffffff", "text"],
  ["#f8fafc", "text"],
  ["#cbd5e1", "textMuted"],
  ["#94a3b8", "textMuted"],
  ["#64748b", "textMuted"],
];

const TOKEN_FOR_HEX: ReadonlyMap<string, string> = new Map(
  COLOUR_TOKENS.map(([hex, token]) => [hex, token]),
);

/** `#abc` -> `#aabbcc`, so short and long forms hit the same map entry. */
function expandHex(hex: string): string {
  const body = hex.slice(1);
  if (body.length !== 3) return hex.toLowerCase();
  return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`.toLowerCase();
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * One `var(--xite-…, fallback)` this pass has already produced.
 *
 * Matched so it can be skipped. Without it the pass is not idempotent: a
 * second run sees the `#2563eb` sitting in the fallback and wraps the whole
 * thing again, producing `var(--xite-accent, var(--xite-accent, #2563eb))`,
 * and a third nests it deeper. That is not hypothetical — inline text editing
 * reads a section's markup back out of the live DOM, which is the tokenised
 * copy, so every edit would have added a layer.
 *
 * The inner alternation allows one level of nested parentheses so an
 * `rgba(…)` fallback is consumed as part of the same match.
 */
const EXISTING_TOKEN = /var\(--xite-[a-z-]+\s*,\s*(?:[^()]|\([^()]*\))*\)/i;
const HEX = /#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/i;
const RGB = /rgba?\(\s*\d+\s*[, ]\s*\d+\s*[, ]\s*\d+\s*(?:[,/]\s*[\d.]+\s*)?\)/i;

/** One scanner: an existing token is passed through, a colour is replaced. */
const COLOUR_SCAN = new RegExp(
  `${EXISTING_TOKEN.source}|${HEX.source}|${RGB.source}`,
  "gi",
);

const RGB_PARTS = /rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*(?:[,/]\s*([\d.]+)\s*)?\)/i;

/**
 * One CSS string with its brand colours turned into theme variables.
 *
 * Every replacement keeps the original value as the `var()` fallback, so this
 * is lossless: with no theme applied the section renders byte-identically to
 * how it was authored, and a token that is somehow undefined falls back rather
 * than rendering as nothing.
 *
 * `rgba()` keeps its alpha by going through `color-mix`, so a 40%-opacity
 * overlay stays a 40%-opacity overlay rather than becoming a solid block.
 *
 * Idempotent: running it twice produces the same string as running it once.
 */
export function tokenizeCss(css: string): string {
  if (!css) return css;

  return css.replace(COLOUR_SCAN, (match) => {
    // Already tokenised — by an earlier pass, or by a section author who wrote
    // the variable themselves. Either way it is finished.
    if (match.slice(0, 4).toLowerCase() === "var(") return match;

    if (match[0] === "#") {
      const token = TOKEN_FOR_HEX.get(expandHex(match));
      return token ? `var(--xite-${kebab(token)}, ${match})` : match;
    }

    const parts = match.match(RGB_PARTS);
    if (!parts) return match;

    const token = TOKEN_FOR_HEX.get(rgbToHex(Number(parts[1]), Number(parts[2]), Number(parts[3])));
    if (!token) return match;

    const variable = `var(--xite-${kebab(token)}, ${match})`;
    const alpha = parts[4];
    if (alpha === undefined || Number(alpha) >= 1) return variable;

    // `color-mix` with transparent is how an opacity is applied to a colour
    // that is not known until the theme is. Supported everywhere the rest of
    // this editor is; a browser without it falls back to the original `rgba()`.
    return `color-mix(in srgb, ${variable} ${Math.round(Number(alpha) * 100)}%, transparent)`;
  });
}

/**
 * The inverse: `var(--xite-accent, #2563eb)` back to `#2563eb`.
 *
 * The editor saves a section by reading its markup back out of the live DOM —
 * that is how inline text editing captures an edit — and what is in the DOM is
 * the tokenised copy. Without this pass, editing one word in a section would
 * write theme variables into the stored markup, and a section carrying
 * `var(--xite-…)` renders in the *viewer's* theme wherever it is later pasted
 * rather than in the colours its author chose.
 *
 * So tokens exist between the store and the screen, and nowhere else. What is
 * saved is what was authored.
 */
export function detokenizeCss(css: string): string {
  if (!css || !css.includes("--xite-")) return css;

  let previous: string;
  let out = css;

  // Looped because `color-mix(in srgb, var(--xite-accent, rgba(…)) 40%,
  // transparent)` unwraps to the `rgba()` in two steps, and a single pass would
  // leave the `color-mix` wrapper behind.
  do {
    previous = out;
    out = out.replace(
      /color-mix\(in srgb,\s*(var\(--xite-[a-z-]+\s*,\s*(?:[^()]|\([^()]*\))*\))\s*\d+%\s*,\s*transparent\)/gi,
      "$1",
    );
    out = out.replace(
      /var\(--xite-[a-z-]+\s*,\s*((?:[^()]|\([^()]*\))*)\)/gi,
      (_full, fallback: string) => fallback.trim(),
    );
  } while (out !== previous);

  return out;
}

function kebab(token: string): string {
  return token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/**
 * A section's markup, with its colours tokenised.
 *
 * Both channels: `<style>` blocks and `style="…"` attributes. Only those — the
 * pass never touches text content, so a section that mentions "#2563eb" in a
 * code sample keeps saying it.
 */
export function tokenizeSectionHtml(html: string): string {
  return mapSectionCss(html, tokenizeCss);
}

/**
 * A section's markup with every theme variable resolved back to its original
 * colour. The exact inverse of `tokenizeSectionHtml`.
 *
 * Applied on the way *out* of the canvas, so what reaches the database is the
 * markup as authored rather than as rendered.
 */
export function detokenizeSectionHtml(html: string): string {
  return mapSectionCss(html, detokenizeCss);
}

/** Applies `transform` to a section's `<style>` blocks and `style` attributes. */
function mapSectionCss(html: string, transform: (css: string) => string): string {
  if (!html) return html;

  const withStyleBlocks = html.replace(
    /(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)/gi,
    (_full, open: string, css: string, close: string) => `${open}${transform(css)}${close}`,
  );

  return withStyleBlocks.replace(
    /\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi,
    (_full, quote: string, css: string) => ` style=${quote}${transform(css)}${quote}`,
  );
}

/* ── The stylesheet ─────────────────────────────────────────────────────── */

/**
 * All four themes and all three font packs, as one static stylesheet.
 *
 * Static on purpose. Every theme's tokens are present at all times and the
 * `data-xite-theme` attribute selects between them, so switching costs one
 * attribute write — no stylesheet regeneration, no reflow of the section
 * markup, and nothing to re-fetch. That is what "instantly, across all
 * sections, without a page reload" means mechanically.
 *
 * The default theme's tokens are also emitted on the bare scope, so a canvas
 * that has not had the attribute set yet still resolves every `var()` rather
 * than silently falling back to two dozen unrelated original colours.
 */
export function themeStylesheet(scope: string): string {
  const blocks: string[] = [];

  const declarations = (theme: EditorTheme) =>
    Object.entries(theme.tokens)
      .map(([name, value]) => `  --xite-${kebab(name)}: ${value};`)
      .join("\n");

  blocks.push(`${scope} {\n${declarations(themeById(DEFAULT_THEME_ID))}\n}`);

  for (const theme of EDITOR_THEMES) {
    blocks.push(`${scope}[data-xite-theme="${theme.id}"] {\n${declarations(theme)}\n}`);
  }

  for (const font of EDITOR_FONTS) {
    blocks.push(`${scope}[data-xite-font="${font.id}"] {\n  --xite-font: ${font.stack};\n}`);
  }

  // The font token has to reach elements whose own `font-family` was written by
  // the section author, so this one rule is `!important` — it is the only place
  // in the theme layer that overrides rather than supplies, and it applies only
  // when a font pack has been explicitly chosen.
  blocks.push(
    `${scope}[data-xite-font] :where(*):not(i):not(svg):not([class*="icon"]) { font-family: var(--xite-font) !important; }`,
  );

  return blocks.join("\n\n");
}

/** The Google Fonts URL for every family the three packs need, loaded once. */
export function themeFontsHref(): string {
  const families = Array.from(new Set(EDITOR_FONTS.flatMap((f) => f.families)));
  const query = families
    .map((family) => `family=${family.replace(/\s+/g, "+")}:wght@400;500;600;700;800;900`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}
