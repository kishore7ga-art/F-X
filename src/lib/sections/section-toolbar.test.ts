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
  isUsableImageUrl,
  sanitizeCssUrls,
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
  isHeaderOverlaid,
  toggleHeaderOverlay,
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

  it("preserves custom property data URIs and does not truncate at semicolon", () => {
    const decls = parseManagedStyles(
      `/* xite:controls */[data-xite-el="e1"][data-xite-el="e1"]{--x-bg-image:data:image/png;base64,iVBORw0KGgo;color:#fff !important}/* /xite:controls */`,
    );
    assert.equal(decls.e1?.desktop?.["--x-bg-image"], "data:image/png;base64,iVBORw0KGgo");
    assert.equal(decls.e1?.desktop?.color, "#fff");
  });

  it("rejects incomplete or oversized data URIs", () => {
    assert.equal(isUsableImageUrl("data:image/png"), false);
    assert.equal(isUsableImageUrl("data:image/webp"), false);
    assert.equal(isUsableImageUrl("data:image/png;base64,"), false);
    assert.equal(isUsableImageUrl("data:image/png;base64,AA=="), true);
    assert.equal(isUsableImageUrl("https://example.com/photo.jpg"), true);
    assert.equal(isUsableImageUrl("/uploads/test.png"), true);
    assert.equal(isUsableImageUrl("data:image/png;base64," + "A".repeat(1_600_000)), false);
  });

  it("sanitizes broken or oversized data URLs in CSS to none", () => {
    assert.equal(sanitizeCssUrls('background-image:url("data:image/png");'), 'background-image:none;');
    assert.equal(sanitizeCssUrls('background-image:url("data:image/webp");'), 'background-image:none;');
    assert.equal(sanitizeCssUrls('background-image:url("https://test.com/a.jpg");'), 'background-image:url("https://test.com/a.jpg");');
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

  it("does not treat a row of bare icon buttons as a card list", () => {
    // A search/cart/account icon cluster is markup a header commonly carries;
    // three same-class wrappers around an <svg> satisfy every structural test
    // for a repeated list and used to surface as a bogus "Service cards"
    // entry in the Layout panel — a control pointing at a container with
    // nothing real to lay out, which a header can carry more than one of.
    const probe = probeSection(
      `<header><div class="icons"><span class="icon-btn"><svg><path d="M1 1"/></svg></span><span class="icon-btn"><svg><path d="M2 2"/></svg></span><span class="icon-btn"><svg><path d="M3 3"/></svg></span></div></header>`,
    );
    assert.deepEqual(probe.repeaters, []);
  });
});

/* ── The schema ─────────────────────────────────────────────────────────── */

describe("section-schema — a different toolbar per section", () => {
  it("gives a section the retained background, buttons, shadow, animation, and section controls", () => {
    const schema = buildSectionSchema({ code: HERO, category: "hero" });
    assert.ok(schema.capabilities.includes("background"));
    assert.ok(schema.capabilities.includes("buttons"));
    assert.ok(schema.capabilities.includes("shadow"));
    assert.ok(schema.capabilities.includes("animation"));
    assert.ok(schema.capabilities.includes("section"));
    assert.equal(schema.categoryLabel, "Hero");
  });

  it("builds a working toolbar for a category it has never heard of", () => {
    const schema = buildSectionSchema({ code: SERVICES, category: "custom" });
    assert.ok(schema.groups.length > 0);
    assert.equal(schema.categoryLabel, "Section");
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
    const reading = readControlValue(section(HERO), control("bg-color"), "desktop");
    assert.equal(reading.value, "#ffffff");
    assert.equal(reading.source, "authored");
  });

  it("writes a background colour that beats the author's inline style", () => {
    const patch = applyControl(section(HERO), control("bg-color"), "desktop", "#112233");
    assert.ok(patch?.code);
    assert.ok(patch.code.includes("background-color:#112233 !important"));
  });

  it("changing the mobile value leaves the desktop value alone", () => {
    const afterDesktop = applyControl(section(HERO), control("bg-color"), "desktop", "#112233")!;
    const once = section(afterDesktop.code!);
    const afterMobile = applyControl(once, control("bg-color"), "mobile", "#445566")!;
    const twice = section(afterMobile.code!);

    assert.equal(readControlValue(twice, control("bg-color"), "desktop").value, "#112233");
    assert.equal(readControlValue(twice, control("bg-color"), "mobile").value, "#445566");
    assert.equal(readControlValue(twice, control("bg-color"), "tablet").value, "#112233");
  });

  it("clearing a value falls back through the cascade rather than writing an empty rule", () => {
    let current = section(applyControl(section(HERO), control("bg-color"), "desktop", "#112233")!.code!);
    current = section(applyControl(current, control("bg-color"), "mobile", "#445566")!.code!);
    const cleared = applyControl(current, control("bg-color"), "mobile", "")!;
    const after = section(cleared.code!);

    assert.equal(readControlValue(after, control("bg-color"), "mobile").value, "#112233");
    assert.ok(!cleared.code!.includes("background-color: ;"));
  });

  it("edits a section's ID without disturbing its content", () => {
    const withId = applyControl(section(HERO), control("section-id"), "desktop", "hero-section")!;
    assert.ok(withId.code!.includes(`id="hero-section"`));
    assert.ok(withId.code!.includes("Empowering Minds"));
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
  const rawTextControl = { ...control("bg-color"), id: "raw-text-probe", kind: "text" as const, op: { kind: "text" as const } };

  it("escapes text so it cannot inject markup", () => {
    const patch = applyControl(section(HERO), rawTextControl, "desktop", "A <script>alert(1)</script> B")!;
    assert.ok(!patch.code!.includes("<script>"));
    assert.ok(patch.code!.includes("&lt;script&gt;"));
  });

  it("returns null rather than a no-op write when nothing changed", () => {
    const once = applyControl(section(HERO), control("bg-color"), "desktop", "#112233")!;
    assert.equal(applyControl(section(once.code!), control("bg-color"), "desktop", "#112233"), null);
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

  it("resets its own styling and leaves the author's markup exactly as it was", () => {
    let current = section(applyControl(section(HERO), control("shadow-blur"), "desktop", "32px")!.code!);
    current = section(applyControl(current, control("bg-color"), "mobile", "#000000")!.code!);
    assert.ok(hasManagedStyling(current.code));

    const reset = resetSectionStyling(current)!;
    assert.ok(!reset.code || !hasManagedStyling(reset.code));
  });

  it("keeps a section's own stylesheet when a control writes to it", () => {
    const services = buildSectionSchema({ code: SERVICES, category: "courses" });
    const bg = allControls(services).find((c) => c.id === "bg-color")!;
    const patch = applyControl(section(SERVICES, "courses"), bg, "desktop", "#123456")!;
    assert.ok(patch.code!.includes(".prog-grid { display: grid"));
    assert.ok(patch.code!.includes("@media (max-width: 900px)"));
    assert.ok(patch.code!.includes("background-color:#123456 !important"));
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

describe("header overlay — header floats transparently over hero", () => {
  it("toggles header overlay on and off", () => {
    const navbar = section(NAVBAR, "navbar");
    assert.equal(isHeaderOverlaid(navbar), false);

    const overlaid = toggleHeaderOverlay(navbar, true);
    assert.equal(isHeaderOverlaid(overlaid), true);
    assert.ok(overlaid.code.includes("position:absolute"));
    assert.ok(overlaid.code.includes("z-index:50"));
    assert.ok(overlaid.code.includes("--x-header-overlay:hero"));

    const detached = toggleHeaderOverlay(overlaid, false);
    assert.equal(isHeaderOverlaid(detached), false);
    assert.ok(!detached.code.includes("--x-header-overlay:hero"));
  });
});

describe("background image & color markup sync", () => {
  it("syncs new background image to both managed CSS and inline markup style", () => {
    const heroCode = `<section style="background:#0f172a;color:#ffffff;padding:72px 40px;"><div class="container"><h1>Hero</h1></div></section>`;
    const s = { ...section(heroCode, "hero"), category: "hero" as const };
    const schema = buildSectionSchema(s);
    const bgImageControl = schema.groups.find((g) => g.id === "background")?.controls.find((c) => c.id === "bg-image")!;

    const patch = applyControl(s, bgImageControl, "desktop", "https://api.webxite.org/uploads/car.jpg");
    assert.ok(patch?.code);
    assert.ok(patch.code.includes("background-image:url(\"https://api.webxite.org/uploads/car.jpg\") !important"));
    assert.ok(patch.code.includes("background-image: url('https://api.webxite.org/uploads/car.jpg')"));
  });

  it("updates existing background URL in markup when a new image is applied", () => {
    const heroWithImage = `<section style="background: url('https://old-image.com/old.jpg') center/cover; color:#fff;"><h1>Hero</h1></section>`;
    const s = { ...section(heroWithImage, "hero"), category: "hero" as const };
    const schema = buildSectionSchema(s);
    const bgImageControl = schema.groups.find((g) => g.id === "background")?.controls.find((c) => c.id === "bg-image")!;

    const patch = applyControl(s, bgImageControl, "desktop", "https://api.webxite.org/uploads/new.jpg");
    assert.ok(patch?.code);
    assert.ok(!patch.code.includes("https://old-image.com/old.jpg"));
    assert.ok(patch.code.includes("https://api.webxite.org/uploads/new.jpg"));
  });

  it("syncs background color to both managed CSS and markup", () => {
    const heroCode = `<section style="background-color:#0f172a;color:#ffffff;"><h1>Hero</h1></section>`;
    const s = { ...section(heroCode, "hero"), category: "hero" as const };
    const schema = buildSectionSchema(s);
    const bgColorControl = schema.groups.find((g) => g.id === "background")?.controls.find((c) => c.id === "bg-color")!;

    const patch = applyControl(s, bgColorControl, "desktop", "#ef4444");
    assert.ok(patch?.code);
    assert.ok(patch.code.includes("background-color:#ef4444 !important"));
    assert.ok(patch.code.includes("background-color: #ef4444"));
  });

  it("removes background image from markup and managed CSS when background color is chosen", () => {
    const heroWithImage = `<section style="background: url('https://api.webxite.org/uploads/car.jpg') center/cover; color:#fff;"><img class="absolute inset-0 w-full h-full object-cover" src="https://api.webxite.org/uploads/car.jpg" /><h1>Hero</h1></section>`;
    const s = { ...section(heroWithImage, "hero"), category: "hero" as const };
    const schema = buildSectionSchema(s);
    const bgColorControl = schema.groups.find((g) => g.id === "background")?.controls.find((c) => c.id === "bg-color")!;

    const patch = applyControl(s, bgColorControl, "desktop", "#3b82f6");
    assert.ok(patch?.code);
    assert.ok(!patch.code.includes("https://api.webxite.org/uploads/car.jpg"));
    assert.ok(!patch.code.includes("<img"));
    assert.ok(patch.code.includes("background-color:#3b82f6 !important"));
    assert.ok(patch.code.includes("#3b82f6"));
  });
});


