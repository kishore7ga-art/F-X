import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cssEscape, rescopeSelector } from "@/lib/section-css-fence";

const FENCE = ':where([data-xite-section="sec-1"])';

/**
 * The rule that decides whether a section's own CSS reaches its own markup.
 *
 * These are unit tests rather than a rendering check because the failure they
 * cover is invisible in a rendering check: a selector that matches nothing
 * produces no error, no warning and no missing element — only a font, a colour
 * or a size that is quietly somebody else's.
 */
describe("rescopeSelector — a section's CSS, confined to that section", () => {
  it("makes an ordinary selector a descendant of the fence", () => {
    assert.equal(rescopeSelector(".title", FENCE), `${FENCE} .title`);
    assert.equal(rescopeSelector("nav a", FENCE), `${FENCE} nav a`);
    assert.equal(rescopeSelector("  h2  ", FENCE), `${FENCE} h2`);
  });

  it("maps the document's own selectors onto the fence itself", () => {
    // `fence :root` matches nothing: `:root` is <html>, and <html> is nobody's
    // descendant. Every custom property a section declared there was therefore
    // undefined on the live site, and every var() using one fell back to
    // whatever the canvas happened to be inheriting.
    for (const selector of [":root", "html", "body"]) {
      assert.equal(rescopeSelector(selector, FENCE), FENCE, `for ${selector}`);
    }
  });

  it("keeps whatever was attached to the document selector", () => {
    assert.equal(rescopeSelector("body.dark", FENCE), `${FENCE}.dark`);
    assert.equal(rescopeSelector(":root[data-theme]", FENCE), `${FENCE}[data-theme]`);
    assert.equal(rescopeSelector("html:not(.no-js)", FENCE), `${FENCE}:not(.no-js)`);
  });

  it("keeps a descendant of the document selector a descendant of the fence", () => {
    assert.equal(rescopeSelector(":root .title", FENCE), `${FENCE} .title`);
    assert.equal(rescopeSelector("body > main", FENCE), `${FENCE} > main`);
  });

  it("does not mistake a class or element that merely starts with a root name", () => {
    // The whole reason the match is anchored on a word boundary.
    assert.equal(rescopeSelector(".body-copy", FENCE), `${FENCE} .body-copy`);
    assert.equal(rescopeSelector("bodyguard", FENCE), `${FENCE} bodyguard`);
    assert.equal(rescopeSelector("#html-block", FENCE), `${FENCE} #html-block`);
  });

  it("leaves an empty selector alone rather than emitting a bare fence", () => {
    assert.equal(rescopeSelector("   ", FENCE), "");
  });
});

describe("cssEscape", () => {
  it("escapes what would end an attribute selector early", () => {
    assert.equal(cssEscape('a"b'), 'a\\"b');
    assert.equal(cssEscape("a\\b"), "a\\\\b");
  });

  it("leaves an ordinary id untouched", () => {
    assert.equal(cssEscape("sec-abc-123"), "sec-abc-123");
  });
});
