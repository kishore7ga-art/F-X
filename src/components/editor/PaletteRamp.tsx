"use client";

import type { EditorTheme } from "@/lib/editor-themes";

/**
 * A palette as a row of chips, light to dark.
 *
 * Replaces the two circles the picker used to show. Two circles were `base` and
 * `accent`, which is the least a palette can be described by: every dark theme
 * looked like "a dark circle and a coloured circle", so choosing between five
 * of them meant reading the names and guessing. A ramp shows the thing somebody
 * is actually choosing — how light the page is, how much contrast it has, where
 * the accent sits between the two.
 *
 * ── Derived from the tokens, not from a second list ─────────────────────────
 *
 * The chips are the same `tokens` the renderer paints the published site with,
 * so a palette cannot preview as one thing and render as another. Adding a
 * hand-written five-colour array per theme would have been quicker and would
 * have drifted the first time a token changed.
 */

/** Relative luminance, for ordering chips rather than for contrast maths. */
function luminance(hex: string): number {
  const value = hex.trim().replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (full.length !== 6) return 0;

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  // Rec. 709 coefficients. Good enough to sort by, and the alternative —
  // sorting by the hex string — puts #ff0000 above #ffffff.
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

/** Whether this is a hex colour we can reason about. Tokens include rgba(). */
function isHex(value: string | undefined): value is string {
  return typeof value === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

/**
 * Five chips for one theme, lightest first.
 *
 * The five tokens chosen are the ones a viewer can actually see on a rendered
 * page: the text colour, the raised surface, the accent, the page surface and
 * the footer. `border` and `textMuted` are excluded — they are usually
 * translucent or a near-duplicate of a neighbour, and a ramp with two
 * indistinguishable chips reads as a rendering bug.
 *
 * Deduplicated before sorting, because several themes use one colour for both
 * surface and header, and two identical chips waste a slot that could have
 * shown the accent.
 */
export function rampFor(theme: EditorTheme): string[] {
  const t = theme.tokens;
  const candidates = [t.text, t.surfaceRaised, t.accent, t.surface, t.footer, t.accentSoft];

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const colour of candidates) {
    if (!isHex(colour)) continue;
    const key = colour.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(colour);
  }

  return unique.sort((a, b) => luminance(b) - luminance(a)).slice(0, 5);
}

/**
 * The ramp itself.
 *
 * One rounded container with the chips flush against each other, rather than
 * separated circles: adjacent colours are what a palette *is*, and a gap
 * between them puts the card's own background into every comparison.
 */
export function PaletteRamp({
  theme,
  height = 30,
  width = 108,
}: {
  theme: EditorTheme;
  height?: number;
  /**
   * A number is pixels; a string is passed through, so a card can ask for
   * "100%". The alternative was a second `fullWidth` boolean, which is the same
   * information with a worse name.
   */
  width?: number | string;
}) {
  const ramp = rampFor(theme);

  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        width: typeof width === "number" ? `${width}px` : width,
        height: `${height}px`,
        borderRadius: "7px",
        overflow: "hidden",
        /*
         * A hairline, not a shadow. Most of these ramps start at white or very
         * near it, and without an edge the first chip dissolves into the card
         * and the palette silently loses a colour.
         */
        border: "1px solid rgba(15, 23, 42, 0.14)",
        flexShrink: 0,
      }}
    >
      {ramp.map((colour, index) => (
        <span
          key={`${colour}-${index}`}
          style={{ flex: 1, backgroundColor: colour, display: "block" }}
        />
      ))}
    </div>
  );
}
