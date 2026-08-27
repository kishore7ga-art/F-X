/**
 * Admin preview vs editor canvas, in a real browser, element by element.
 *
 * ── Why this cannot be a unit test ─────────────────────────────────────────
 *
 * `section-parity.test.ts` asserts that the three surfaces build their CSS from
 * the same functions. That is a statement about *strings*, and it passed the
 * entire time the Admin and the editor were visibly rendering the same header
 * differently — because the difference was never in the strings. It was in what
 * the two documents did with them: which preflight was in scope, which sheet
 * came last, what an ancestor inherited down, whether a `@container` had a
 * container to resolve against.
 *
 * Only a layout engine can answer that. So this builds both environments for
 * real — the Admin's `buildSectionPreviewDocument` on one side, the editor's
 * document, `globals.css`, Tailwind's Play CDN, the theme layer and the exact
 * DOM `EditorStudio` emits on the other — renders the same section in each, and
 * compares the computed style of every element.
 *
 * Run with `npm run test:parity`.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium, type Page } from "playwright-core";

import { buildSectionPreviewDocument } from "../src/lib/section-runtime";
import { FIXTURES } from "./section-parity-fixtures";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCOPE = ".xite-site-canvas";

/** Two desktop widths, the boundary, two tablet-and-phone rungs, and the narrowest phone. */
const WIDTHS = [1920, 1440, 1024, 768, 390, 320];

/**
 * The properties compared, and the reason the list is this long.
 *
 * Every one of them is something a section is judged on: height, padding,
 * margins, spacing, font family, weight, size, letter spacing, text transform,
 * colour, background, border, alignment. A short list would make the harness
 * agree with a section that had quietly lost its typography, which is exactly
 * the failure being chased.
 */
const PROPERTIES = [
  "display", "position", "float", "clear", "visibility", "opacity", "overflow-x", "overflow-y",
  "box-sizing", "width", "height", "min-width", "min-height", "max-width", "max-height",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-color", "border-bottom-color", "border-top-style", "border-radius",
  "font-family", "font-size", "font-weight", "font-style", "font-variant",
  "line-height", "letter-spacing", "word-spacing", "text-transform", "text-align",
  "text-decoration-line", "text-indent", "white-space", "vertical-align",
  "color", "background-color", "background-image", "background-size", "background-position",
  "flex-direction", "flex-wrap", "justify-content", "align-items", "align-content",
  "gap", "flex-grow", "flex-shrink", "flex-basis", "order",
  "grid-template-columns", "grid-template-rows", "grid-auto-flow",
  "list-style-type", "box-shadow", "text-shadow", "transform", "z-index",
  "object-fit", "cursor", "-webkit-text-fill-color",
] as const;

type Snapshot = {
  tags: string[];
  styles: Record<string, string>[];
  rects: { x: number; y: number; w: number; h: number }[];
  boxWidth: number;
};

/** The bundle the page needs, so it builds the editor's CSS with the editor's code. */
async function browserBundle(): Promise<string> {
  const result = await build({
    entryPoints: [path.join(ROOT, "scripts/parity-browser-entry.ts")],
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    target: "es2022",
    logLevel: "silent",
  });
  return result.outputFiles[0].text;
}

/** `globals.css`, compiled exactly as the app's PostCSS pipeline compiles it. */
async function appGlobalsCss(): Promise<string> {
  const from = path.join(ROOT, "src/app/globals.css");
  const result = await postcss([tailwind()]).process(readFileSync(from, "utf8"), { from });
  return result.css;
}

/**
 * The editor's document, as `layout.tsx`, `SectionRuntimeAssets`,
 * `ResponsiveCanvas` and `EditorStudio` actually produce it.
 *
 * The class lists are copied from those files rather than simplified. They are
 * the host environment under test.
 */
function editorDocument(globals: string, bundle: string): string {
  return [
    "<!doctype html>",
    '<html lang="en" class="min-h-screen antialiased dark scroll-smooth bg-black text-white w-full max-w-full font-sans">',
    "<head>",
    '<meta charset="utf-8"/>',
    '<link rel="preconnect" href="https://fonts.googleapis.com"/>',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Plus+Jakarta+Sans:wght@200..800&family=Outfit:wght@100..900&display=swap" rel="stylesheet"/>',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>',
    "<style id=\"app-globals\">" + globals + "</style>",
    "<script>" + bundle + "</script>",
    "<script>",
    "  document.write(",
    "    XITE.SECTION_RUNTIME_STYLESHEET_HREFS.map(function (h) { return '<link rel=\"stylesheet\" href=\"' + h + '\">'; }).join('') +",
    "    '<link rel=\"stylesheet\" href=\"' + XITE.themeFontsHref() + '\">' +",
    "    '<style id=\"xite-theme\">' + XITE.themeStylesheet(" + JSON.stringify(SCOPE) + ") + '<' + '/style>'",
    "  );",
    "</script>",
    '<script src="https://cdn.tailwindcss.com"></script>',
    "</head>",
    '<body class="min-h-screen flex flex-col w-full max-w-full font-sans overflow-x-clip">',
    '  <main id="pane" class="flex-1 w-full overflow-x-auto">',
    '    <div id="fit" style="position:relative;margin:0 auto;box-sizing:content-box">',
    '      <div id="scaled" style="position:absolute;top:0;left:0">',
    '        <div class="xite-site-canvas block" id="canvas"></div>',
    "      </div>",
    "    </div>",
    "  </main>",
    '  <div class="w-full h-40 shrink-0 pointer-events-none"></div>',
    "</body>",
    "</html>",
  ].join("\n");
}

/** Waits for Tailwind's Play CDN to have produced a stylesheet, and for fonts. */
async function settle(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("style")).some(
        (s) => (s.textContent || "").includes("--tw-") && !s.id,
      ),
    undefined,
    { timeout: 30_000 },
  );
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

type Divergence = {
  fixture: string;
  width: number;
  element: string;
  property: string;
  admin: string;
  editor: string;
};

/** Every element under `rootSelector`, with its computed style and its box. */
function capture([rootSelector, properties]: [string, readonly string[]]): Snapshot {
  const root = document.querySelector(rootSelector) as HTMLElement;
  const origin = root.getBoundingClientRect();
  const elements = Array.from(root.querySelectorAll<HTMLElement>("*")).filter(
    (el) => !["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT"].includes(el.tagName),
  );
  return {
    boxWidth: Math.round(origin.width),
    tags: elements.map((el) => {
      const classes = typeof el.className === "string" ? el.className.trim() : "";
      return el.tagName.toLowerCase() + (classes ? "." + classes.split(/\s+/).slice(0, 2).join(".") : "");
    }),
    styles: elements.map((el) => {
      const computed = getComputedStyle(el);
      const out: Record<string, string> = {};
      properties.forEach((property) => {
        out[property] = computed.getPropertyValue(property);
      });
      return out;
    }),
    rects: elements.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.left - origin.left),
        y: Math.round(r.top - origin.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    }),
  };
}

async function main() {
  const [globals, bundle] = await Promise.all([appGlobalsCss(), browserBundle()]);
  const browser = await chromium.launch();
  const divergences: Divergence[] = [];
  let compared = 0;

  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });

    for (const fixture of FIXTURES) {
      /* ── The Admin: one section, its own document, nothing else in scope. ── */
      const adminPage = await context.newPage();
      await adminPage.setContent(buildSectionPreviewDocument(fixture.code), { waitUntil: "load" });
      await settle(adminPage);
      const admin = await adminPage.evaluate(capture, ["body", PROPERTIES] as [string, readonly string[]]);
      await adminPage.close();

      /* ── The editor canvas and a published page, in the app's document. ── */
      for (const surface of ["editor", "published"] as const) {
        const page = await context.newPage();
        /**
         * The editor draws a canvas narrower than its window; a published page
         * *is* the window. That asymmetry is the point — it is what made `vw`
         * resolve against the operator's monitor — so the harness reproduces
         * it rather than giving both surfaces a window the size of the canvas.
         */
        await page.setViewportSize({
          width: surface === "editor" ? width + 400 : width,
          height: 900,
        });
        await page.setContent(editorDocument(globals, bundle), { waitUntil: "load" });
        await page.evaluate(install, {
          code: fixture.code,
          sectionId: "sec-" + fixture.name,
          canvasWidth: width,
          scope: SCOPE,
          surface,
        });
        await settle(page);
        // Tailwind's sheet arrives after the runtime style did, so the ordering
        // the editor achieves with a MutationObserver is re-asserted here — and
        // so is the container-query mirror, which `useTailwindContainerQueries`
        // installs whenever a device width is being simulated. A published page
        // simulates nothing: there the container and the window are one box.
        await page.evaluate((mirrorTailwind: boolean) => {
          const style = document.getElementById("xite-section-runtime") as HTMLStyleElement;
          window.XITE.placeBeforeTailwind(style);
          if (!mirrorTailwind) return;

          const source = window.XITE.findSectionTailwindStyle(null) as HTMLStyleElement | null;
          if (!source) throw new Error("Tailwind's Play CDN produced no stylesheet");
          const mirror = document.createElement("style");
          mirror.setAttribute("data-xite-tw-mirror", "true");
          mirror.textContent = window.XITE.viewportMediaToContainer(source.textContent || "");
          source.after(mirror);
          if (source.sheet) source.sheet.disabled = true;
        }, surface === "editor");
        await page.evaluate(
          () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
        );
        const rendered = await page.evaluate(capture, [".section-canvas-box", PROPERTIES] as [string, readonly string[]]);
        await page.close();

        /* ── Compare against the Admin. ── */
        assert.equal(
          rendered.tags.length,
          admin.tags.length,
          `${fixture.name} @${width} (${surface}): a different number of elements ` +
            `(admin ${admin.tags.length}, ${surface} ${rendered.tags.length}) — the markup itself diverged.`,
        );
        assert.equal(
          rendered.boxWidth,
          width,
          `${fixture.name} @${width} (${surface}): the canvas measured ${rendered.boxWidth}px.`,
        );

        admin.tags.forEach((tag, i) => {
          const where = `${surface} ${i} <${tag}>`;
          PROPERTIES.forEach((property) => {
            compared += 1;
            const a = normalise(admin.styles[i][property]);
            const b = normalise(rendered.styles[i][property]);
            if (a !== b) {
              divergences.push({ fixture: fixture.name, width, element: where, property, admin: a, editor: b });
            }
          });
          const ra = admin.rects[i];
          const rb = rendered.rects[i];
          // An element with no box — an `<option>`, a `<track>` — reports a
          // rect at the viewport origin rather than at its parent's, so
          // subtracting the canvas origin gives a different number on each
          // surface for a thing that is not laid out at all.
          const laidOut = ra.w > 0 || ra.h > 0 || rb.w > 0 || rb.h > 0;
          (laidOut ? (["x", "y", "w", "h"] as const) : ([] as const)).forEach((key) => {
            compared += 1;
            if (Math.abs(ra[key] - rb[key]) > 1) {
              divergences.push({
                fixture: fixture.name,
                width,
                element: where,
                property: `rect.${key}`,
                admin: String(ra[key]),
                editor: String(rb[key]),
              });
            }
          });
        });
      }
    }

    await context.close();
  }

  await browser.close();
  report(divergences, compared);
}

/**
 * The DOM and the stylesheet a surface produces.
 *
 * `surface` is the only difference between the editor canvas and a published
 * page, and both differences are deliberate: the editor reserves no screenful
 * of site background under the last section, and it wraps the markup in one
 * `display: contents` element because `dangerouslySetInnerHTML` cannot share a
 * node with the empty-section notice. Everything else is the same code.
 */
function install({
  code,
  sectionId,
  canvasWidth,
  scope,
  surface,
}: {
  code: string;
  sectionId: string;
  canvasWidth: number;
  scope: string;
  surface: "editor" | "published";
}) {
  const XITE = window.XITE;
  const canvas = document.getElementById("canvas") as HTMLElement;
  canvas.style.width = canvasWidth + "px";
  (document.getElementById("fit") as HTMLElement).style.width = canvasWidth + "px";
  (document.getElementById("scaled") as HTMLElement).style.width = canvasWidth + "px";

  canvas.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-xite-section", sectionId);
  wrapper.className = "w-full relative transition-all group section-wrapper-container";
  wrapper.style.position = "relative";
  const markup = XITE.tokenizeSectionHtml(XITE.sectionCanvasHtml(code));
  if (surface === "editor") {
    const inner = document.createElement("div");
    inner.style.display = "contents";
    inner.innerHTML = markup;
    wrapper.appendChild(inner);
  } else {
    wrapper.innerHTML = markup;
  }
  canvas.appendChild(wrapper);

  const { css, links } = XITE.buildSectionRuntimeStylesheet({
    sections: [{ id: sectionId, code }],
    scope,
    fillViewport: surface === "published",
  });
  links.forEach(({ attrs }: { attrs: Record<string, string> }) => {
    if (attrs.href && document.querySelector('link[href="' + attrs.href + '"]')) return;
    const link = document.createElement("link");
    Object.entries(attrs).forEach(([name, value]) => link.setAttribute(name, value));
    document.head.appendChild(link);
  });
  const style = document.createElement("style");
  style.id = "xite-section-runtime";
  style.textContent = css;
  document.head.appendChild(style);
  XITE.placeBeforeTailwind(style);
}

/**
 * Differences that are not differences.
 *
 * The two documents resolve the same declaration to text that differs only in
 * spelling — a colour the Admin reports as `rgb(0, 0, 0)` and the editor as
 * `rgba(0, 0, 0, 1)`. Anything that changes a pixel survives this.
 */
function normalise(value: string): string {
  return (
    value
      .trim()
      // `color-mix()` computes to `color(srgb …)` where a plain `rgba()` stays
      // `rgba()`. Same colour, two spellings, and the numbers are exact.
      .replace(
        /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?:\s*\/\s*([\d.]+))?\)/g,
        (_full, r: string, g: string, b: string, a: string | undefined) => {
          const channel = (v: string) => Math.round(Number(v) * 255);
          const rgb = `${channel(r)}, ${channel(g)}, ${channel(b)}`;
          return a === undefined || Number(a) === 1 ? `rgb(${rgb})` : `rgba(${rgb}, ${Number(a)})`;
        },
      )
      .replace(/rgba\(([^)]+),\s*1\)/g, "rgb($1)")
      .replace(/\s+/g, " ")
  );
}

function report(divergences: Divergence[], compared: number) {
  if (divergences.length === 0) {
    console.log(`section parity: ${compared} comparisons, no divergence.`);
    return;
  }

  // Grouped by property: one leaked global style produces hundreds of rows and
  // one cause, and the cause is what a reader needs.
  const byProperty = new Map<string, Divergence[]>();
  divergences.forEach((d) => {
    const list = byProperty.get(d.property) ?? [];
    list.push(d);
    byProperty.set(d.property, list);
  });

  console.error(`\nsection parity: ${divergences.length} of ${compared} comparisons diverged.\n`);
  Array.from(byProperty.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([property, list]) => {
      const sample = list[0];
      const pad = " ".repeat(26);
      console.error(
        `  ${property.padEnd(24)} ${String(list.length).padStart(4)}x  e.g. ${sample.fixture}@${sample.width} ${sample.element}\n` +
          `${pad}admin:  ${sample.admin}\n` +
          `${pad}editor: ${sample.editor}`,
      );
    });
  process.exitCode = 1;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    XITE: Record<string, any>;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
