import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_THEME_ID,
  EDITOR_FONTS,
  EDITOR_THEMES,
  fontById,
  themeById,
  detokenizeSectionHtml,
  themeStylesheet,
  tokenizeCss,
  tokenizeSectionHtml,
} from "@/lib/editor-themes";

describe("the four themes", () => {
  it("is exactly four, with unique ids", () => {
    assert.equal(EDITOR_THEMES.length, 4);
    assert.equal(new Set(EDITOR_THEMES.map((t) => t.id)).size, 4);
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
    assert.match(out, /color-mix\(in srgb, var\(--xite-accent, rgba\(37, 99, 235, 0\.4\)\) 40%, transparent\)/);
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

  it("emits the default's tokens on the bare scope, so an unset canvas still resolves", () => {
    const defaults = themeById(DEFAULT_THEME_ID);
    assert.ok(css.includes(`.xite-site-canvas {`));
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
