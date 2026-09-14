import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getUniqueSectionName } from "./unique-name";

describe("getUniqueSectionName (xite-F)", () => {
  it("returns original title when no conflicts exist on page", () => {
    assert.equal(getUniqueSectionName("Hero", []), "Hero");
    assert.equal(getUniqueSectionName("About Us", ["Navbar", "Footer"]), "About Us");
  });

  it("appends 2 when exact duplicate title exists", () => {
    assert.equal(getUniqueSectionName("About Us", ["About Us"]), "About Us 2");
    assert.equal(getUniqueSectionName("about us", ["About Us"]), "about us 2");
  });

  it("increments to 3 when About Us and About Us 2 exist", () => {
    assert.equal(getUniqueSectionName("About Us", ["About Us", "About Us 2"]), "About Us 3");
  });

  it("handles empty or whitespace strings", () => {
    assert.equal(getUniqueSectionName("", []), "Section 1");
    assert.equal(getUniqueSectionName("  ", ["Section 1"]), "Section 2");
  });
});
