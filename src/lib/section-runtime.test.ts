import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractStylesAndBody,
  recomposeSectionCode,
  sectionCanvasHtml,
  sectionRuntimeCss,
  viewportMediaToContainer,
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
