/**
 * The editor's document, built for real, once.
 *
 * Two harnesses need a browser with the app's globals, both Tailwind engines,
 * the theme layer and the exact DOM `EditorStudio` emits: `section-parity-dom`
 * compares that document against the Admin's iframe, and `section-toolbar-dom`
 * asks whether the section toolbar's CSS actually wins in it.
 *
 * They must not each build one. SECTION-ARCHITECTURE.md §7 is blunt about why —
 * *"do not write a second document stripper"* — and the same reasoning applies
 * one level up: two hand-built copies of this environment would agree only
 * until one of them was touched, and then the two harnesses would be measuring
 * two different browsers while both reported success.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import type { Page } from "playwright-core";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** The canvas element that stands in for `<body>`, as `EditorStudio` names it. */
export const SCOPE = ".xite-site-canvas";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    XITE: Record<string, any>;
  }
}

/** The bundle the page needs, so it builds the editor's CSS with the editor's code. */
export async function browserBundle(): Promise<string> {
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
export async function appGlobalsCss(): Promise<string> {
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
export function editorDocument(globals: string, bundle: string): string {
  return [
    "<!doctype html>",
    '<html lang="en" class="min-h-screen antialiased dark scroll-smooth bg-black text-white w-full max-w-full font-sans">',
    "<head>",
    '<meta charset="utf-8"/>',
    '<link rel="preconnect" href="https://fonts.googleapis.com"/>',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Plus+Jakarta+Sans:wght@200..800&family=Outfit:wght@100..900&display=swap" rel="stylesheet"/>',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>',
    '<style id="app-globals">' + globals + "</style>",
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
export async function settle(page: Page): Promise<void> {
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

export type InstallOptions = {
  /** One entry per section, in order, exactly as the editor's canvas holds them. */
  sections: { id: string; code: string }[];
  canvasWidth: number;
  scope: string;
  surface: "editor" | "published";
};

/**
 * The DOM and the stylesheet a surface produces.
 *
 * `surface` is the only difference between the editor canvas and a published
 * page, and both differences are deliberate: the editor reserves no screenful
 * of site background under the last section, and it wraps the markup in one
 * `display: contents` element because `dangerouslySetInnerHTML` cannot share a
 * node with the empty-section notice. Everything else is the same code.
 *
 * Serialised into the page by `page.evaluate`, so it may only reference its own
 * argument and `window.XITE`.
 */
export function install({ sections, canvasWidth, scope, surface }: InstallOptions) {
  const XITE = window.XITE;
  const canvas = document.getElementById("canvas") as HTMLElement;
  canvas.style.width = canvasWidth + "px";
  (document.getElementById("fit") as HTMLElement).style.width = canvasWidth + "px";
  (document.getElementById("scaled") as HTMLElement).style.width = canvasWidth + "px";

  canvas.innerHTML = "";
  sections.forEach(({ id, code }) => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-xite-section", id);
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
  });

  const { css, links } = XITE.buildSectionRuntimeStylesheet({
    sections,
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
 * Re-asserts the two orderings the editor maintains with observers.
 *
 * Tailwind's sheet arrives after the runtime style did, so the placement
 * `useSectionRuntime` achieves with a `MutationObserver` is redone here — and
 * so is the container-query mirror, which the editor installs whenever a device
 * width is being simulated. A published page simulates nothing: there the
 * container and the window are one box.
 */
export async function reorderStylesheets(page: Page, mirrorTailwind: boolean): Promise<void> {
  await page.evaluate((mirror: boolean) => {
    const style = document.getElementById("xite-section-runtime") as HTMLStyleElement;
    window.XITE.placeBeforeTailwind(style);
    if (!mirror) return;

    const source = window.XITE.findSectionTailwindStyle(null) as HTMLStyleElement | null;
    if (!source) throw new Error("Tailwind's Play CDN produced no stylesheet");
    const twin = document.createElement("style");
    twin.setAttribute("data-xite-tw-mirror", "true");
    twin.textContent = window.XITE.viewportMediaToContainer(source.textContent || "");
    source.after(twin);
    if (source.sheet) source.sheet.disabled = true;
  }, mirrorTailwind);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}
