import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canonicalPageSlug,
  findPage,
  homePage,
  isHomeSlug,
  pickPages,
  pickSections,
} from "@/lib/site-sections";

describe("canonicalPageSlug — one page, one address", () => {
  it("reads every spelling of a slug as the same page", () => {
    for (const spelling of ["/about", "about", "//About//", " /about/ ", "ABOUT"]) {
      assert.equal(canonicalPageSlug(spelling), "/about", `for ${JSON.stringify(spelling)}`);
    }
  });

  it("keeps a nested slug nested", () => {
    assert.equal(canonicalPageSlug("admissions/fees"), "/admissions/fees");
  });

  it("has no answer for an empty slug rather than inventing one", () => {
    assert.equal(canonicalPageSlug(""), "");
    assert.equal(canonicalPageSlug("/"), "");
    assert.equal(canonicalPageSlug(null), "");
    assert.equal(canonicalPageSlug(undefined), "");
  });

  it("drops characters that cannot appear in a URL path", () => {
    assert.equal(canonicalPageSlug("/our campus!"), "/our-campus");
  });
});

describe("isHomeSlug", () => {
  it("accepts both spellings of the root", () => {
    assert.equal(isHomeSlug("/home"), true);
    assert.equal(isHomeSlug("/"), true);
    assert.equal(isHomeSlug(""), true);
  });

  it("rejects a real page", () => {
    assert.equal(isHomeSlug("/about"), false);
  });
});

describe("pickPages — every envelope the API answers in", () => {
  it("reads the public endpoint's pages array", () => {
    const pages = pickPages({
      pages: [
        { slug: "/home", title: "Home", sections: [{ id: "a", code: "<p>a</p>" }] },
        { slug: "/about", title: "About", sections: [{ id: "b", code: "<p>b</p>" }] },
      ],
    });
    assert.deepEqual(
      pages.map((p) => p.slug),
      ["/home", "/about"],
    );
    assert.equal(pages[1]!.sections[0]!.code, "<p>b</p>");
  });

  it("reads a config-wrapped pages array", () => {
    const pages = pickPages({ config: { pages: [{ slug: "/contact", sections: [] }] } });
    assert.deepEqual(
      pages.map((p) => p.slug),
      ["/contact"],
    );
  });

  it("turns a bare section array into one home page", () => {
    const pages = pickPages({ sections: [{ id: "a", code: "<p>a</p>" }] });
    assert.equal(pages.length, 1);
    assert.equal(pages[0]!.slug, "/home");
    assert.equal(pages[0]!.sections.length, 1);
  });

  it("keeps a page that has no sections yet", () => {
    // The editor creates a page before anything is added to it, and a published
    // site with an empty page should answer 200 and an empty page — not 404.
    const pages = pickPages({ pages: [{ slug: "/home", sections: [{ id: "a", code: "x" }] }, { slug: "/news", sections: [] }] });
    assert.equal(pages.length, 2);
    assert.equal(pages[1]!.sections.length, 0);
  });

  it("names an untitled page from its slug", () => {
    const pages = pickPages({ pages: [{ slug: "/student-life", sections: [] }] });
    assert.equal(pages[0]!.title, "Student Life");
  });

  it("survives junk without throwing", () => {
    assert.deepEqual(pickPages(null), []);
    assert.deepEqual(pickPages({}), []);
    assert.deepEqual(pickPages({ pages: "nope" }), []);
    assert.deepEqual(pickPages({ pages: [null, 7, "x"] }), []);
  });
});

describe("findPage — the address a visitor asked for", () => {
  const pages = pickPages({
    pages: [
      { slug: "/home", title: "Home", sections: [{ id: "h", code: "<p>home</p>" }] },
      { slug: "/about", title: "About", sections: [{ id: "a", code: "<p>about</p>" }] },
    ],
  });

  it("finds a page by slug, however it is spelled", () => {
    for (const spelling of ["/about", "about", "/About/"]) {
      assert.equal(findPage(pages, spelling)?.slug, "/about", `for ${spelling}`);
    }
  });

  it("serves the home page at the root", () => {
    assert.equal(findPage(pages, "/")?.slug, "/home");
    assert.equal(findPage(pages, "")?.slug, "/home");
  });

  it("returns null for a page this site does not publish", () => {
    // The whole point: the caller turns this into a 404 rather than serving the
    // home page under an address that names nothing.
    assert.equal(findPage(pages, "/nope"), null);
  });

  it("has no answer for a site with no pages", () => {
    assert.equal(findPage([], "/about"), null);
  });
});

describe("homePage — what the root serves", () => {
  it("prefers a page actually slugged /home", () => {
    const pages = pickPages({
      pages: [
        { slug: "/about", sections: [{ id: "a", code: "x" }] },
        { slug: "/home", sections: [{ id: "h", code: "y" }] },
      ],
    });
    assert.equal(homePage(pages)?.slug, "/home");
  });

  it("falls back to the first page when nothing is called home", () => {
    const pages = pickPages({
      pages: [
        { slug: "/admissions", sections: [{ id: "a", code: "x" }] },
        { slug: "/contact", sections: [] },
      ],
    });
    assert.equal(homePage(pages)?.slug, "/admissions");
  });
});

describe("pickSections — the old question, still answered", () => {
  it("returns the home page's sections, not the first page's", () => {
    const sections = pickSections({
      pages: [
        { slug: "/about", sections: [{ id: "a", code: "<p>about</p>" }] },
        { slug: "/home", sections: [{ id: "h", code: "<p>home</p>" }] },
      ],
    });
    assert.equal(sections.length, 1);
    assert.equal(sections[0]!.code, "<p>home</p>");
  });

  it("fills in an id and title for a section that has neither", () => {
    const sections = pickSections({ sections: [{ code: "<p>x</p>" }] });
    assert.equal(sections[0]!.id, "sec-0");
    assert.equal(sections[0]!.title, "Section 1");
  });

  it("is empty for an empty site", () => {
    assert.deepEqual(pickSections({}), []);
  });
});
