import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  absolutiseUploadUrls,
  buildSectionPreviewDocument,
  collectSectionRefs,
  recomposeSectionCode,
  scopeSectionRefs,
  sectionCanvasHtml,
  sectionRefSuffix,
  unscopeSectionRefs,
} from "./section-runtime";
import { buildSectionRuntimeStylesheet } from "./section-runtime-stylesheet";

/**
 * SVG ids and keyframe names, made one section's own.
 *
 * The Admin shows one section per iframe; the site shows a whole page in one
 * document. `url(#blob)` in the second is whichever `#blob` comes first, so an
 * About photo can be clipped by a team card's avatar mask — to nothing. These
 * pin the transform that stops it, and the inverse that keeps the stored
 * markup exactly as authored.
 */

const BLOB = `<style>
  .frame .photo { clip-path: url(#blob-clip); animation: blob-in 900ms both; }
  .frame .photo:hover { animation-name: blob-in; }
  @keyframes blob-in { from { opacity: 0 } to { opacity: 1 } }
  @-webkit-keyframes blob-in { from { opacity: 0 } to { opacity: 1 } }
</style>
<section id="about" class="frame">
  <a href="#contact">Contact</a>
  <svg width="0" height="0"><defs><clipPath id="blob-clip"><path d="M0 0h1v1z"/></clipPath><linearGradient id="fade"><stop/></linearGradient></defs></svg>
  <div class="photo" style="clip-path: url('#blob-clip'); animation: blob-in 1s"><img src="/uploads/a.jpg"></div>
  <svg viewBox="0 0 10 10"><use href="#icon-star"/><path fill="url(#fade)" d="M0 0"/><symbol id="icon-star"><path d="M1 1"/></symbol></svg>
</section>`;

describe("collectSectionRefs", () => {
  it("finds ids inside svg, and keyframe names, and nothing else", () => {
    const refs = collectSectionRefs(BLOB);
    assert.deepEqual(refs.ids.sort(), ["blob-clip", "fade", "icon-star"]);
    assert.deepEqual(refs.keyframes, ["blob-in"]);
  });

  it("copes with nested svg and an unclosed one", () => {
    assert.deepEqual(collectSectionRefs('<svg><svg><g id="inner"/></svg><g id="outer"/></svg>').ids.sort(), ["inner", "outer"]);
    assert.deepEqual(collectSectionRefs('<svg><clipPath id="open">').ids, ["open"]);
  });
});

describe("scopeSectionRefs", () => {
  const suffix = sectionRefSuffix("sec-1757000000000-ab1c2");
  const refs = collectSectionRefs(BLOB);
  const out = scopeSectionRefs(BLOB, refs, suffix);

  it("suffixes the definitions and every reference", () => {
    assert.ok(out.includes(`<clipPath id="blob-clip${suffix}">`));
    assert.ok(out.includes(`clip-path: url(#blob-clip${suffix})`));
    assert.ok(out.includes(`clip-path: url('#blob-clip${suffix}')`));
    assert.ok(out.includes(`<use href="#icon-star${suffix}"/>`));
    assert.ok(out.includes(`fill="url(#fade${suffix})"`));
    assert.ok(out.includes(`@keyframes blob-in${suffix} {`));
    assert.ok(out.includes(`@-webkit-keyframes blob-in${suffix} {`));
    assert.ok(out.includes(`animation: blob-in${suffix} 900ms both`));
    assert.ok(out.includes(`animation-name: blob-in${suffix};`));
    assert.ok(out.includes(`animation: blob-in${suffix} 1s"`));
  });

  it("leaves html ids and navigation anchors alone", () => {
    assert.ok(out.includes('<section id="about"'));
    assert.ok(out.includes('<a href="#contact">'));
  });

  it("does not rename a class that shares a keyframe's name", () => {
    const css = ".blob-in { color: red } .x { animation: blob-in 1s }";
    const scoped = scopeSectionRefs(css, { ids: [], keyframes: ["blob-in"] }, suffix);
    assert.ok(scoped.startsWith(".blob-in { color: red }"));
    assert.ok(scoped.includes(`animation: blob-in${suffix} 1s`));
  });

  it("is a no-op with nothing to scope, and safe to apply twice", () => {
    assert.equal(scopeSectionRefs("<p>hi</p>", { ids: [], keyframes: [] }, suffix), "<p>hi</p>");
    assert.equal(scopeSectionRefs(out, refs, suffix), out);
  });

  it("round-trips: what is read back out of the canvas is what was authored", () => {
    assert.equal(unscopeSectionRefs(out), BLOB);
    const stored = recomposeSectionCode(BLOB, out.replace(/<style>[\s\S]*?<\/style>\s*/, ""));
    assert.ok(!stored.includes("__xs_"));
    assert.ok(stored.includes('clip-path: url(#blob-clip)'));
  });
});

describe("the three surfaces agree on the scoped names", () => {
  it("canvas markup and the fenced stylesheet use the same suffix", () => {
    const id = "sec-42";
    const html = sectionCanvasHtml(BLOB, id);
    const { css } = buildSectionRuntimeStylesheet({ sections: [{ id, code: BLOB }], scope: ".c" });
    const suffix = sectionRefSuffix(id);
    assert.ok(html.includes(`id="blob-clip${suffix}"`));
    assert.ok(css.includes(`url(#blob-clip${suffix})`));
    assert.ok(css.includes(`@keyframes blob-in${suffix}`));
    assert.ok(!html.includes("<style"));
  });

  it("two sections with the same clip id no longer share it", () => {
    const a = sectionCanvasHtml(BLOB, "sec-a");
    const b = sectionCanvasHtml(BLOB, "sec-b");
    const idOf = (html: string) => /clipPath id="([^"]+)"/.exec(html)![1];
    assert.notEqual(idOf(a), idOf(b));
  });

  it("the Admin preview applies the same transform", () => {
    const doc = buildSectionPreviewDocument(BLOB);
    const suffix = sectionRefSuffix("preview");
    assert.ok(doc.includes(`id="blob-clip${suffix}"`));
    assert.ok(doc.includes(`url(#blob-clip${suffix})`));
    assert.ok(doc.includes(`@keyframes blob-in${suffix}`));
  });
});

describe("absolutiseUploadUrls", () => {
  it("prefixes API-relative uploads and leaves everything else", () => {
    const html = `<img src="/uploads/a.jpg" srcset="/uploads/a@2x.jpg 2x"><div style="background: url('/uploads/b.png')"></div><a href="/uploads/c.pdf">c</a><img src="https://x.test/uploads/d.jpg">`;
    const out = absolutiseUploadUrls(html, "https://api.test/");
    assert.equal(
      out,
      `<img src="https://api.test/uploads/a.jpg" srcset="https://api.test/uploads/a@2x.jpg 2x"><div style="background: url('https://api.test/uploads/b.png')"></div><a href="https://api.test/uploads/c.pdf">c</a><img src="https://x.test/uploads/d.jpg">`,
    );
    assert.equal(absolutiseUploadUrls(html, ""), html);
    assert.ok(buildSectionPreviewDocument('<img src="/uploads/a.jpg">', { assetBase: "https://api.test" }).includes('src="https://api.test/uploads/a.jpg"'));
  });
});
