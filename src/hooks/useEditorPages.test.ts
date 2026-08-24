import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { EditorPage, EditorSection } from "@/lib/editor-api";
import { canonicalSlug, reducer, type EditorState } from "@/hooks/useEditorPages";

const section = (id: string, over: Partial<EditorSection> = {}): EditorSection => ({
  id,
  title: id,
  category: "hero",
  templateId: null,
  variantIndex: 0,
  code: `<section>${id}</section>`,
  ...over,
});

const apiPage = (slug: string, sections: EditorSection[]): EditorPage => ({
  id: `page-${slug.replace(/^\//, "")}`,
  slug,
  title: slug,
  sections,
});

/** A booted store, so each test starts from a realistic state. */
function boot(pages: EditorPage[], active = "/home"): EditorState {
  const empty: EditorState = {
    pages: {},
    order: [],
    activePageId: active,
    activeSectionIndex: null,
    history: {},
    future: {},
    booting: true,
  };
  return reducer(empty, { type: "boot", pages, activePageId: active });
}

describe("canonicalSlug — one page, one key", () => {
  it("collapses every spelling to the same key", () => {
    for (const spelling of ["/about", "about", "//about//", "  About  "]) {
      assert.equal(canonicalSlug(spelling), "/about", `for ${JSON.stringify(spelling)}`);
    }
  });

  it("is empty for nothing", () => {
    assert.equal(canonicalSlug(""), "");
    assert.equal(canonicalSlug("/"), "");
    assert.equal(canonicalSlug(null), "");
  });
});

describe("boot", () => {
  it("keeps each page's sections on that page", () => {
    const state = boot([
      apiPage("/home", [section("home-hero")]),
      apiPage("/about", [section("about-hero")]),
    ]);
    assert.deepEqual(state.pages["/home"]!.sections.map((s) => s.id), ["home-hero"]);
    assert.deepEqual(state.pages["/about"]!.sections.map((s) => s.id), ["about-hero"]);
  });

  it("creates the requested page as unloaded when the config has never heard of it", () => {
    const state = boot([apiPage("/home", [section("a")])], "/admissions");
    assert.equal(state.pages["/admissions"]!.status, "unloaded");
    assert.deepEqual(state.pages["/admissions"]!.sections, []);
    // Unloaded, not ready: the loader has to be able to tell "seed me" from
    // "I am genuinely empty".
    assert.equal(state.pages["/admissions"]!.fresh, false);
  });
});

describe("editing one page never touches another", () => {
  it("a mutation for /about leaves /home byte-identical", () => {
    const state = boot([
      apiPage("/home", [section("home-1"), section("home-2")]),
      apiPage("/about", [section("about-1")]),
    ]);
    const homeBefore = state.pages["/home"]!.sections;

    const next = reducer(state, {
      type: "setSections",
      pageId: "/about",
      sections: [section("about-1"), section("about-2")],
      record: true,
    });

    // Same array reference: not merely equal, untouched.
    assert.equal(next.pages["/home"]!.sections, homeBefore);
    assert.equal(next.pages["/home"]!.dirty, false);
    assert.deepEqual(next.pages["/about"]!.sections.map((s) => s.id), ["about-1", "about-2"]);
  });

  it("a mutation still lands on its own page after the active page has moved on", () => {
    // The reported bug in miniature: the user edits Home and switches to About
    // before the dispatch is applied. Because the action names its page, the
    // edit lands on Home. The old code read "the current page" at apply time
    // and wrote Home's sections into About.
    let state = boot([
      apiPage("/home", [section("home-1")]),
      apiPage("/about", [section("about-1")]),
    ]);
    state = reducer(state, { type: "selectPage", pageId: "/about" });
    state = reducer(state, {
      type: "setSections",
      pageId: "/home",
      sections: [section("home-1"), section("home-2")],
      record: true,
    });

    assert.deepEqual(state.pages["/home"]!.sections.map((s) => s.id), ["home-1", "home-2"]);
    assert.deepEqual(state.pages["/about"]!.sections.map((s) => s.id), ["about-1"]);
  });

  it("switching pages does not copy, clear or mark anything dirty", () => {
    const state = boot([
      apiPage("/home", [section("home-1")]),
      apiPage("/about", [section("about-1")]),
    ]);
    const next = reducer(state, { type: "selectPage", pageId: "/about" });

    assert.equal(next.pages["/home"]!.sections, state.pages["/home"]!.sections);
    assert.equal(next.pages["/home"]!.dirty, false);
    assert.equal(next.pages["/about"]!.dirty, false);
    assert.equal(next.activePageId, "/about");
  });

  it("a page loaded slowly does not overwrite what the user typed meanwhile", () => {
    let state = boot([apiPage("/home", [section("a")])], "/about");
    state = reducer(state, {
      type: "setSections",
      pageId: "/about",
      sections: [section("typed-by-user")],
      record: true,
    });
    // The request that was already in flight when the user started typing.
    state = reducer(state, {
      type: "pageLoaded",
      pageId: "/about",
      page: apiPage("/about", [section("from-the-server")]),
    });

    assert.deepEqual(state.pages["/about"]!.sections.map((s) => s.id), ["typed-by-user"]);
  });
});

describe("a new page opens empty", () => {
  it("is marked fresh, so the loader will not seed it from the platform default", () => {
    let state = boot([apiPage("/home", [section("home-1")])]);
    state = reducer(state, { type: "createPage", pageId: "/admissions", title: "Admissions" });

    const page = state.pages["/admissions"]!;
    assert.equal(page.fresh, true);
    assert.equal(page.status, "ready");
    assert.deepEqual(page.sections, []);
    assert.equal(state.activePageId, "/admissions");
    assert.equal(state.activeSectionIndex, null);
  });

  it("stops being fresh the moment it holds a section", () => {
    let state = boot([apiPage("/home", [])]);
    state = reducer(state, { type: "createPage", pageId: "/admissions", title: "Admissions" });
    state = reducer(state, {
      type: "setSections",
      pageId: "/admissions",
      sections: [section("first")],
      record: true,
    });
    assert.equal(state.pages["/admissions"]!.fresh, false);
  });
});

describe("saving", () => {
  const base = () =>
    reducer(boot([apiPage("/home", [section("a")])]), {
      type: "setSections",
      pageId: "/home",
      sections: [section("a"), section("b")],
      record: true,
    });

  it("clears dirty when nothing changed during the round trip", () => {
    const state = base();
    const snapshot = state.pages["/home"]!.sections;
    const next = reducer(state, {
      type: "markSaved",
      pageId: "/home",
      snapshot,
      page: apiPage("/home", snapshot),
    });
    assert.equal(next.pages["/home"]!.dirty, false);
  });

  it("keeps the page dirty when the user typed during the round trip", () => {
    // Otherwise the last keystroke before a refresh is lost: the save clears
    // the flag, the debounce never fires again, and the edit is never sent.
    let state = base();
    const snapshot = state.pages["/home"]!.sections;

    state = reducer(state, {
      type: "setSections",
      pageId: "/home",
      sections: [section("a"), section("b"), section("c")],
      record: false,
    });
    state = reducer(state, {
      type: "markSaved",
      pageId: "/home",
      snapshot,
      page: apiPage("/home", snapshot),
    });

    assert.equal(state.pages["/home"]!.dirty, true);
    assert.deepEqual(state.pages["/home"]!.sections.map((s) => s.id), ["a", "b", "c"]);
  });

  it("surfaces a save failure instead of swallowing it", () => {
    const next = reducer(base(), { type: "saveFailed", pageId: "/home", message: "503" });
    assert.equal(next.pages["/home"]!.error, "503");
    // Still dirty, so the queue retries rather than treating the loss as saved.
    assert.equal(next.pages["/home"]!.dirty, true);
  });
});

describe("reordering", () => {
  it("applies the server's order but keeps the local markup", () => {
    // A reorder request and an inline text edit can overlap. The response
    // carries the order, which is authoritative; the code it carries is older
    // than whatever the user has just typed.
    let state = boot([apiPage("/home", [section("a"), section("b")])]);
    state = reducer(state, {
      type: "setSections",
      pageId: "/home",
      sections: [section("a", { code: "<section>edited</section>" }), section("b")],
      record: false,
    });
    state = reducer(state, {
      type: "orderSaved",
      pageId: "/home",
      sections: [section("b"), section("a")],
    });

    assert.deepEqual(state.pages["/home"]!.sections.map((s) => s.id), ["b", "a"]);
    assert.equal(state.pages["/home"]!.sections[1]!.code, "<section>edited</section>");
  });

  it("never clears dirty, because a reorder does not carry the text edits", () => {
    let state = reducer(boot([apiPage("/home", [section("a"), section("b")])]), {
      type: "setSections",
      pageId: "/home",
      sections: [section("a", { code: "<section>edited</section>" }), section("b")],
      record: true,
    });
    state = reducer(state, {
      type: "orderSaved",
      pageId: "/home",
      sections: [section("b"), section("a")],
    });
    assert.equal(state.pages["/home"]!.dirty, true);
  });
});

describe("undo and redo are per page", () => {
  it("undoing after a page switch does not apply another page's history", () => {
    // Two shared arrays used to hold this for every page at once, so an undo
    // after switching pages pasted the previous page's sections onto this one.
    let state = boot([
      apiPage("/home", [section("home-1")]),
      apiPage("/about", [section("about-1")]),
    ]);

    state = reducer(state, {
      type: "setSections",
      pageId: "/home",
      sections: [section("home-1"), section("home-2")],
      record: true,
    });
    state = reducer(state, { type: "selectPage", pageId: "/about" });
    state = reducer(state, {
      type: "setSections",
      pageId: "/about",
      sections: [section("about-1"), section("about-2")],
      record: true,
    });
    state = reducer(state, { type: "undo", pageId: "/about" });

    assert.deepEqual(state.pages["/about"]!.sections.map((s) => s.id), ["about-1"]);
    // Home's own edit and its own history are untouched.
    assert.deepEqual(state.pages["/home"]!.sections.map((s) => s.id), ["home-1", "home-2"]);
    assert.equal(state.history["/home"]!.length, 1);
  });

  it("redo puts back exactly what undo removed", () => {
    let state = boot([apiPage("/home", [section("a")])]);
    state = reducer(state, {
      type: "setSections",
      pageId: "/home",
      sections: [section("a"), section("b")],
      record: true,
    });
    state = reducer(state, { type: "undo", pageId: "/home" });
    assert.deepEqual(state.pages["/home"]!.sections.map((s) => s.id), ["a"]);
    state = reducer(state, { type: "redo", pageId: "/home" });
    assert.deepEqual(state.pages["/home"]!.sections.map((s) => s.id), ["a", "b"]);
  });

  it("does nothing at the ends of the stacks rather than throwing", () => {
    const state = boot([apiPage("/home", [section("a")])]);
    assert.equal(reducer(state, { type: "undo", pageId: "/home" }), state);
    assert.equal(reducer(state, { type: "redo", pageId: "/home" }), state);
  });

  it("keeps the selection inside the list after an undo shortens it", () => {
    let state = boot([apiPage("/home", [section("a")])]);
    state = reducer(state, {
      type: "setSections",
      pageId: "/home",
      sections: [section("a"), section("b"), section("c")],
      record: true,
    });
    state = reducer(state, { type: "selectSection", index: 2 });
    state = reducer(state, { type: "undo", pageId: "/home" });
    assert.equal(state.activeSectionIndex, 0);
  });
});

describe("removing a page", () => {
  it("drops it and moves the selection somewhere that exists", () => {
    let state = boot([
      apiPage("/home", [section("home-1")]),
      apiPage("/about", [section("about-1")]),
    ]);
    state = reducer(state, { type: "selectPage", pageId: "/about" });
    state = reducer(state, { type: "removePage", pageId: "/about" });

    assert.equal(state.pages["/about"], undefined);
    assert.ok(!state.order.includes("/about"));
    assert.equal(state.activePageId, "/home");
    assert.equal(state.activeSectionIndex, 0);
  });
});
