/**
 * Does what the section toolbar writes actually change the page?
 *
 * ── Why this cannot be a unit test ─────────────────────────────────────────
 *
 * `section-toolbar.test.ts` asserts that a control produces the right CSS. That
 * is a statement about *strings*, and every interesting way this feature can
 * fail leaves the strings correct:
 *
 *  - The library is authored in inline styles, and **no selector beats an
 *    inline style**. A managed rule without `!important` is perfect CSS that
 *    changes nothing.
 *  - The runtime fences every section's CSS with `:where()`, which carries no
 *    specificity — so a rule can be scoped correctly and still lose.
 *  - The runtime stylesheet is placed *before* Tailwind's Play CDN sheet, so a
 *    utility class on the same element wins on order.
 *  - The responsive engine already emits `!important` rules at the same two
 *    breakpoints, and which of two important rules wins is source order.
 *  - Width `@media` becomes `@container`, so a device override resolves against
 *    the canvas rather than the window — or does not, and every responsive
 *    value silently applies at the wrong width.
 *
 * Five separate ways for a control to be correct and inert. Only a layout
 * engine can tell them apart, so this renders the edited section in the real
 * editor document — `globals.css`, both Tailwind engines, the theme layer, the
 * fence, the DOM `EditorStudio` emits — and reads the computed style back.
 *
 * The edits themselves are made in Node by the same `applyControl` the panel
 * calls, so what is measured is the output of the shipping code path rather
 * than of a fixture somebody wrote by hand.
 *
 * Run with `npm run test:toolbar`.
 */
import assert from "node:assert/strict";

import { chromium } from "playwright-core";

import {
  SCOPE,
  appGlobalsCss,
  browserBundle,
  editorDocument,
  install,
  reorderStylesheets,
  settle,
} from "./section-dom-harness";
import { buildSectionSchema, allControls, type Control } from "../src/lib/sections/section-schema";
import { applyControl, applyListAction, type EditableSection } from "../src/lib/sections/section-edit";
import type { Device } from "../src/lib/sections/section-managed-css";

/** The platform's own hero: inline styles on every element that matters. */
const HERO = `<section style="background:#ffffff;color:#0f172a;padding:80px 24px 60px 24px;text-align:center">
  <div style="max-width:960px;margin:0 auto">
    <h1 id="probe-heading" style="font-size:56px;font-weight:900;color:#0f172a">Empowering Minds</h1>
    <p style="font-size:18px;color:#64748b">Join a world-class academic community.</p>
    <a href="#a" style="background:#ef4444;color:#ffffff;padding:14px 36px;border-radius:12px">Apply Now</a>
  </div>
</section>`;

/** A Tailwind-classed section, to prove the managed rule beats a utility class. */
const TAILWIND = `<section class="bg-slate-900 p-10">
  <h2 id="probe-heading" class="text-2xl font-bold text-white">Tailwind heading</h2>
</section>`;

/** A grid with its own stylesheet, so the authored rule is a real competitor. */
const SERVICES = `<style>
  .prog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
  .prog-card { background: #f8fafc; padding: 20px; }
</style>
<section class="prog-wrap" style="padding:40px">
  <div class="prog-grid">
    <article class="prog-card"><h3>Engineering</h3><p>One</p></article>
    <article class="prog-card"><h3>Sciences</h3><p>Two</p></article>
    <article class="prog-card"><h3>Humanities</h3><p>Three</p></article>
  </div>
</section>`;

const asSection = (code: string, category = "hero"): EditableSection => ({ title: "S", code, category });

function controlIn(code: string, category: string, id: string): Control {
  const control = allControls(buildSectionSchema({ code, category: category as never })).find(
    (candidate) => candidate.id === id,
  );
  if (!control) throw new Error(`no control "${id}" for a ${category} section`);
  return control;
}

/** Applies one control, the way the panel does, and returns the new section. */
function edit(section: EditableSection, id: string, device: Device, value: unknown): EditableSection {
  const control = controlIn(section.code, section.category, id);
  const patch = applyControl(section, control, device, value as never);
  assert.ok(patch?.code, `control "${id}" produced no change`);
  return { ...section, code: patch.code };
}

type Probe = {
  /** `selector` -> the properties read from it. */
  [selector: string]: Record<string, string>;
};

/**
 * Serialised into the page: computed styles for a handful of selectors.
 *
 * Merged per selector rather than assigned, because a case that asserts three
 * properties of one element sends that selector three times — and assigning
 * would leave only the last, reporting the other two as a missing element.
 */
function readStyles(request: { selector: string; properties: string[] }[]): Probe {
  const out: Probe = {};
  request.forEach(({ selector, properties }) => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) {
      out[selector] = { ...(out[selector] ?? {}), __missing: "true" };
      return;
    }
    const computed = getComputedStyle(el);
    const values: Record<string, string> = { ...(out[selector] ?? {}) };
    properties.forEach((property) => {
      values[property] = computed.getPropertyValue(property);
    });
    out[selector] = values;
  });
  return out;
}

type Case = {
  name: string;
  section: EditableSection;
  /** Canvas width -> what must be true at it. */
  expect: Record<number, { selector: string; property: string; value: string | RegExp }[]>;
};

function buildCases(): Case[] {
  const cases: Case[] = [];

  /* ── 1. A managed value beats an inline style ─────────────────────────── */
  {
    const section = edit(asSection(HERO), "h-size", "desktop", "96px");
    cases.push({
      name: "heading size beats the author's inline font-size",
      section,
      expect: { 1440: [{ selector: "#probe-heading", property: "font-size", value: "96px" }] },
    });
  }

  /* ── 2. Per-device values, resolved against the canvas ────────────────── */
  {
    let section = asSection(HERO);
    section = edit(section, "h-size", "desktop", "96px");
    section = edit(section, "h-size", "tablet", "60px");
    section = edit(section, "h-size", "mobile", "34px");
    cases.push({
      name: "desktop, tablet and mobile heading sizes each apply at their own width",
      section,
      expect: {
        1440: [{ selector: "#probe-heading", property: "font-size", value: "96px" }],
        1024: [{ selector: "#probe-heading", property: "font-size", value: "60px" }],
        768: [{ selector: "#probe-heading", property: "font-size", value: "60px" }],
        640: [{ selector: "#probe-heading", property: "font-size", value: "34px" }],
        390: [{ selector: "#probe-heading", property: "font-size", value: "34px" }],
      },
    });
  }

  /* ── 3. Setting mobile does not disturb desktop ───────────────────────── */
  {
    let section = asSection(HERO);
    section = edit(section, "h-size", "desktop", "96px");
    section = edit(section, "h-size", "mobile", "30px");
    cases.push({
      name: "a mobile override leaves the desktop value exactly where it was",
      section,
      expect: {
        1440: [{ selector: "#probe-heading", property: "font-size", value: "96px" }],
        390: [{ selector: "#probe-heading", property: "font-size", value: "30px" }],
      },
    });
  }

  /* ── 4. Visibility per device, in exclusive bands ─────────────────────── */
  {
    const section = edit(asSection(HERO), "root-hidden", "desktop", ["tablet"] as unknown);
    cases.push({
      name: "hide on tablet hides at tablet width and nowhere else",
      section,
      expect: {
        1440: [{ selector: ".section-canvas-box > section", property: "display", value: "block" }],
        768: [{ selector: ".section-canvas-box > section", property: "display", value: "none" }],
        390: [{ selector: ".section-canvas-box > section", property: "display", value: "block" }],
      },
    });
  }
  {
    const section = edit(asSection(HERO), "root-hidden", "desktop", ["desktop", "mobile"] as unknown);
    cases.push({
      name: "hide on desktop and mobile leaves the tablet band showing",
      section,
      expect: {
        1440: [{ selector: ".section-canvas-box > section", property: "display", value: "none" }],
        768: [{ selector: ".section-canvas-box > section", property: "display", value: "block" }],
        390: [{ selector: ".section-canvas-box > section", property: "display", value: "none" }],
      },
    });
  }

  /* ── 5. A managed rule beats a Tailwind utility class ─────────────────── */
  {
    // The runtime stylesheet is placed *before* Tailwind's Play CDN sheet, on
    // purpose — so without `!important` this loses on source order, and the
    // control would appear broken on every Tailwind-authored section.
    const section = edit(asSection(TAILWIND, "custom"), "h-size", "desktop", "11px");
    cases.push({
      name: "a managed size beats Tailwind's text-2xl on the same element",
      section,
      expect: { 1440: [{ selector: "#probe-heading", property: "font-size", value: "11px" }] },
    });
  }

  /* ── 6. A managed rule beats the section's own stylesheet ─────────────── */
  {
    const section = edit(asSection(SERVICES, "courses"), "list-0-gap", "desktop", "4px");
    cases.push({
      name: "a managed gap beats the section's own .prog-grid rule",
      section,
      expect: { 1440: [{ selector: ".prog-grid", property: "gap", value: "4px" }] },
    });
  }

  /* ── 7. Composed background layers ────────────────────────────────────── */
  {
    let section = asSection(HERO);
    section = edit(section, "bg-overlay", "desktop", "#000000");
    section = edit(section, "bg-overlay-opacity", "desktop", "0.6");
    cases.push({
      name: "an overlay reaches the section as a real background layer",
      section,
      expect: {
        1440: [
          {
            selector: ".section-canvas-box > section",
            property: "background-image",
            value: /linear-gradient\(rgba\(0, 0, 0, 0\.6\), rgba\(0, 0, 0, 0\.6\)\)/,
          },
        ],
      },
    });
  }

  /* ── 8. Padding written as longhands, one side at a time ──────────────── */
  {
    const section = edit(asSection(HERO), "root-padding", "desktop", {
      top: "12px", right: "", bottom: "", left: "",
    } as unknown);
    cases.push({
      name: "one padding side overrides the author's shorthand and leaves the rest",
      section,
      expect: {
        1440: [
          { selector: ".section-canvas-box > section", property: "padding-top", value: "12px" },
          // The author wrote `80px 24px 60px 24px`; only the top was touched.
          { selector: ".section-canvas-box > section", property: "padding-bottom", value: "60px" },
          { selector: ".section-canvas-box > section", property: "padding-left", value: "24px" },
        ],
      },
    });
  }

  /*
   * Content edits reaching the canvas used to be case 9 here, writing
   * through a `heading-0` control. There is no such control any more —
   * heading/paragraph/button/label text is edited directly on the canvas,
   * not through the toolbar — so there is nothing of that kind left for this
   * layout-engine harness to check; the canvas's own inline `contentEditable`
   * path is exercised by hand, not by a control write.
   */

  /* ── 9. A structural edit survives into a rendered page ────────────────── */
  {
    const base = asSection(SERVICES, "courses");
    const list = buildSectionSchema({ code: base.code, category: "courses" })
      .groups.flatMap((group) => group.lists)
      .find((entry) => entry.items.length === 3);
    assert.ok(list, "the services fixture produced no card list");
    const patch = applyListAction(base, list, 0, "duplicate");
    assert.ok(patch?.code);
    cases.push({
      name: "a duplicated card renders as a fourth card",
      section: { ...base, code: patch.code },
      expect: {
        1440: [{ selector: ".prog-grid", property: "grid-template-columns", value: /^\S+ \S+ \S+$/ }],
      },
    });
  }

  return cases;
}

async function main() {
  const cases = buildCases();
  const [globals, bundle] = await Promise.all([appGlobalsCss(), browserBundle()]);
  const browser = await chromium.launch();

  const failures: string[] = [];
  let checked = 0;

  for (const testCase of cases) {
    for (const [widthKey, expectations] of Object.entries(testCase.expect)) {
      const width = Number(widthKey);
      const context = await browser.newContext({ viewport: { width: width + 400, height: 900 } });
      const page = await context.newPage();
      await page.setContent(editorDocument(globals, bundle), { waitUntil: "load" });
      await page.evaluate(install, {
        sections: [{ id: "sec-under-test", code: testCase.section.code }],
        canvasWidth: width,
        scope: SCOPE,
        surface: "editor" as const,
      });
      await settle(page);
      await reorderStylesheets(page, true);

      const request = expectations.map((expectation) => ({
        selector: expectation.selector,
        properties: [expectation.property],
      }));
      const probe = await page.evaluate(readStyles, request);

      expectations.forEach((expectation) => {
        checked += 1;
        const found = probe[expectation.selector];
        const actual = found?.[expectation.property];
        const ok =
          expectation.value instanceof RegExp
            ? typeof actual === "string" && expectation.value.test(actual)
            : actual === expectation.value;
        if (!ok) {
          failures.push(
            `  ${testCase.name}\n` +
              `    @${width}px  ${expectation.selector} { ${expectation.property} }\n` +
              `    expected ${expectation.value}\n` +
              `    got      ${actual ?? (found?.__missing ? "(no element matched)" : "(property not read)")}`,
          );
        }
      });

      await page.close();
      await context.close();
    }
  }

  await browser.close();

  if (failures.length > 0) {
    console.error(`\nsection toolbar: ${failures.length} of ${checked} assertions failed.\n`);
    failures.forEach((failure) => console.error(failure + "\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`section toolbar: ${checked} computed-style assertions across ${cases.length} cases, all held.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
