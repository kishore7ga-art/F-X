/**
 * Proves the two things the responsive engine promises, at every breakpoint.
 *
 *   1. PARITY  — a section renders the same on the published site as it does in
 *                the Admin's preview. Compared as geometry and computed style
 *                per element rather than as pixels: a screenshot diff also fires
 *                on sub-pixel rasterisation, which is not a defect and drowns
 *                the ones that are.
 *
 *   2. HEALTH  — nothing overflows, no text shrinks below what is readable, no
 *                grid keeps its desktop column count on a phone, and controls
 *                stay big enough to hit.
 *
 * Both sides are built from `src/lib/section-runtime.ts`, so this is a real
 * check on the shared environment rather than a restatement of it: it renders
 * the Admin's document and the live page in a browser and measures what came
 * out.
 *
 * Usage:
 *   node scripts/audit-sections-responsive.mjs [--url URL] [--api BASE] [--json]
 *
 * Requires Node 22.18+ (it imports the runtime module as TypeScript directly)
 * and the Playwright browsers that `playwright-core` drives.
 */
import { chromium } from "playwright-core";

import {
  SECTION_DEVICE_PRESETS,
  SECTION_BREAKPOINTS,
  buildSectionPreviewDocument,
} from "../src/lib/section-runtime.ts";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const LIVE_URL = flag("url", "http://localhost:3000/site/greenfield");
const API_BASE = flag("api", "http://localhost:4000");
const AS_JSON = args.includes("--json");
const SUBDOMAIN = LIVE_URL.replace(/\/+$/, "").split("/").pop() || "greenfield";

/** Long enough for webfonts and Tailwind's CDN compile to settle. */
const SETTLE_MS = 1800;

/** Anything smaller than this is not text somebody is expected to read. */
const MIN_FONT_PX = 11;
/**
 * Anything smaller than this is not a control somebody can reliably hit — checked
 * only at or below the tablet breakpoint, because above it the pointer is a mouse
 * and the engine deliberately leaves desktop layouts alone.
 */
const MIN_TAP_PX = 24;

const widths = [...new Set(SECTION_DEVICE_PRESETS.map((p) => p.width))]
  .map((w) => (w === "100%" ? 1440 : parseInt(w, 10)))
  .sort((a, b) => b - a);

async function loadSections() {
  for (const path of [
    `/api/v1/public/site/${SUBDOMAIN}`,
    `/api/v1/editor/${SUBDOMAIN}`,
    "/api/v1/default-website",
  ]) {
    try {
      const res = await fetch(`${API_BASE}${path}`);
      if (!res.ok) continue;
      const data = await res.json();
      const sections =
        (Array.isArray(data.sections) && data.sections.length && data.sections) ||
        data.pages?.[0]?.sections ||
        [];
      if (sections.length) return sections;
    } catch {
      // try the next source
    }
  }
  return [];
}

/**
 * What an element looks like, reduced to the things the environment decides.
 *
 * Deliberately not a pixel comparison and deliberately not everything: colour
 * and position would make every sub-pixel difference a failure, while these are
 * the properties the engine and the runtime actually set.
 */
const FINGERPRINT = `(root) => {
  const out = [];
  const walk = (el) => {
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    out.push([
      el.tagName,
      Math.round(box.width),
      Math.round(box.height),
      cs.display,
      cs.flexWrap,
      cs.gridTemplateColumns,
      cs.fontSize,
      cs.padding,
      cs.visibility,
    ].join("|"));
    for (const child of el.children) walk(child);
  };
  for (const child of root.children) walk(child);
  return out;
}`;

const HEALTH = `(root, limits) => {
  const problems = [];
  const bounds = root.getBoundingClientRect();
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== root.parentElement; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === "hidden" || ox === "clip" || ox === "auto" || ox === "scroll") return true;
    }
    return false;
  };
  const name = (el) => el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/)[0] : "");

  for (const el of root.querySelectorAll("*")) {
    const box = el.getBoundingClientRect();
    if (box.width === 0 && box.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;

    // A fixed-position element parked off-canvas is a closed drawer, not an
    // overflow: the real library builds mobile menus as fixed-position elements with a
    // translate that holds them just outside the viewport until they open. The
    // page-level check below is what catches genuine horizontal overflow.
    const overhang = Math.round(box.right - bounds.right);
    if (overhang > 1 && cs.position !== "fixed" && !clipped(el)) {
      problems.push({ kind: "overflow", el: name(el), detail: overhang + "px past the canvas" });
    }

    const text = (el.textContent || "").trim();
    if (text && el.children.length === 0) {
      const size = parseFloat(cs.fontSize);
      if (size < limits.minFont) {
        problems.push({ kind: "font", el: name(el), detail: size + "px" });
      }
    }

    if ((el.tagName === "A" || el.tagName === "BUTTON") && text) {
      if (box.height > 0 && box.height < limits.minTap) {
        problems.push({ kind: "tap", el: name(el), detail: Math.round(box.height) + "px tall" });
      }
    }

    if (limits.singleColumn && cs.display === "grid") {
      const columns = cs.gridTemplateColumns.split(" ").filter(Boolean).length;
      if (columns > 1) {
        problems.push({ kind: "columns", el: name(el), detail: columns + " columns" });
      }
    }
  }

  // The one that a visitor actually feels: can the page be dragged sideways?
  const pageOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (pageOverflow > 1) {
    problems.push({ kind: "page", el: "document", detail: pageOverflow + "px of horizontal scroll" });
  }

  return problems;
}`;

const sections = await loadSections();
if (!sections.length) {
  console.error(
    `No sections found. Is the API up at ${API_BASE}? ` +
      "Pass --api if it is somewhere else.",
  );
  process.exit(2);
}

const browser = await chromium.launch();
const report = { url: LIVE_URL, sections: sections.length, widths: {} };
let failures = 0;

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });

  // The Admin's preview: one document per section, the reference rendering.
  const adminPrints = [];
  for (const sec of sections) {
    const page = await context.newPage();
    await page.setContent(buildSectionPreviewDocument(sec.code || "", { title: sec.title }), {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(SETTLE_MS);
    adminPrints.push(await page.evaluate(`(${FINGERPRINT})(document.body)`));
    await page.close();
  }

  // The published site.
  const live = await context.newPage();
  await live.goto(LIVE_URL, { waitUntil: "networkidle" });
  await live.evaluate(() => document.fonts.ready);
  await live.waitForTimeout(SETTLE_MS);

  const livePrints = await live.evaluate(
    `Array.from(document.querySelectorAll(".section-canvas-box")).map((box) => (${FINGERPRINT})(box))`,
  );

  const health = await live.evaluate(
    `(${HEALTH})(document.querySelector(".xite-site-canvas"), ${JSON.stringify({
      minFont: MIN_FONT_PX,
      minTap: width <= SECTION_BREAKPOINTS.tablet ? MIN_TAP_PX : 0,
      singleColumn: width <= SECTION_BREAKPOINTS.mobile,
    })})`,
  );

  const parity = sections.map((sec, i) => {
    const a = adminPrints[i] || [];
    const b = livePrints[i] || [];
    const mismatches = [];
    for (let n = 0; n < Math.max(a.length, b.length); n++) {
      if (a[n] !== b[n]) mismatches.push({ index: n, admin: a[n] ?? null, live: b[n] ?? null });
      if (mismatches.length >= 3) break;
    }
    return { id: sec.id, title: sec.title, elements: a.length, mismatches };
  });

  const parityFailures = parity.filter((p) => p.mismatches.length > 0);
  failures += parityFailures.length + health.length;
  report.widths[width] = { parity: parityFailures, health };

  if (!AS_JSON) {
    const status = parityFailures.length === 0 && health.length === 0 ? "PASS" : "FAIL";
    console.log(`\n${width}px  ${status}`);
    for (const p of parityFailures) {
      console.log(`  parity  ${p.title}`);
      for (const m of p.mismatches) {
        console.log(`     admin  ${m.admin}`);
        console.log(`     live   ${m.live}`);
      }
    }
    for (const h of health) {
      console.log(`  ${h.kind.padEnd(8)}${h.el} — ${h.detail}`);
    }
  }

  await context.close();
}

await browser.close();

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(
    failures === 0
      ? `\nAll ${sections.length} sections match the Admin preview and pass at every breakpoint.`
      : `\n${failures} problem(s) across ${widths.length} widths.`,
  );
}

process.exit(failures === 0 ? 0 : 1);
