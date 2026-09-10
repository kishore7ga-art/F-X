import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classify, elementId, parseElementId } from "./element-resolver";

describe("element ids", () => {
  it("round-trips a section id and a path", () => {
    assert.equal(elementId("sec_1", "0/3/1"), "sec_1::0/3/1");
    assert.deepEqual(parseElementId("sec_1::0/3/1"), { sectionId: "sec_1", path: "0/3/1" });
    assert.deepEqual(parseElementId("sec_1::"), { sectionId: "sec_1", path: "" });
    assert.equal(parseElementId("no-separator"), null);
  });
});

describe("classification by tag and class", () => {
  it("recognises buttons", () => {
    assert.ok(classify.isButtonLike("button", "", null, null));
    assert.ok(classify.isButtonLike("div", "", "button", null));
    assert.ok(classify.isButtonLike("input", "", null, "submit"));
    assert.ok(classify.isButtonLike("a", "inline-flex btn-primary", null, null));
    assert.ok(classify.isButtonLike("a", "apply-now", null, null));
    assert.ok(!classify.isButtonLike("a", "nav-link", null, null));
    assert.ok(!classify.isButtonLike("input", "", null, "text"));
  });

  it("recognises text tags", () => {
    for (const tag of ["h1", "h6", "p", "span", "li", "blockquote"]) assert.ok(classify.isTextTag(tag), tag);
    for (const tag of ["div", "section", "img", "a"]) assert.ok(!classify.isTextTag(tag), tag);
  });

  it("recognises cards", () => {
    assert.ok(classify.isCardLike("div", "card", false));
    assert.ok(classify.isCardLike("div", "rounded-xl program-card", false));
    assert.ok(classify.isCardLike("div", "", true));
    assert.ok(classify.isCardLike("article", "", false));
    assert.ok(!classify.isCardLike("div", "grid gap-4", false));
  });
});
