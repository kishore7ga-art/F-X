import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { findTextEditableElement, colorToHex } from "./useCanvaInteractions";

describe("findTextEditableElement & text editing interactions", () => {
  it("rejects structural layout containers so clicking sections does not trigger text editing", () => {
    const sectionEl = {
      tagName: "SECTION",
      children: [{ tagName: "DIV" }],
      textContent: "Section Content",
      closest: () => null,
    } as unknown as HTMLElement;

    assert.equal(findTextEditableElement(sectionEl), null);

    const containerDiv = {
      tagName: "DIV",
      children: [{ tagName: "H1" }, { tagName: "P" }],
      textContent: "Card with children",
      closest: () => null,
    } as unknown as HTMLElement;

    assert.equal(findTextEditableElement(containerDiv), null);
  });

  it("identifies direct text elements such as headings, paragraphs, and spans", () => {
    const heading = {
      tagName: "H1",
      children: [],
      textContent: "Hero Title",
      closest: (selector: string) => (selector.includes("h1") ? heading : null),
    } as unknown as HTMLElement;

    assert.equal(findTextEditableElement(heading), heading);

    const paragraph = {
      tagName: "P",
      children: [],
      textContent: "Subtitle description",
      closest: (selector: string) => (selector.includes("p") ? paragraph : null),
    } as unknown as HTMLElement;

    assert.equal(findTextEditableElement(paragraph), paragraph);
  });

  it("colorToHex correctly translates colors", () => {
    assert.equal(colorToHex("#fff"), "#ffffff");
    assert.equal(colorToHex("#2563eb"), "#2563eb");
    assert.equal(colorToHex("rgb(37, 99, 235)"), "#2563eb");
    assert.equal(colorToHex("white"), "#ffffff");
    assert.equal(colorToHex("red"), "#ef4444");
  });
});
