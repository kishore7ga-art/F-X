import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyEdits,
  childElements,
  descendants,
  getAttribute,
  parseHtml,
  setAttributeEdit,
  setTextEdit,
  textContent,
} from "./html-dom";
import { selectAll, selectOne } from "./html-select";
import {
  parseManagedStyles,
  serializeManagedStyles,
  setManagedProperty,
  splitManagedRegion,
  writeManagedRegion,
  splitSectionCode,
  joinSectionCode,
  resolveManagedValue,
} from "./section-managed-css";
import { probeSection } from "./section-probe";
import { allControls, buildSectionSchema } from "./section-schema";
import {
  applyControl,
  applyListAction,
  hasManagedStyling,
  readControlValue,
  resetSectionStyling,
  withAlpha,
  type EditableSection,
} from "./section-edit";

/* ── Fixtures, taken from the shapes the real library actually uses ─────── */

/** The platform's own hero: inline styles throughout, two buttons, a stat row. */
const HERO = `<section style="background:#ffffff;color:#0f172a;padding:80px 24px 60px 24px;text-align:center">
  <div style="max-width:960px;margin:0 auto">
    <h1 style="font-size:56px;font-weight:900;color:#0f172a">Empowering Minds</h1>
    <p style="font-size:18px;color:#64748b">Join a world-class academic community.</p>
    <div style="margin-top:36px;display:flex;justify-content:center;gap:16px">
      <a href="#admissions" style="background:#ef4444;color:#ffffff;padding:14px 36px;border-radius:12px">Apply Now</a>
      <a href="#courses" style="background:#f1f5f9;color:#0f172a;padding:14px 36px;border-radius:12px">Explore Programs</a>
    </div>
  </div>
</section>`;

/** A services grid with its own stylesheet and a media query. */
const SERVICES = `<style>
  .prog-wrap { background: #ffffff; padding: 72px 32px; }
  .prog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
  @media (max-width: 900px) { .prog-grid { grid-template-columns: 1fr; } }
</style>
<section class="prog-wrap">
  <h2 style="font-size: 36px">Programs offered</h2>
  <div class="prog-grid">
    <article class="prog-card">
      <img src="/a.png" alt="Engineering" />
      <div class="prog-body"><h3>Engineering</h3><p>Six accredited degrees.</p><a class="prog-cta" href="#">Explore</a></div>
    </article>
    <article class="prog-card">
      <img src="/b.png" alt="Sciences" />
      <div class="prog-body"><h3>Sciences</h3><p>Laboratory teaching.</p><a class="prog-cta" href="#">Explore</a></div>
    </article>
    <article class="prog-card">
      <img src="/c.png" alt="Humanities" />
      <div class="prog-body"><h3>Humanities</h3><p>Seminar teaching.</p><a class="prog-cta" href="#">Explore</a></div>
    </article>
  </div>
</section>`;

const NAVBAR = `<header style="display:flex;justify-content:space-between;padding:16px 40px">
  <a href="/"><img src="/crest.svg" alt="University crest" class="logo" /></a>
  <nav>
    <ul style="display:flex;gap:24px">
      <li><a href="/about">About</a></li>
      <li><a href="/courses">Courses</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
  <a class="btn-apply" href="/apply" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px">Apply</a>
</header>`;

const section = (code: string, category = "hero"): EditableSection => ({
  title: "Section",
  code,
  category,
});

/* ── The parser ─────────────────────────────────────────────────────────── */

describe("html-dom — a section is a string, and stays one", () => {
  it("leaves markup it did not touch byte-identical", () => {
    const root = parseHtml(HERO);
    const heading = selectOne(root, "h1")!;
    const out = applyEdits(HERO, [setTextEdit(heading, "New heading")]);

    assert.equal(out.replace("New heading", "Empowering Minds"), HERO);
  });

  it("does not treat a child combinator inside a stylesheet as markup", () => {
    const code = `<style>.a > .b { color: red } .c { content: "<div>" }</style><p>after</p>`;
    const root = parseHtml(code);
    const tags = childElements(root).map((node) => node.tag);
    assert.deepEqual(tags, ["style", "p"]);
    assert.equal(textContent(code, selectOne(root, "p")!), "after");
  });

  it("closes list items and paragraphs the way a browser does", () => {
    const root = parseHtml(`<ul><li>one<li>two<li>three</ul>`);
    const list = selectOne(root, "ul")!;
    assert.equal(childElements(list).length, 3);
    assert.deepEqual(
      childElements(list).map((node) => textContent("<ul><li>one<li>two<li>three</ul>", node)),
      ["one", "two", "three"],
    );
  });

  it("does not let a header element be mistaken for a document head", () => {
    // The bug that used to delete every navbar whole: `<head[\\s\\S]*?>` matches
    // the opening tag of `<header>`.
    const root = parseHtml(NAVBAR);
    assert.equal(childElements(root)[0]!.tag, "header");
    assert.equal(selectAll(root, "nav a").length, 3);
  });

  it("drops a stray closing tag rather than truncating the section", () => {
    const code = `<section><div>a</div></span><p>still here</p></section>`;
    const root = parseHtml(code);
    assert.ok(selectOne(root, "p"));
    assert.equal(textContent(code, selectOne(root, "p")!), "still here");
  });

  it("keeps an unquoted or valueless attribute readable", () => {
    const root = parseHtml(`<input type=text required placeholder='Your name'>`);
    const input = selectOne(root, "input")!;
    assert.equal(getAttribute(input, "type"), "text");
    assert.equal(getAttribute(input, "required"), "");
    assert.equal(getAttribute(input, "placeholder"), "Your name");
  });

  it("refuses to apply overlapping edits rather than tearing the markup", () => {
    assert.throws(
      () => applyEdits("<p>abc</p>", [
        { start: 0, end: 5, text: "x" },
        { start: 3, end: 8, text: "y" },
      ]),
      /overlapping/,
    );
  });

  it("adds an attribute without disturbing the ones already there", () => {
    const root = parseHtml(`<section class="a" style="color:red">x</section>`);
    const node = selectOne(root, "section")!;
    const out = applyEdits(`<section class="a" style="color:red">x</section>`, [
      setAttributeEdit(node, "data-xite-el", "e1")!,
    ]);
    assert.equal(out, `<section data-xite-el="e1" class="a" style="color:red">x</section>`);
  });
});

/* ── The selector engine ────────────────────────────────────────────────── */

describe("html-select — small on purpose, and never guesses", () => {
  it("matches tags, classes, attributes and descendants", () => {
    const root = parseHtml(SERVICES);
    assert.equal(selectAll(root, ".prog-card").length, 3);
    assert.equal(selectAll(root, ".prog-body h3").length, 3);
    assert.equal(selectAll(root, "a[href]").length, 3);
    assert.equal(selectAll(root, "article > img").length, 3);
  });

  it("matches nothing at all when the selector cannot be parsed", () => {
    const root = parseHtml(SERVICES);
    assert.deepEqual(selectAll(root, "article:nth-child(2)"), []);
    assert.deepEqual(selectAll(root, "article + article"), []);
  });
});

/* ── The managed region ─────────────────────────────────────────────────── */

describe("section-managed-css — the toolbar's stylesheet", () => {
  it("round-trips a model through CSS and back", () => {
    let styles = {};
    styles = setManagedProperty(styles, "e1", "desktop", "font-size", "56px");
    styles = setManagedProperty(styles, "e1", "tablet", "font-size", "44px");
    styles = setManagedProperty(styles, "e1", "mobile", "font-size", "32px");
    styles = setManagedProperty(styles, "e2", "desktop", "background-color", "#0f172a");

    const css = writeManagedRegion("body { margin: 0 }", styles);
    assert.deepEqual(parseManagedStyles(css), styles);
  });

  it("keeps the author's stylesheet outside the region it owns", () => {
    const authored = ".prog-grid { gap: 28px }";
    const css = writeManagedRegion(authored, setManagedProperty({}, "e1", "desktop", "color", "#fff"));
    assert.ok(css.includes(".prog-grid { gap: 28px }"));
    assert.equal(splitManagedRegion(css).authored.trim(), authored);
  });

  it("removes its own region entirely when nothing is set", () => {
    const authored = ".a { color: red }";
    const withRegion = writeManagedRegion(authored, setManagedProperty({}, "e1", "desktop", "color", "#fff"));
    const cleared = writeManagedRegion(withRegion, {});
    assert.equal(cleared.trim(), authored);
  });

  it("orders tablet before mobile, so the narrower rule wins", () => {
    let styles = {};
    styles = setManagedProperty(styles, "e1", "tablet", "font-size", "44px");
    styles = setManagedProperty(styles, "e1", "mobile", "font-size", "32px");
    const css = serializeManagedStyles(styles);
    assert.ok(css.indexOf("1024px") < css.indexOf("640px"));
  });

  it("marks every rendered declaration important, and no custom property", () => {
    let styles = setManagedProperty({}, "e1", "desktop", "font-size", "56px");
    styles = setManagedProperty(styles, "e1", "desktop", "--x-overlay", "#000000");
    const css = serializeManagedStyles(styles);
    assert.ok(css.includes("font-size:56px !important"));
    assert.ok(css.includes("--x-overlay:#000000"));
    assert.ok(!css.includes("--x-overlay:#000000 !important"));
  });

  it("resolves a mobile read through tablet and desktop", () => {
    let styles = setManagedProperty({}, "e1", "desktop", "font-size", "56px");
    styles = setManagedProperty(styles, "e1", "tablet", "font-size", "44px");
    assert.deepEqual(resolveManagedValue(styles, "e1", "mobile", "font-size"), { value: "44px", from: "tablet" });
    assert.deepEqual(resolveManagedValue(styles, "e1", "desktop", "font-size"), { value: "56px", from: "desktop" });
  });

  it("survives a declaration whose value contains a semicolon-bearing url", () => {
    const decls = parseManagedStyles(
      `/* xite:controls */[data-xite-el="e1"][data-xite-el="e1"]{background-image:url("data:image/gif;base64,AA==") !important;color:#fff !important}/* /xite:controls */`,
    );
    assert.equal(decls.e1?.desktop?.["background-image"], `url("data:image/gif;base64,AA==")`);
    assert.equal(decls.e1?.desktop?.color, "#fff");
  });

  it("keeps a section's code in the shape recomposeSectionCode produces", () => {
    const parts = splitSectionCode(SERVICES);
    assert.ok(parts.headCss.includes(".prog-grid"));
    assert.ok(!parts.bodyHtml.includes("<style"));
    const rebuilt = joinSectionCode(parts);
    assert.ok(rebuilt.startsWith("<style>"));
    assert.ok(rebuilt.includes(`<section class="prog-wrap">`));
  });
});

/* ── Detection ──────────────────────────────────────────────────────────── */

describe("section-probe — controls come from the markup, not from a table", () => {
  it("finds a hero's heading, copy and both buttons", () => {
    const probe = probeSection(splitSectionCode(HERO).bodyHtml);
    assert.equal(probe.headings.length, 1);
    assert.equal(probe.paragraphs.length, 1);
    assert.equal(probe.actions.length, 2);
    assert.equal(probe.actions[0]!.text, "Apply Now");
  });

  it("recognises an inline-styled link as a button", () => {
    // Half the library writes buttons with a class and half writes them inline;
    // a class-only test finds none of the platform's own.
    const probe = probeSection(splitSectionCode(HERO).bodyHtml);
    assert.deepEqual(probe.actions.map((a) => a.text), ["Apply Now", "Explore Programs"]);
  });

  it("finds three cards in a services grid without being told it is one", () => {
    const probe = probeSection(splitSectionCode(SERVICES).bodyHtml);
    const cards = probe.repeaters.find((r) => r.kind === "cards");
    assert.ok(cards);
    assert.equal(cards.items.length, 3);
  });

  it("separates a header's logo, navigation and action button", () => {
    const probe = probeSection(splitSectionCode(NAVBAR).bodyHtml);
    assert.ok(probe.logo);
    assert.equal(getAttribute(probe.logo.node, "alt"), "University crest");
    assert.equal(probe.navLinks.length, 3);
    assert.equal(probe.actions.length, 1);
    assert.equal(probe.actions[0]!.text, "Apply");
  });

  it("does not report a repeater for a wrapper holding one child", () => {
    const probe = probeSection(`<section><div><h2>Only</h2></div></section>`);
    assert.deepEqual(probe.repeaters, []);
  });
});

/* ── The schema ─────────────────────────────────────────────────────────── */

describe("section-schema — a different toolbar per section", () => {
  it("gives a hero button controls, and no text-editing group", () => {
    const schema = buildSectionSchema({ code: HERO, category: "hero" });
    assert.ok(schema.capabilities.includes("buttons"));
    // Heading/paragraph text is edited on the canvas, not through a form here —
    // see the comment above `outerHeadings` in section-schema.ts.
    assert.ok(!schema.capabilities.includes("content"));
    assert.equal(schema.categoryLabel, "Hero");
  });

  it("gives a header logo and navigation controls, and no card list", () => {
    const schema = buildSectionSchema({ code: NAVBAR, category: "navbar" });
    assert.ok(schema.capabilities.includes("logo"));
    assert.ok(schema.capabilities.includes("navigation"));
    assert.equal(schema.categoryLabel, "Header");
  });

  it("gives a services section a card list it can add to and reorder", () => {
    const schema = buildSectionSchema({ code: SERVICES, category: "courses" });
    const list = schema.groups.flatMap((g) => g.lists).find((l) => l.items.length === 3);
    assert.ok(list);
    assert.equal(list.label, "Courses");
    assert.deepEqual([...list.actions], ["add", "duplicate", "delete", "moveUp", "moveDown"]);
  });

  it("shows no image controls for a section with no images", () => {
    const schema = buildSectionSchema({ code: HERO, category: "hero" });
    assert.ok(!schema.capabilities.includes("media"));
  });

  it("builds a working toolbar for a category it has never heard of", () => {
    // §17: the editor must handle sections an administrator adds later.
    const schema = buildSectionSchema({ code: SERVICES, category: "custom" });
    assert.ok(schema.groups.length > 0);
    assert.ok(schema.groups.flatMap((g) => g.lists).some((l) => l.items.length === 3));
    assert.equal(schema.categoryLabel, "Section");
  });

  it("orders a header's groups differently from a hero's", () => {
    const header = buildSectionSchema({ code: NAVBAR, category: "navbar" });
    const hero = buildSectionSchema({ code: HERO, category: "hero" });
    assert.notDeepEqual(header.capabilities, hero.capabilities);
    assert.equal(header.capabilities[0], "logo");
    assert.equal(hero.capabilities[0], "buttons");
  });

  it("never emits a control whose target cannot be resolved", () => {
    [HERO, SERVICES, NAVBAR].forEach((code) => {
      const schema = buildSectionSchema({ code, category: "custom" });
      allControls(schema).forEach((control) => {
        const reading = readControlValue(section(code), control, "desktop");
        assert.ok(reading, `${control.id} produced no reading`);
      });
    });
  });
});

/* ── Reading and writing ────────────────────────────────────────────────── */

describe("section-edit — every control edits the section for real", () => {
  const heroSchema = buildSectionSchema({ code: HERO, category: "hero" });
  const control = (id: string) => allControls(heroSchema).find((c) => c.id === id)!;

  it("reads the author's inline value so the panel is not blank on an untouched section", () => {
    const reading = readControlValue(section(HERO), control("h-size"), "desktop");
    assert.equal(reading.value, "56px");
    assert.equal(reading.source, "authored");
  });

  it("writes a heading size that beats the author's inline style", () => {
    const patch = applyControl(section(HERO), control("h-size"), "desktop", "72px");
    assert.ok(patch?.code);
    assert.ok(patch.code.includes("font-size:72px !important"));
    // And the authored markup is still there, untouched.
    assert.ok(patch.code.includes(`font-weight:900`));
  });

  it("changing the mobile value leaves the desktop value alone", () => {
    // §20, stated as a test because it is the requirement most easily broken.
    const afterDesktop = applyControl(section(HERO), control("h-size"), "desktop", "72px")!;
    const once = section(afterDesktop.code!);
    const afterMobile = applyControl(once, control("h-size"), "mobile", "34px")!;
    const twice = section(afterMobile.code!);

    assert.equal(readControlValue(twice, control("h-size"), "desktop").value, "72px");
    assert.equal(readControlValue(twice, control("h-size"), "mobile").value, "34px");
    assert.equal(readControlValue(twice, control("h-size"), "tablet").value, "72px");
  });

  it("clearing a value falls back through the cascade rather than writing an empty rule", () => {
    let current = section(applyControl(section(HERO), control("h-size"), "desktop", "72px")!.code!);
    current = section(applyControl(current, control("h-size"), "mobile", "34px")!.code!);
    const cleared = applyControl(current, control("h-size"), "mobile", "")!;
    const after = section(cleared.code!);

    assert.equal(readControlValue(after, control("h-size"), "mobile").value, "72px");
    assert.ok(!cleared.code!.includes("font-size: ;"));
  });

  it("edits a button's link without disturbing the other button or its own text", () => {
    // No `btn-0-text` control any more — a button's label is text on the
    // canvas, same as a heading's — so this only exercises the link.
    const withHref = applyControl(section(HERO), control("btn-0-href"), "desktop", "/admissions")!;

    assert.ok(withHref.code!.includes(`href="/admissions"`));
    assert.ok(withHref.code!.includes("Apply Now"));
    assert.ok(withHref.code!.includes("Explore Programs"));
    assert.ok(withHref.code!.includes(`href="#courses"`));
  });

  /**
   * Nothing in today's schema emits an `op: "text"` control any more —
   * heading/paragraph/button/label text all moved to the canvas — but
   * `applyControl`'s escaping still has to hold for it, since it's a general
   * capability of `section-edit.ts`, not something tied to whether the
   * current schema happens to expose it. Built by hand from an existing
   * control's target rather than fetched from the schema, since the schema
   * has nothing of this kind left to fetch.
   */
  const rawTextControl = { ...control("h-size"), id: "raw-text-probe", kind: "text" as const, op: { kind: "text" as const } };

  it("escapes text so it cannot inject markup", () => {
    const patch = applyControl(section(HERO), rawTextControl, "desktop", "A <script>alert(1)</script> B")!;
    assert.ok(!patch.code!.includes("<script>"));
    assert.ok(patch.code!.includes("&lt;script&gt;"));
  });

  it("returns null rather than a no-op write when nothing changed", () => {
    assert.equal(applyControl(section(HERO), rawTextControl, "desktop", "Empowering Minds"), null);
    assert.equal(applyControl(section(HERO), control("h-size"), "desktop", ""), null);
  });

  it("composes an overlay and a background image into one declaration", () => {
    let current = section(applyControl(section(HERO), control("bg-image"), "desktop", "https://x/y.jpg")!.code!);
    current = section(applyControl(current, control("bg-overlay"), "desktop", "#000000")!.code!);
    current = section(applyControl(current, control("bg-overlay-opacity"), "desktop", "0.6")!.code!);

    assert.ok(current.code.includes(`linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://x/y.jpg")`));
    assert.ok(current.code.includes("background-size:cover"));
    // And the inputs are readable again, which is the whole point of storing them.
    assert.equal(readControlValue(current, control("bg-overlay-opacity"), "desktop").value, "0.6");
    assert.equal(readControlValue(current, control("bg-image"), "desktop").value, "https://x/y.jpg");
  });

  it("composes a shadow from its six inputs", () => {
    let current = section(applyControl(section(HERO), control("shadow-y"), "desktop", "18px")!.code!);
    current = section(applyControl(current, control("shadow-blur"), "desktop", "40px")!.code!);
    current = section(applyControl(current, control("shadow-color"), "desktop", "#0f172a")!.code!);
    current = section(applyControl(current, control("shadow-opacity"), "desktop", "0.25")!.code!);
    assert.ok(current.code.includes("box-shadow:0px 18px 40px 0px rgba(15, 23, 42, 0.25)"));
  });

  it("writes padding as four longhands so one side can be changed alone", () => {
    const patch = applyControl(section(HERO), control("root-padding"), "desktop", {
      top: "120px", right: "", bottom: "", left: "",
    })!;
    assert.ok(patch.code!.includes("padding-top:120px !important"));
    assert.ok(!patch.code!.includes("padding-right"));
    // The author's own shorthand is still read for the sides nobody overrode.
    const reading = readControlValue(section(patch.code!), control("root-padding"), "desktop");
    assert.deepEqual(reading.value, { top: "120px", right: "24px", bottom: "60px", left: "24px" });
  });

  it("hides a section per device using ranges that cannot overlap", () => {
    const control = allControls(heroSchema).find((c) => c.id === "root-hidden")!;
    const patch = applyControl(section(HERO), control, "desktop", ["tablet"])!;

    assert.ok(patch.code!.includes("(min-width: 641px) and (max-width: 1024px)"));
    assert.ok(!patch.code!.includes("(min-width: 1025px){"));
    assert.deepEqual(readControlValue(section(patch.code!), control, "desktop").value, ["tablet"]);
  });

  it("hides on desktop without hiding on the phone", () => {
    const control = allControls(heroSchema).find((c) => c.id === "root-hidden")!;
    const patch = applyControl(section(HERO), control, "desktop", ["desktop"])!;
    const css = patch.code!;
    const desktopOnly = css.indexOf("(min-width: 1025px)");
    assert.ok(desktopOnly > 0);
    // No `display` rule outside that exclusive band.
    assert.equal(css.match(/display:none !important/g)?.length, 1);
  });

  it("resets its own styling and leaves the author's markup exactly as it was", () => {
    let current = section(applyControl(section(HERO), control("h-size"), "desktop", "72px")!.code!);
    current = section(applyControl(current, control("bg-color"), "mobile", "#000000")!.code!);
    assert.ok(hasManagedStyling(current.code));

    const reset = resetSectionStyling(current)!;
    assert.ok(!hasManagedStyling(reset.code!));
    assert.ok(!reset.code!.includes("data-xite-el"));
    assert.equal(reset.code, HERO);
  });

  it("keeps a section's own stylesheet when a control writes to it", () => {
    // The failure this guards: a write that goes through the body only would
    // drop the head, deleting `.prog-grid` the first time anybody set a gap.
    const services = buildSectionSchema({ code: SERVICES, category: "courses" });
    const gap = allControls(services).find((c) => c.id === "list-0-gap")!;
    const patch = applyControl(section(SERVICES, "courses"), gap, "desktop", "40px")!;
    assert.ok(patch.code!.includes(".prog-grid { display: grid"));
    assert.ok(patch.code!.includes("@media (max-width: 900px)"));
    assert.ok(patch.code!.includes("gap:40px !important"));
  });
});

/* ── Lists ──────────────────────────────────────────────────────────────── */

describe("section-edit — repeated structures", () => {
  const list = () =>
    buildSectionSchema({ code: SERVICES, category: "courses" })
      .groups.flatMap((g) => g.lists)
      .find((l) => l.items.length >= 3)!;

  it("duplicates a card in place", () => {
    const patch = applyListAction(section(SERVICES, "courses"), list(), 0, "duplicate")!;
    const after = probeSection(splitSectionCode(patch.code!).bodyHtml);
    assert.equal(after.repeaters.find((r) => r.kind === "cards")!.items.length, 4);
    assert.equal(patch.code!.match(/Engineering/g)?.length, 4); // alt + heading, twice
  });

  it("adds a card by cloning the last one", () => {
    const patch = applyListAction(section(SERVICES, "courses"), list(), 0, "add")!;
    const body = splitSectionCode(patch.code!).bodyHtml;
    assert.equal(probeSection(body).repeaters.find((r) => r.kind === "cards")!.items.length, 4);
    assert.ok(body.trimEnd().endsWith("</section>"));
  });

  it("deletes a card and leaves the rest in order", () => {
    const patch = applyListAction(section(SERVICES, "courses"), list(), 1, "delete")!;
    assert.ok(!patch.code!.includes("Sciences"));
    assert.ok(patch.code!.includes("Engineering"));
    assert.ok(patch.code!.includes("Humanities"));
  });

  it("refuses to delete the last remaining item", () => {
    const single = `<div class="grid"><div class="card"><h3>One</h3></div><div class="card"><h3>Two</h3></div></div>`;
    const schema = buildSectionSchema({ code: single, category: "custom" });
    const only = schema.groups.flatMap((g) => g.lists)[0]!;
    const afterOne = applyListAction(section(single, "custom"), only, 0, "delete")!;

    const reduced = buildSectionSchema({ code: afterOne.code!, category: "custom" })
      .groups.flatMap((g) => g.lists)[0];
    // One item left: no list is reported, so there is nothing to delete from.
    assert.ok(!reduced || applyListAction(section(afterOne.code!, "custom"), reduced, 0, "delete") === null);
  });

  it("reorders two cards by swapping their markup", () => {
    const patch = applyListAction(section(SERVICES, "courses"), list(), 0, "moveDown")!;
    const body = splitSectionCode(patch.code!).bodyHtml;
    assert.ok(body.indexOf("Sciences") < body.indexOf("Engineering"));
    assert.ok(body.indexOf("Engineering") < body.indexOf("Humanities"));
  });

  it("forgets the styling of an item it deleted", () => {
    const styled = allControls(buildSectionSchema({ code: SERVICES, category: "courses" }))
      .find((c) => c.id === "item-bg")!;
    const withStyle = applyControl(section(SERVICES, "courses"), styled, "desktop", "#111111")!;
    const current = section(withStyle.code!, "courses");

    const currentList = buildSectionSchema({ code: current.code, category: "courses" })
      .groups.flatMap((g) => g.lists).find((l) => l.items.length === 3)!;
    const deleted = applyListAction(current, currentList, 1, "delete")!;

    // The three cards shared one key, so the rule stays; what must not happen is
    // a rule for a key nothing carries any more.
    const keys = Object.keys(parseManagedStyles(splitSectionCode(deleted.code!).headCss));
    const live = new Set(
      descendants(parseHtml(splitSectionCode(deleted.code!).bodyHtml))
        .map((node) => getAttribute(node, "data-xite-el"))
        .filter(Boolean),
    );
    keys.forEach((key) => assert.ok(live.has(key), `orphan rule for ${key}`));
  });
});

describe("withAlpha", () => {
  it("turns hex and rgb into rgba", () => {
    assert.equal(withAlpha("#000", 0.5), "rgba(0, 0, 0, 0.5)");
    assert.equal(withAlpha("#2563eb", 0.25), "rgba(37, 99, 235, 0.25)");
    assert.equal(withAlpha("rgb(10, 20, 30)", 1), "rgba(10, 20, 30, 1)");
  });

  it("leaves a colour it cannot read alone rather than guessing", () => {
    assert.equal(withAlpha("var(--brand)", 0.5), "var(--brand)");
  });
});
