import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSectionPreviewDocument,
  containerUnitsToViewport,
  extractCssImports,
  extractStylesAndBody,
  mapInlineStyles,
  recomposeSectionCode,
  sectionCanvasHtml,
  sectionRuntimeCss,
  viewportMediaToContainer,
  viewportUnitsToContainer,
} from "@/lib/section-runtime";

/** A section shaped like the ones in the library: own CSS, own font, real markup. */
const SECTION = `<style>
  @import url("https://fonts.googleapis.com/css2?family=Outfit&display=swap");
  h2 { color: #e11d48; font-size: 40px; }
  .card { background: #1e293b; padding: 24px; }
  @media (max-width: 700px) { .card { padding: 12px; } }
</style>
<link rel="stylesheet" href="https://example.test/extra.css">
<section class="hero"><h2>Admissions</h2><div class="card">Apply now</div></section>`;

describe("sectionCanvasHtml — one section's CSS, in the document once", () => {
  it("lifts every <style> block out of the markup", () => {
    // This is the fix. The editor's own stripper left them in, so each
    // section's CSS was in the document twice — once fenced to that section by
    // the runtime, and once unfenced, reaching every other section on the page.
    const html = sectionCanvasHtml(SECTION);
    assert.ok(!/<style/i.test(html), "a <style> block survived into the canvas markup");
  });

  it("lifts <link> stylesheets out too, so they are not duplicated per render", () => {
    assert.ok(!/<link/i.test(sectionCanvasHtml(SECTION)));
  });

  it("keeps the section's actual content", () => {
    const html = sectionCanvasHtml(SECTION);
    assert.ok(html.includes('<section class="hero">'));
    assert.ok(html.includes("<h2>Admissions</h2>"));
    assert.ok(html.includes("Apply now"));
  });

  it("wraps in the box the runtime's reset and fences target", () => {
    assert.match(sectionCanvasHtml(SECTION), /^<div class="section-canvas-box">/);
  });

  it("keeps a <header> whole — the tag-name boundary bug", () => {
    // `<head[\s\S]*?>` also matches `<header ...>`, and `</head>` matches
    // `</header>`, which used to delete the wrapper of every navbar section.
    const navbar = `<header style="background:#0d1527;padding:18px"><nav><a href="#">About</a></nav></header>`;
    const html = sectionCanvasHtml(navbar);
    assert.ok(html.includes("<header"), "the header element was stripped");
    assert.ok(html.includes("background:#0d1527"), "the header lost its styling");
    assert.ok(html.includes("</header>"));
  });

  it("unwraps a full document down to its body", () => {
    const doc = `<!DOCTYPE html><html><head><style>p{color:red}</style></head><body><p>hi</p></body></html>`;
    const html = sectionCanvasHtml(doc);
    assert.ok(!/<style|<html|<body|DOCTYPE/i.test(html));
    assert.ok(html.includes("<p>hi</p>"));
  });

  it("survives an empty section", () => {
    assert.equal(sectionCanvasHtml(""), '<div class="section-canvas-box"></div>');
  });
});

describe("visual parity — the editor and the live site render the same bytes", () => {
  it("is one function, so the two surfaces cannot disagree", () => {
    // The editor had its own document stripper and the site had this one. They
    // disagreed about <style> blocks, which is why a section looked one way in
    // the studio and another way published. Both call this now; the assertion
    // is that the contract is byte-equality, not merely "similar".
    const editorHtml = sectionCanvasHtml(SECTION);
    const publishedHtml = sectionCanvasHtml(SECTION);
    assert.equal(editorHtml, publishedHtml);
  });

  it("is deterministic across repeated renders of the same section", () => {
    const once = sectionCanvasHtml(SECTION);
    for (let i = 0; i < 5; i++) assert.equal(sectionCanvasHtml(SECTION), once);
  });
});

describe("extractStylesAndBody — the CSS the runtime will fence", () => {
  it("hands back exactly the CSS it removed from the markup", () => {
    const { headCss, bodyHtml } = extractStylesAndBody(SECTION);
    assert.ok(headCss.includes("h2 { color: #e11d48"));
    assert.ok(headCss.includes(".card { background: #1e293b"));
    assert.ok(!bodyHtml.includes("#e11d48"), "the CSS is still in the markup as well");
  });

  it("drops the frozen auto-responsive fork, and only that", () => {
    const withFork = `<style data-xite-auto-responsive>.x{color:red}</style><style>.y{color:blue}</style><p>hi</p>`;
    const { headCss } = extractStylesAndBody(withFork);
    assert.ok(!headCss.includes("color:red"), "the stale auto-responsive copy survived");
    assert.ok(headCss.includes("color:blue"), "the author's own CSS was dropped");
  });

  it("separates the section's <link> tags from its markup", () => {
    const { headLinks, bodyHtml } = extractStylesAndBody(SECTION);
    assert.ok(headLinks.includes("example.test/extra.css"));
    assert.ok(!bodyHtml.includes("example.test/extra.css"));
  });
});

describe("the canvas ground follows the theme", () => {
  it("reads its background and text from theme tokens, with the old values as fallbacks", () => {
    const css = sectionRuntimeCss(".xite-site-canvas");
    assert.match(css, /background-color: var\(--xite-surface, #09090b\)/);
    assert.match(css, /color: var\(--xite-text, #ffffff\)/);
    // The fallback matters: the Admin's iframe has no theme tokens defined, so
    // it must keep rendering exactly as it does today.
    assert.match(css, /font-family: var\(--xite-font, "Inter"/);
  });
});

describe("viewportMediaToContainer — a section asks about its own box", () => {
  it("translates width media queries to container queries", () => {
    const out = viewportMediaToContainer("@media (max-width: 700px) { .card { padding: 12px } }");
    assert.match(out, /@container/);
  });

  it("leaves device queries alone", () => {
    for (const query of [
      "@media print { .x { display: none } }",
      "@media (prefers-reduced-motion: reduce) { .x { animation: none } }",
      "@media (orientation: portrait) { .x { color: red } }",
    ]) {
      assert.equal(viewportMediaToContainer(query), query, `rewrote ${query}`);
    }
  });
});

describe("recomposeSectionCode — editing text must not delete the CSS", () => {
  it("puts the section's stylesheet back after an edit made on the canvas", () => {
    // The canvas holds no <style> by design, so the DOM returns body markup
    // only. Saving that verbatim would strip the section's whole stylesheet the
    // first time somebody corrected a typo.
    const editedBody = `<section class="hero"><h2>Admissions 2027</h2><div class="card">Apply now</div></section>`;
    const rebuilt = recomposeSectionCode(SECTION, editedBody);

    assert.ok(rebuilt.includes("h2 { color: #e11d48"), "the section's CSS was lost");
    assert.ok(rebuilt.includes(".card { background: #1e293b"), "the section's CSS was lost");
    assert.ok(rebuilt.includes("Admissions 2027"), "the edit was lost");
    assert.ok(rebuilt.includes("example.test/extra.css"), "the section's <link> was lost");
  });

  it("round-trips: canvas → edit → store → canvas, with nothing lost", () => {
    let stored = SECTION;
    for (let i = 0; i < 4; i++) {
      const onCanvas = sectionCanvasHtml(stored);
      const body = onCanvas.replace(/^<div class="section-canvas-box">/, "").replace(/<\/div>$/, "");
      stored = recomposeSectionCode(stored, body);
    }
    assert.ok(stored.includes("h2 { color: #e11d48"));
    assert.ok(stored.includes(".card { background: #1e293b"));
    assert.ok(stored.includes("<h2>Admissions</h2>"));
    // And the CSS is still in exactly one <style> block, not four.
    assert.equal((stored.match(/<style/g) || []).length, 1);
  });

  it("handles a section that has no CSS at all", () => {
    assert.equal(recomposeSectionCode("<p>a</p>", "<p>b</p>"), "<p>b</p>");
  });
});

describe("fillViewport — the canvas ends where its sections end, in the editor", () => {
  it("reserves a screenful by default, for the published site", () => {
    // A short published page should end in the site's own background rather
    // than in a strip of whatever is behind it.
    assert.match(sectionRuntimeCss(".xite-site-canvas"), /min-height:\s*100%/);
  });

  it("reserves nothing when the editor opts out", () => {
    // In the editor the canvas sits on the studio's white surface, so reserving
    // height paints a band of the *site's* dark background below the last
    // section — a rectangle with nothing in it, which reads as a section that
    // failed to load rather than as the end of the page.
    const css = sectionRuntimeCss(".xite-site-canvas", { fillViewport: false });
    assert.ok(!/min-height:\s*100%/.test(css), css.slice(0, 300));
  });

  it("keeps the background either way — the canvas is still the page", () => {
    for (const opts of [undefined, { fillViewport: false }]) {
      const css = sectionRuntimeCss(".xite-site-canvas", opts);
      assert.match(css, /background-color: var\(--xite-surface, #09090b\)/);
    }
  });
});

/**
 * The unit substitution.
 *
 * Every assertion here is about one fact: `vw` means the window, and on two of
 * the three surfaces the window is not the box the section is in.
 */
describe("viewportUnitsToContainer — one percent of what, exactly", () => {
  it("rewrites vw as cqw", () => {
    assert.equal(viewportUnitsToContainer("width: 40vw"), "width: 40cqw");
    assert.equal(viewportUnitsToContainer("padding: 3.5vw 1.2vw"), "padding: 3.5cqw 1.2cqw");
    assert.equal(viewportUnitsToContainer("margin-left: -2vw"), "margin-left: -2cqw");
    assert.equal(viewportUnitsToContainer("width: .5vw"), "width: .5cqw");
  });

  it("reaches inside clamp(), calc() and min()/max()", () => {
    // Which is where the library actually puts them: a header bar's padding is
    // `clamp(1rem, 3.5vw, 4rem)` far more often than a bare `3.5vw`.
    assert.equal(
      viewportUnitsToContainer("font-size: clamp(2.3rem, 3.4vw, 4rem)"),
      "font-size: clamp(2.3rem, 3.4cqw, 4rem)",
    );
    assert.equal(viewportUnitsToContainer("width: calc(100vw - 40px)"), "width: calc(100cqw - 40px)");
  });

  it("leaves vh, vmin and vmax alone", () => {
    // There is no container-relative height unit without `container-type:
    // size`, which needs a height the canvas does not have. `vh` still means
    // the window — which is what the published site gives a section anyway.
    assert.equal(viewportUnitsToContainer("height: 80vh"), "height: 80vh");
    assert.equal(viewportUnitsToContainer("font-size: 4vmin"), "font-size: 4vmin");
    assert.equal(viewportUnitsToContainer("width: 10vmax"), "width: 10vmax");
  });

  it("does not touch a word or an identifier that happens to contain it", () => {
    assert.equal(viewportUnitsToContainer("--nav-w: 5px"), "--nav-w: 5px");
    assert.equal(viewportUnitsToContainer("content: 'review'"), "content: 'review'");
    assert.equal(viewportUnitsToContainer("--x2vw: 3px"), "--x2vw: 3px");
  });

  it("round-trips exactly, which is what lets the canvas do it at render time", () => {
    const authored = "padding: clamp(0.75rem, 1.2vw, 1.5rem) clamp(1rem, 3.5vw, 4rem); height: 60vh";
    assert.equal(containerUnitsToViewport(viewportUnitsToContainer(authored)), authored);
  });
});

describe("mapInlineStyles — the other half of a section's CSS", () => {
  it("rewrites style attributes and nothing else", () => {
    const html = '<div style="width: 50vw">50vw of text</div>';
    assert.equal(
      mapInlineStyles(html, viewportUnitsToContainer),
      '<div style="width: 50cqw">50vw of text</div>',
    );
  });

  it("handles single quotes and several attributes", () => {
    const html = `<a href="#" style='padding: 2vw' class="x"><b style="gap:1vw">y</b></a>`;
    const out = mapInlineStyles(html, viewportUnitsToContainer);
    assert.ok(out.includes("padding: 2cqw"));
    assert.ok(out.includes("gap:1cqw"));
    assert.ok(out.includes('href="#"'), "an unrelated attribute was rewritten");
  });
});

/**
 * What is stored is what the author wrote.
 *
 * The canvas substitutes units on the way in; an edit reads markup back out of
 * that canvas. Without the inverse, correcting a typo would rewrite every
 * viewport unit in the section into a container unit — a silent migration of
 * the tenant's markup, performed by looking at it.
 */
describe("recomposeSectionCode — the units go back", () => {
  it("stores vw, however many times the section is edited", () => {
    const authored = `<style>.h{padding:1vw}</style><div style="width: 40vw">x</div>`;
    let stored = authored;
    for (let i = 0; i < 4; i++) {
      const onCanvas = sectionCanvasHtml(stored);
      const body = onCanvas.replace(/^<div class="section-canvas-box">/, "").replace(/<\/div>$/, "");
      stored = recomposeSectionCode(stored, body);
    }
    assert.ok(stored.includes('style="width: 40vw"'), stored);
    assert.ok(!stored.includes("cqw"), stored);
  });
});

/**
 * `@import`, and the semicolons inside a Google Fonts URL.
 *
 * `family=EB+Garamond:ital,wght@0,600;0,700;1,400` is the ordinary shape of a
 * multi-weight request, and the rule this replaced stopped at the first `;`.
 */
describe("extractCssImports — a URL is not over at its first semicolon", () => {
  const GOOGLE =
    "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,600;0,700;1,400&family=Open+Sans:wght@700;800&display=swap";

  it("takes the whole href", () => {
    const { hrefs } = extractCssImports(`@import url('${GOOGLE}');\n.a{color:red}`);
    assert.deepEqual(hrefs, [GOOGLE]);
  });

  it("leaves nothing of the rule behind", () => {
    // The tail of a truncated URL is a parse error, and a CSS parser recovers
    // from one by skipping to the end of the next block — so the section's
    // first rule went with it.
    const { css } = extractCssImports(`@import url('${GOOGLE}');\n.penn-header{position:relative}`);
    assert.ok(!css.includes("@import"), css);
    assert.ok(!css.includes("swap'"), css);
    assert.ok(css.includes(".penn-header{position:relative}"));
  });

  it("understands every form of the rule", () => {
    assert.deepEqual(extractCssImports(`@import "a.css";`).hrefs, ["a.css"]);
    assert.deepEqual(extractCssImports(`@import 'b.css';`).hrefs, ["b.css"]);
    assert.deepEqual(extractCssImports(`@import url(c.css);`).hrefs, ["c.css"]);
    assert.deepEqual(extractCssImports(`@import url("d.css") screen;`).hrefs, ["d.css"]);
  });

  it("returns each href once, and passes CSS with no import straight through", () => {
    assert.deepEqual(extractCssImports(`@import "a.css";@import "a.css";`).hrefs, ["a.css"]);
    assert.equal(extractCssImports(".a{color:red}").css, ".a{color:red}");
  });
});

/**
 * The Admin's iframe loads a section's webfont too.
 *
 * It used to place the `@import` after `sectionRuntimeCss` inside one
 * `<style>`, where the rule is not first in the sheet and is therefore ignored
 * — silently, because that is what ignoring an `@import` looks like. Every
 * section importing its own font was previewed in a fallback.
 */
describe("buildSectionPreviewDocument — the section's own font arrives", () => {
  it("hoists an @import to a <link>", () => {
    const doc = buildSectionPreviewDocument(
      `<style>@import url("https://fonts.googleapis.com/css2?family=X:wght@400;700&display=swap");h1{font-family:X}</style><h1>a</h1>`,
    );
    assert.ok(
      doc.includes(
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=X:wght@400;700&display=swap"/>',
      ),
      doc,
    );
    assert.ok(!doc.includes("@import"), "the inert @import was left in the stylesheet");
  });

  it("asks the container about viewport units, as the other two surfaces do", () => {
    const doc = buildSectionPreviewDocument(
      `<style>.a{padding:3.5vw}</style><div style="gap:2vw"></div>`,
    );
    assert.ok(doc.includes("padding:3.5cqw"), doc);
    assert.ok(doc.includes('style="gap:2cqw"'), doc);
  });
});

/**
 * Containment covers what Tailwind 4 says about every element.
 *
 * v4 zeroes margin and padding on the universal selector; v3 — which compiles
 * sections — does it element by element. So anything on neither of v3's lists
 * (an `<option>`, a `<td>`, a `<fieldset>`) kept its browser padding in the
 * Admin's iframe and lost it everywhere else.
 */
describe("sectionRuntimeCss — the universal preflight reset", () => {
  it("reverts margin and padding on every element inside the canvas", () => {
    const css = sectionRuntimeCss(".xite-site-canvas");
    assert.match(
      css,
      /:where\(\.xite-site-canvas\) :where\(\*\)[^{]*\{ margin: revert; padding: revert; \}/,
    );
  });

  it("carries no specificity, so a section's own CSS still wins", () => {
    // `:where()` on both halves. Without it the reset would start beating the
    // section's own `ul { padding: 0 }`, which is the opposite failure.
    const rule =
      sectionRuntimeCss(".xite-site-canvas")
        .split("\n")
        .find((line) => line.includes(":where(*)")) || "";
    assert.ok(rule.startsWith(":where(.xite-site-canvas) :where(*)"), rule);
    assert.ok(!rule.replace(/:where\([^)]*\)/g, "").includes(".xite-site-canvas"), rule);
  });

  it("emits nothing of the kind for the Admin's own document", () => {
    // In the iframe there is no host to contain.
    assert.ok(!sectionRuntimeCss(null).includes(":where(*)"));
  });
});
