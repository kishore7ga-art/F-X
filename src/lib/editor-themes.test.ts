import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_THEME_ID,
  EDITOR_FONTS,
  EDITOR_THEMES,
  fontById,
  themeById,
  detokenizeSectionHtml,
  themeFontsHref,
  themeStylesheet,
  tokenizeCss,
  tokenizeSectionHtml,
  generateHarmonicPalette,
  customThemeCss,
} from "@/lib/editor-themes";

describe("the editor themes", () => {
  it("includes default dual-themes and platform themes with unique ids", () => {
    assert.equal(EDITOR_THEMES.length, 6);
    assert.equal(new Set(EDITOR_THEMES.map((t) => t.id)).size, 6);
    assert.ok(EDITOR_THEMES.some((t) => t.id === "black-and-white"));
    assert.ok(EDITOR_THEMES.some((t) => t.id === "white-and-black"));
  });

  it("generates mathematical harmonic palettes with all required tokens", () => {
    const palette = generateHarmonicPalette("#3b82f6", "complementary", true);
    assert.ok(palette.surface.startsWith("#"));
    assert.ok(palette.accent.startsWith("#"));
    assert.ok(palette.text.startsWith("#"));
    const css = customThemeCss(".xite-site-canvas", palette);
    assert.ok(css.includes('--xite-accent: ' + palette.accent));
  });

  it("defines every token in every theme, so no var() ever falls through", () => {
    const expected = Object.keys(EDITOR_THEMES[0]!.tokens).sort();
    for (const theme of EDITOR_THEMES) {
      assert.deepEqual(Object.keys(theme.tokens).sort(), expected, `theme ${theme.id}`);
      for (const [name, value] of Object.entries(theme.tokens)) {
        assert.ok(value.trim(), `${theme.id}.${name} is empty`);
      }
    }
  });

  it("falls back to the default rather than to nothing", () => {
    assert.equal(themeById(null).id, DEFAULT_THEME_ID);
    assert.equal(themeById("cyber-neon").id, DEFAULT_THEME_ID);
    assert.equal(fontById("comic").id, EDITOR_FONTS[0]!.id);
  });

  it("offers exactly 12 Google Fonts with unique ids and valid stacks", () => {
    assert.equal(EDITOR_FONTS.length, 12);
    assert.equal(new Set(EDITOR_FONTS.map((f) => f.id)).size, 12);
    for (const font of EDITOR_FONTS) {
      assert.ok(font.name.trim(), `font ${font.id} has empty name`);
      assert.ok(font.stack.includes(font.name), `font ${font.id} stack does not include ${font.name}`);
      assert.ok(font.weights.trim(), `font ${font.id} has empty weights`);
    }
  });
});

describe("tokenizeCss — lossless by construction", () => {
  it("keeps the original colour as the fallback", () => {
    const out = tokenizeCss("background: #2563eb;");
    assert.equal(out, "background: var(--xite-accent, #2563eb);");
  });

  it("is case-insensitive and understands the short hex form", () => {
    assert.match(tokenizeCss("color: #2563EB"), /var\(--xite-accent, #2563EB\)/);
    assert.match(tokenizeCss("color: #FFF"), /var\(--xite-text, #FFF\)/);
  });

  it("handles rgb() as well as hex, which the old find-and-replace could not", () => {
    assert.match(tokenizeCss("background: rgb(37, 99, 235)"), /var\(--xite-accent, rgb\(37, 99, 235\)\)/);
  });

  it("preserves an rgba alpha instead of turning an overlay solid", () => {
    const out = tokenizeCss("background: rgba(37, 99, 235, 0.4)");
    assert.match(out, /color-mix\(in srgb, var\(--xite-accent, rgb\(37, 99, 235\)\) 40%, transparent\)/);
  });

  /**
   * The fallback is the *opaque* colour, and this is the assertion that says
   * why. It used to be the original `rgba()`, so with no theme set the mix
   * applied the alpha to a value that already carried it: `0.4` rendered at
   * `0.16`, and a `0.14` hairline at `0.0198`, which is invisible. The Admin's
   * iframe has no tokeniser and rendered the same declaration as written —
   * which is the whole of "the borders disappear in the editor".
   */
  it("applies the alpha once, not twice", () => {
    assert.doesNotMatch(tokenizeCss("background: rgba(37, 99, 235, 0.4)"), /rgba\(/);
  });

  it("leaves an alpha it cannot round-trip exactly alone", () => {
    // `0.125` would come back from a whole-number percentage as `0.13` — a
    // section quietly redrawn by an edit that touched a word of copy.
    assert.equal(
      tokenizeCss("background: rgba(37, 99, 235, 0.125)"),
      "background: rgba(37, 99, 235, 0.125)",
    );
  });

  it("leaves a colour that is not a brand colour exactly as the author wrote it", () => {
    // A photo's overlay tint or a chart's series colour is not the brand, and
    // must not move when the theme does.
    assert.equal(tokenizeCss("fill: #7c3f1d;"), "fill: #7c3f1d;");
    assert.equal(tokenizeCss("color: rgb(1, 2, 3);"), "color: rgb(1, 2, 3);");
  });

  it("is idempotent, so a second pass cannot nest var() inside var()", () => {
    const once = tokenizeCss("background: #2563eb;");
    assert.equal(tokenizeCss(once), once);
  });

  it("survives nothing", () => {
    assert.equal(tokenizeCss(""), "");
  });
});

describe("tokenizeSectionHtml — both channels, and nothing else", () => {
  it("rewrites inline style attributes", () => {
    const out = tokenizeSectionHtml('<div style="background: #2563eb">x</div>');
    assert.match(out, /style="background: var\(--xite-accent, #2563eb\)"/);
  });

  it("rewrites <style> blocks — which the old regex pass never touched at all", () => {
    const out = tokenizeSectionHtml("<style>.btn { background: #2563eb; }</style><div class='btn'></div>");
    assert.match(out, /background: var\(--xite-accent, #2563eb\)/);
  });

  it("handles single-quoted style attributes", () => {
    const out = tokenizeSectionHtml("<div style='color: #ffffff'>x</div>");
    assert.match(out, /style='color: var\(--xite-text, #ffffff\)'/);
  });

  it("does NOT touch text content", () => {
    // A section documenting a colour keeps saying it.
    const out = tokenizeSectionHtml("<p>Our brand blue is #2563eb.</p>");
    assert.equal(out, "<p>Our brand blue is #2563eb.</p>");
  });

  it("leaves the markup structurally identical", () => {
    const input = '<section class="hero" data-id="7"><h1 style="color:#fff">Hi</h1></section>';
    const out = tokenizeSectionHtml(input);
    assert.match(out, /^<section class="hero" data-id="7"><h1 style="color:var\(--xite-text, #fff\)">Hi<\/h1><\/section>$/);
  });
});

describe("themeStylesheet — one attribute switches everything", () => {
  const css = themeStylesheet(".xite-site-canvas");

  it("emits a block for every theme, keyed on the attribute", () => {
    for (const theme of EDITOR_THEMES) {
      assert.ok(
        css.includes(`.xite-site-canvas[data-xite-theme="${theme.id}"]`),
        `missing block for ${theme.id}`,
      );
    }
  });

  /**
   * This test used to assert the opposite, and the behaviour it protected was
   * the bug.
   *
   * A bare `.xite-site-canvas { --xite-accent: … }` block defined every token
   * on every canvas, whether or not a tenant had chosen a theme. Since a
   * tokenised colour is `var(--xite-accent, <what the author wrote>)`, having
   * the variable defined means the default palette wins and the author's value
   * — the fallback — is never reached.
   *
   * The Admin previews a section in an iframe that carries no theme layer, so
   * the fallback won there and the section rendered as authored. The editor
   * and the published site both inject this stylesheet, so they did not. Every
   * section with a tokenised colour therefore looked one way in the Admin and
   * another way everywhere else, permanently, with no setting responsible.
   */
  it("defines no tokens at all until a theme is chosen", () => {
    const defaults = themeById(DEFAULT_THEME_ID);
    assert.ok(
      !new RegExp(String.raw`\.xite-site-canvas\s*\{`).test(css),
      "a bare scope block would apply the default palette to every unthemed canvas",
    );
    // The default's own values still appear — inside its attribute block.
    const bareAccent = css.split(`[data-xite-theme="${DEFAULT_THEME_ID}"]`)[0] ?? "";
    assert.ok(
      !bareAccent.includes(`--xite-accent: ${defaults.tokens.accent};`),
      "the default accent is declared before any attribute gate",
    );
  });

  it("still applies the default palette when it is actually chosen", () => {
    const defaults = themeById(DEFAULT_THEME_ID);
    assert.ok(css.includes(`.xite-site-canvas[data-xite-theme="${DEFAULT_THEME_ID}"]`));
    assert.ok(css.includes(`--xite-accent: ${defaults.tokens.accent};`));
  });

  it("emits every token every theme declares", () => {
    for (const theme of EDITOR_THEMES) {
      for (const value of Object.values(theme.tokens)) {
        assert.ok(css.includes(value), `${theme.id} is missing ${value}`);
      }
    }
  });

  it("emits a font block per pack, and applies it only when one is chosen", () => {
    for (const font of EDITOR_FONTS) {
      assert.ok(css.includes(`[data-xite-font="${font.id}"]`), `missing ${font.id}`);
    }
    assert.ok(css.includes("[data-xite-font] :where(*)"));
  });

  it("contains no section markup — it is colours, and nothing that could carry content", () => {
    assert.ok(!/[<>]/.test(css));
  });
});

describe("detokenizeSectionHtml — what is saved is what was authored", () => {
  it("is the exact inverse of the forward pass", () => {
    const authored = '<div style="background: #2563eb; color: #ffffff"><style>.b{border-color:#a855f7}</style></div>';
    assert.equal(detokenizeSectionHtml(tokenizeSectionHtml(authored)), authored);
  });

  it("unwinds the color-mix an rgba fallback produced", () => {
    const authored = '<div style="background: rgba(37, 99, 235, 0.4)"></div>';
    assert.equal(detokenizeSectionHtml(tokenizeSectionHtml(authored)), authored);
  });

  it("leaves markup that was never tokenised untouched", () => {
    const plain = '<div style="background: #7c3f1d">x</div>';
    assert.equal(detokenizeSectionHtml(plain), plain);
  });

  it("round-trips through several edit cycles without drift", () => {
    // Inline editing reads the DOM back and saves; this is that loop.
    const authored = '<p style="color:#2563eb">Hello</p>';
    let stored = authored;
    for (let i = 0; i < 5; i++) {
      stored = detokenizeSectionHtml(tokenizeSectionHtml(stored));
    }
    assert.equal(stored, authored);
  });
});

/**
 * The webfont request.
 *
 * Both failure modes here are silent from the browser's side, which is why
 * they are asserted rather than eyeballed: too narrow a range and a light
 * weight has no font file, so the browser synthesises or substitutes one and
 * the author's setting appears not to work; too wide and Google Fonts answers
 * HTTP 400 for the whole stylesheet — every family in it, because they share
 * one URL.
 */
describe("themeFontsHref — every weight a family actually ships", () => {
  it("asks for the full range of the variable sans faces", () => {
    const href = themeFontsHref();
    assert.match(href, /family=Inter:wght@100\.\.900/);
    assert.match(href, /family=Outfit:wght@100\.\.900/);
  });

  it("does not ask Playfair Display for a weight it does not have", () => {
    // `Playfair+Display:wght@100..900` is answered with HTTP 400, and since all
    // three families are requested in one URL that would leave the platform
    // with no webfont at all.
    const href = themeFontsHref();
    assert.match(href, /family=Playfair\+Display:wght@400\.\.900/);
    assert.ok(!/Playfair\+Display:wght@100/.test(href));
  });

  it("names every family exactly once", () => {
    const families = themeFontsHref().match(/family=/g) ?? [];
    const unique = new Set(
      (themeFontsHref().match(/family=([^:]+):/g) ?? []).map((m) => m),
    );
    assert.equal(families.length, unique.size);
  });

  it("covers every font pack the editor offers", () => {
    const href = themeFontsHref();
    for (const font of EDITOR_FONTS) {
      for (const family of font.families) {
        assert.ok(
          href.includes(`family=${family.replace(/\s+/g, "+")}:`),
          `${family} is offered in the editor but never downloaded`,
        );
      }
    }
  });

  it("swaps rather than blocking the first paint", () => {
    assert.match(themeFontsHref(), /display=swap/);
  });
});
