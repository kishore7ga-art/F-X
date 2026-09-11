import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isExternalLink, linkTarget } from "./link-target";

describe("link-target — the link decides where it opens", () => {
  it("opens another site in a new tab", () => {
    assert.equal(linkTarget("https://example.com/apply"), "_blank");
    assert.equal(linkTarget("http://example.com"), "_blank");
    assert.equal(linkTarget("  HTTPS://EXAMPLE.COM "), "_blank");
    assert.equal(linkTarget("//cdn.example.com/form"), "_blank");
  });

  it("navigates in place for a page of this site", () => {
    assert.equal(linkTarget("/admissions"), null);
    assert.equal(linkTarget("#contact"), null);
    assert.equal(linkTarget("about.html"), null);
    assert.equal(linkTarget("?tab=fees"), null);
    assert.equal(linkTarget(""), null);
  });

  it("gives mailto and tel no target", () => {
    assert.equal(isExternalLink("mailto:admissions@example.edu"), false);
    assert.equal(isExternalLink("tel:+911234567890"), false);
  });
});
