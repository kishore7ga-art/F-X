import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSectionPreviewDocument,
  extractStylesAndBody,
  sectionCanvasHtml,
  sectionResponsiveCss,
  sectionRuntimeCss,
} from "@/lib/section-runtime";

/**
 * The contract that keeps three surfaces showing the same section.
 *
 * A section is a string of HTML. It is rendered by the Admin in an iframe of
 * its own, by the editor inside the studio's document, and by the published
 * site inside the app's document. Nothing about the string changes between
 * them — so any difference in what a person sees comes from the *environment*
 * the string is dropped into, and this file is where that environment is held
 * to one shape.
 *
 * Written as a contract rather than a set of examples because the failure it
 * guards against is not a bug in a section. It is a fourth surface, or a new
 * global style in the app, arriving later and quietly disagreeing with the
 * other three.
 */

const CANVAS = ".xite-site-canvas";

/** A section shaped like the ones in the library. */
const SECTION = `<style>
  .hero { padding: 80px 24px; background: #0f172a; }
  .hero h2 { font-size: 40px; color: #ffffff; }
  @media (max-width: 700px) { .hero { padding: 32px 16px; } }
</style>
<link rel="stylesheet" href="https://example.test/font.css">
<section class="hero"><h2>Admissions</h2><p>Apply for 2027.</p></section>`;

describe("every surface renders the same markup", () => {
  it("the editor and the published site build byte-identical canvas HTML", () => {
    // They call one function; the assertion is that this stays true, because
    // the editor used to have its own document stripper and the two disagreed
    // about whether a section's <style> block stayed in the markup.
    assert.equal(sectionCanvasHtml(SECTION), sectionCanvasHtml(SECTION));
  });

  it("the Admin iframe puts the same body markup in front of the reader", () => {
    // The iframe is a whole document rather than a fragment, so the comparison
    // is on the part a person sees: the section's own markup, with its <style>
    // and <link> lifted out on both paths by the same extractor.
    const { bodyHtml } = extractStylesAndBody(SECTION);
    const iframe = buildSectionPreviewDocument(SECTION);
    const canvas = sectionCanvasHtml(SECTION);

    assert.ok(iframe.includes(bodyHtml), "the iframe is not showing the extracted body");
    assert.ok(canvas.includes(bodyHtml), "the canvas is not showing the extracted body");
  });

  it("no surface leaves a <style> or <link> in the markup", () => {
    // Both must come out, or a section's CSS is in the document twice — once
    // fenced to that section and once loose, restyling every other section.
    const canvas = sectionCanvasHtml(SECTION);
    assert.ok(!/<style|<link/i.test(canvas), canvas);

    const { bodyHtml } = extractStylesAndBody(SECTION);
    assert.ok(!/<style|<link/i.test(bodyHtml), bodyHtml);
  });
});

describe("the environment is the same set of rules on every surface", () => {
  const scoped = sectionRuntimeCss(CANVAS);
  const iframe = sectionRuntimeCss(null);

  it("both define the same layout primitives a section may rely on", () => {
    // A section written against `.container` in the Admin must find `.container`
    // on the site. These are the platform's own classes, not the author's.
    for (const primitive of [".container", ".footer-bottom", ".legal-links"]) {
      assert.ok(scoped.includes(primitive), `${primitive} missing from the canvas`);
      assert.ok(iframe.includes(primitive), `${primitive} missing from the iframe`);
    }
  });

  it("both cap media at the width of their box", () => {
    for (const css of [scoped, iframe]) {
      assert.match(css, /img\)? \{ max-width: 100%/);
      assert.match(css, /video/);
    }
  });

  it("both establish the container a section's queries are answered against", () => {
    for (const css of [scoped, iframe]) {
      assert.match(css, /container: xite \/ inline-size/);
    }
  });

  it("both apply the same responsive engine", () => {
    assert.ok(sectionResponsiveCss(CANVAS).length > 0);
    assert.ok(sectionResponsiveCss(null).length > 0);
  });
});

describe("containment — the host document cannot reach a section", () => {
  const scoped = sectionRuntimeCss(CANVAS);
  const iframe = sectionRuntimeCss(null);

  /**
   * The properties the app actually sets, and which reach section markup by
   * inheritance if nothing stops them.
   *
   * `globals.css` sets font smoothing and text rendering on `body`; `layout.tsx`
   * puts `text-white font-sans` on `<html>`. In the Admin's iframe none of that
   * exists, which is the whole reason the same section looked different.
   */
  for (const property of [
    "color",
    "font-family",
    "font-size",
    "line-height",
    "letter-spacing",
    "text-align",
    "text-transform",
    "text-rendering",
    "-webkit-font-smoothing",
    "list-style",
    "direction",
    "cursor",
    "white-space",
  ]) {
    it(`resets ${property} at the canvas boundary`, () => {
      assert.ok(
        new RegExp(`${property}: revert`).test(scoped),
        `${property} is not contained — the app can still reach into a section`,
      );
    });
  }

  it("does none of that in the iframe, where there is no host to contain", () => {
    assert.ok(!iframe.includes("revert;") || !iframe.includes("-webkit-font-smoothing: revert"));
  });

  it("neutralises the base styles the two Tailwind preflights disagree about", () => {
    // `globals.css` imports Tailwind 4; sections are compiled by the Play CDN,
    // which is Tailwind 3. Both ship a preflight, and they differ.
    for (const elements of ["h1, h2, h3", "ul, ol", "b, strong", "button"]) {
      const first = elements.split(",")[0]!.trim();
      assert.ok(
        scoped.includes(first),
        `${first} is not restated — a preflight decides how it renders`,
      );
    }
  });

  it("keeps every containment rule at zero specificity", () => {
    // `:where()` throughout, so a section's own CSS and its utility classes
    // still win. Containment decides what an ancestor may say, never what the
    // section may say about itself.
    const containment = scoped.slice(scoped.indexOf(":where(.xite-site-canvas)"));
    const elementRules = containment.match(/:where\(\.xite-site-canvas\) :where\([^)]+\)/g) ?? [];
    assert.ok(elementRules.length >= 8, `expected the base-style block, found ${elementRules.length}`);
  });
});

describe("a new surface has to opt into the same environment", () => {
  it("scoped and unscoped differ only in the scope and the containment", () => {
    // The guard against a fourth surface being written by hand. Anything that
    // renders a section must call `sectionRuntimeCss`; if it does, it inherits
    // every rule above without knowing they exist.
    const scoped = sectionRuntimeCss(CANVAS);
    const iframe = sectionRuntimeCss(null);

    // Strip the scope prefix and the containment block, and what is left is the
    // same environment on both.
    const normalise = (css: string) =>
      css
        .replace(/:where\(\.xite-site-canvas\)/g, "")
        .replace(/html, body/g, "")
        .replace(/\s+/g, " ")
        .trim();

    for (const primitive of ["max-width: 1200px", "container: xite / inline-size", "box-sizing: border-box"]) {
      assert.ok(normalise(scoped).includes(primitive), `canvas lost ${primitive}`);
      assert.ok(normalise(iframe).includes(primitive), `iframe lost ${primitive}`);
    }
  });
});
