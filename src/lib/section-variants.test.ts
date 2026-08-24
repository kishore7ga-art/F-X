import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { EditorSection, LibrarySection, SectionLibrary } from "@/lib/editor-api";
import {
  canMove,
  currentVariantIndex,
  moveSection,
  placementIndex,
  sectionFromTemplate,
  swapVariant,
  variantsFor,
} from "@/lib/section-variants";

const template = (id: string, category: string, name = id): LibrarySection => ({
  id,
  name,
  category: category as LibrarySection["category"],
  description: null,
  thumbnailUrl: null,
  code: `<section data-tpl="${id}">${name}</section>`,
});

function libraryOf(...templates: LibrarySection[]): SectionLibrary {
  const byCategory: Record<string, LibrarySection[]> = {};
  templates.forEach((t) => {
    (byCategory[t.category] ??= []).push(t);
  });
  return { sections: templates, byCategory };
}

const section = (over: Partial<EditorSection> = {}): EditorSection => ({
  id: "sec-1",
  title: "Hero",
  category: "hero",
  templateId: null,
  variantIndex: 0,
  code: "<section>authored</section>",
  ...over,
});

/* ── The swap cycle ─────────────────────────────────────────────────────── */

describe("variantsFor — what a section may swap between", () => {
  it("offers every template of its own category, and none of another's", () => {
    const library = libraryOf(
      template("h1", "hero"),
      template("h2", "hero"),
      template("c1", "contact"),
    );
    const variants = variantsFor(section({ templateId: "h1" }), library);
    assert.deepEqual(variants.map((v) => v.templateId), ["h1", "h2"]);
  });

  it("includes the section's own markup when it is not a library template", () => {
    const library = libraryOf(template("h1", "hero"), template("h2", "hero"));
    const variants = variantsFor(section({ templateId: null }), library);
    // First, so swapping forward all the way returns to what the user started
    // with rather than stranding it.
    assert.equal(variants[0]?.templateId, null);
    assert.deepEqual(variants.map((v) => v.templateId), [null, "h1", "h2"]);
  });

  it("does not duplicate a section that IS showing a library template", () => {
    const library = libraryOf(template("h1", "hero"), template("h2", "hero"));
    const variants = variantsFor(section({ templateId: "h2" }), library);
    assert.deepEqual(variants.map((v) => v.templateId), ["h1", "h2"]);
  });

  it("keeps an uncategorised section out of every cycle", () => {
    // Otherwise a college's one-off hand-written block joins a cycle with every
    // other unrelated one-off on the platform.
    const library = libraryOf(template("x1", "custom"), template("x2", "custom"));
    const variants = variantsFor(section({ category: "custom" }), library);
    assert.equal(variants.length, 1);
    assert.equal(variants[0]?.templateId, null);
  });

  it("offers nothing for a category the library does not cover", () => {
    const variants = variantsFor(section({ category: "research", code: "" }), libraryOf());
    assert.deepEqual(variants, []);
  });
});

describe("currentVariantIndex — identity survives editing", () => {
  it("finds the section by templateId, not by comparing markup", () => {
    const library = libraryOf(template("h1", "hero"), template("h2", "hero"), template("h3", "hero"));
    // The user typed into it, so `code` no longer equals any template's. The
    // old implementation compared exactly this and got -1.
    const edited = section({ templateId: "h2", code: "<section>the user typed here</section>" });
    assert.equal(currentVariantIndex(edited, variantsFor(edited, library)), 1);
  });
});

describe("swapVariant — one press, one step", () => {
  const library = libraryOf(template("h1", "hero"), template("h2", "hero"), template("h3", "hero"));

  it("advances one place and reports where it landed", () => {
    const result = swapVariant(section({ templateId: "h1" }), library);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.section.templateId, "h2");
    assert.equal(result.position, 2);
    assert.equal(result.total, 3);
  });

  it("wraps from the last back to the first", () => {
    const result = swapVariant(section({ templateId: "h3" }), library);
    assert.equal(result.ok && result.section.templateId, "h1");
  });

  it("goes backwards, so overshooting is recoverable", () => {
    const result = swapVariant(section({ templateId: "h2" }), library, -1);
    assert.equal(result.ok && result.section.templateId, "h1");
    const wrapped = swapVariant(section({ templateId: "h1" }), library, -1);
    assert.equal(wrapped.ok && wrapped.section.templateId, "h3");
  });

  it("advances by one from an EDITED section instead of jumping to the first", () => {
    // The reported bug: swapping a section the user had typed into snapped back
    // to variant 1 and discarded their edit, because the markup comparison that
    // located the current variant returned -1 and the code fell back to index 0.
    const edited = section({ templateId: "h2", code: "<section>edited by the user</section>" });
    const result = swapVariant(edited, library);
    assert.equal(result.ok && result.section.templateId, "h3");
  });

  it("visits every variant exactly once before repeating", () => {
    let current = section({ templateId: "h1" });
    const seen: (string | null)[] = ["h1"];
    for (let i = 0; i < 3; i++) {
      const result = swapVariant(current, library);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      current = result.section;
      seen.push(current.templateId);
    }
    assert.deepEqual(seen, ["h1", "h2", "h3", "h1"]);
  });

  it("keeps the section's id, so the selection and any pending reorder survive", () => {
    const result = swapVariant(section({ id: "keep-me", templateId: "h1" }), library);
    assert.equal(result.ok && result.section.id, "keep-me");
  });

  it("says which kind of nothing happened", () => {
    const empty = swapVariant(section({ category: "research", code: "" }), libraryOf());
    assert.deepEqual(empty, { ok: false, reason: "no-variants", total: 0 });

    const single = swapVariant(section({ templateId: "only" }), libraryOf(template("only", "hero")));
    assert.equal(single.ok, false);
    assert.equal(!single.ok && single.reason, "single-variant");
  });
});

describe("sectionFromTemplate", () => {
  it("records which template it came from, so it can swap from the start", () => {
    const made = sectionFromTemplate(template("h7", "hero", "Split Hero"), "sec-new");
    assert.equal(made.id, "sec-new");
    assert.equal(made.templateId, "h7");
    assert.equal(made.category, "hero");
    assert.equal(made.title, "Split Hero");
  });
});

/* ── Placement and reordering ───────────────────────────────────────────── */

const nav = section({ id: "nav", category: "navbar" });
const hero = section({ id: "hero", category: "hero" });
const about = section({ id: "about", category: "about" });
const foot = section({ id: "foot", category: "footer" });

describe("placementIndex — where a new section lands", () => {
  it("puts a navbar first and a footer last, whatever was asked for", () => {
    const page = [nav, hero, about, foot];
    assert.equal(placementIndex(page, "navbar", 3), 0);
    assert.equal(placementIndex(page, "footer", 1), page.length);
  });

  it("honours the slot the user pressed", () => {
    assert.equal(placementIndex([nav, hero, about, foot], "courses", 2), 2);
  });

  it("will not let an explicit slot go above the navbar or below the footer", () => {
    const page = [nav, hero, about, foot];
    assert.equal(placementIndex(page, "courses", 0), 1);
    assert.equal(placementIndex(page, "courses", 99), 3);
  });

  it("defaults to just above the footer when no slot was named", () => {
    assert.equal(placementIndex([nav, hero, foot], "courses", null), 2);
    assert.equal(placementIndex([nav, hero], "courses", null), 2);
  });
});

describe("canMove / moveSection — the reorder rules", () => {
  it("moves an ordinary section either way", () => {
    const page = [nav, hero, about, foot];
    assert.deepEqual(moveSection(page, 2, -1).map((s) => s.id), ["nav", "about", "hero", "foot"]);
    assert.deepEqual(moveSection(page, 1, 1).map((s) => s.id), ["nav", "about", "hero", "foot"]);
  });

  it("will not move the navbar or the footer", () => {
    const page = [nav, hero, about, foot];
    assert.equal(canMove(page, 0, 1), false);
    assert.equal(canMove(page, 3, -1), false);
  });

  it("will not move an ordinary section past the navbar or the footer", () => {
    const page = [nav, hero, about, foot];
    assert.equal(canMove(page, 1, -1), false);
    assert.equal(canMove(page, 2, 1), false);
  });

  it("moves the FIRST section up on a page with no navbar", () => {
    // The old guard refused this on every page, because it tested the index
    // rather than what was at it: `targetIndex <= 1` blocked moving section 1
    // even when section 0 was ordinary content.
    const page = [hero, about, foot];
    assert.equal(canMove(page, 1, -1), true);
    assert.deepEqual(moveSection(page, 1, -1).map((s) => s.id), ["about", "hero", "foot"]);
  });

  it("moves the last section down on a page with no footer", () => {
    const page = [nav, hero, about];
    assert.equal(canMove(page, 1, 1), true);
    assert.deepEqual(moveSection(page, 1, 1).map((s) => s.id), ["nav", "about", "hero"]);
  });

  it("refuses to move off either end, and returns the same array so nothing saves", () => {
    const page = [hero, about];
    assert.equal(moveSection(page, 0, -1), page);
    assert.equal(moveSection(page, 1, 1), page);
    assert.equal(moveSection(page, 5, 1), page);
  });

  it("never loses or duplicates a section", () => {
    const page = [nav, hero, about, foot];
    const moved = moveSection(page, 1, 1);
    assert.equal(moved.length, page.length);
    assert.deepEqual([...moved].map((s) => s.id).sort(), [...page].map((s) => s.id).sort());
  });
});
