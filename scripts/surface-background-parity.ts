/**
 * Does a section with no background look the same on all three surfaces?
 *
 * ── The bug this pins ──────────────────────────────────────────────────────
 *
 * A section configured with no background at all — no colour, no image — was
 * reported as "transparent in Admin, white in the Editor". Measured in
 * Chromium, the truth was the other way round:
 *
 *   editor canvas root  rgb(255, 255, 255)
 *   published site      rgb(255, 255, 255)   <- identical, as designed
 *   Admin preview       rgb(9, 9, 11)        <- the odd one out
 *
 * The section is transparent on all three and always was; nothing forces a
 * background onto it. What differed was the canvas behind it. The runtime
 * paints its root `var(--xite-surface, #09090b)`, and the Admin's preview
 * document stamped no `data-xite-theme` anywhere, so the variable never
 * resolved and every section was reviewed against near-black however the site
 * it was bound for actually looked.
 *
 * ── Why a browser ──────────────────────────────────────────────────────────
 *
 * `section-parity.test.ts` already asserts the three surfaces build their CSS
 * from the same functions. That is a statement about strings, and it passed the
 * entire time this was broken — because the strings were never the problem. An
 * unresolved custom property is a cascade fact, and only a layout engine knows
 * one.
 *
 * Run with `npm run test:surfaces`.
 */
import { chromium } from "playwright-core";
import { themeStylesheet, EDITOR_THEMES, DEFAULT_THEME_ID } from "@/lib/editor-themes";
import { buildSectionRuntimeStylesheet } from "@/lib/section-runtime-stylesheet";
import { buildSectionPreviewDocument } from "@/lib/section-runtime";

const SCOPE = ".xite-site-canvas";
const THEME = DEFAULT_THEME_ID;

/** A section that configures no background at all. */
const SECTION = {
  id: "s1",
  code: `<section id="biryani" style="padding:40px"><h2>Mutton Biryani</h2><button id="b">Order</button></section>`,
};

const themeCss = themeStylesheet(SCOPE);
console.log("theme id under test:", THEME);
console.log("--xite-surface emitted by themeStylesheet? ", /--xite-surface\s*:/.test(themeCss));
console.log("--xite-text emitted? ", /--xite-text\s*:/.test(themeCss));
const m = themeCss.match(/--xite-surface:\s*([^;]+);/);
if (m) console.log("first --xite-surface value:", m[1]!.trim());

const run = async () => {
  const browser = await chromium.launch();

  // ── The editor canvas, as EditorStudio builds it ────────────────────────
  const editor = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const editorSheet = buildSectionRuntimeStylesheet({ sections: [SECTION], scope: SCOPE, fillViewport: false });
  await editor.setContent(
    `<style>${editorSheet.css}</style><style>${themeCss}</style>` +
    `<div class="shadow-2xl bg-white" style="background:#fff">` +
    `<div class="xite-site-canvas block" data-xite-theme="${THEME}" style="width:1440px">${SECTION.code}</div>` +
    `</div>`,
  );
  const editorOut = await editor.evaluate(() => {
    const root = document.querySelector(".xite-site-canvas") as HTMLElement;
    const sec = document.querySelector("#biryani") as HTMLElement;
    return {
      canvasRoot: getComputedStyle(root).backgroundColor,
      section: getComputedStyle(sec).backgroundColor,
      surfaceVar: getComputedStyle(root).getPropertyValue("--xite-surface").trim() || "(unset)",
    };
  });

  // ── The published site, as PreviewSiteViewer live builds it ─────────────
  const live = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const liveSheet = buildSectionRuntimeStylesheet({ sections: [SECTION], scope: SCOPE, fillViewport: true });
  await live.setContent(
    `<style>${liveSheet.css}</style><style>${themeCss}</style>` +
    `<div style="background:#09090b">` +
    `<div class="xite-site-canvas block" data-xite-theme="${THEME}" style="width:100%">${SECTION.code}</div>` +
    `</div>`,
  );
  const liveOut = await live.evaluate(() => {
    const root = document.querySelector(".xite-site-canvas") as HTMLElement;
    const sec = document.querySelector("#biryani") as HTMLElement;
    return {
      canvasRoot: getComputedStyle(root).backgroundColor,
      section: getComputedStyle(sec).backgroundColor,
      surfaceVar: getComputedStyle(root).getPropertyValue("--xite-surface").trim() || "(unset)",
    };
  });

  // ── The Admin panel iframe, as buildSectionPreviewDocument builds it ────
  const admin = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await admin.setContent(
    buildSectionPreviewDocument(SECTION.code, {
      title: "Mutton Biryani",
      themeCss: themeStylesheet("html"),
      themeId: THEME,
    }),
    { waitUntil: "domcontentloaded" },
  );
  const adminOut = await admin.evaluate(() => {
    const sec = document.querySelector("#biryani") as HTMLElement;
    return {
      html: getComputedStyle(document.documentElement).backgroundColor,
      body: getComputedStyle(document.body).backgroundColor,
      section: sec ? getComputedStyle(sec).backgroundColor : "(no section)",
    };
  });

  await browser.close();

  console.log("EDITOR  ", JSON.stringify(editorOut));
  console.log("LIVE    ", JSON.stringify(liveOut));
  console.log("ADMIN   ", JSON.stringify(adminOut));
  console.log("");

  const TRANSPARENT = "rgba(0, 0, 0, 0)";
  let bad = 0;
  const check = (name: string, ok: boolean, detail: string) => {
    if (!ok) bad++;
    console.log((ok ? "PASS  " : "FAIL  ") + name.padEnd(46) + " " + detail);
  };

  // The section never has a background invented for it, on any surface.
  check("section transparent in editor", editorOut.section === TRANSPARENT, editorOut.section);
  check("section transparent on published site", liveOut.section === TRANSPARENT, liveOut.section);
  check("section transparent in admin preview", adminOut.section === TRANSPARENT, adminOut.section);

  // And the canvas behind it is the same colour on all three.
  check(
    "editor canvas === published canvas",
    editorOut.canvasRoot === liveOut.canvasRoot,
    editorOut.canvasRoot + " vs " + liveOut.canvasRoot,
  );
  check(
    "admin body === published canvas",
    adminOut.body === liveOut.canvasRoot,
    adminOut.body + " vs " + liveOut.canvasRoot,
  );
  // <html> too. Custom properties inherit, but only from where the attribute is
  // stamped: on <body> alone the root keeps the fallback and shows as a dark
  // band below any section shorter than the viewport.
  check(
    "admin html === published canvas",
    adminOut.html === liveOut.canvasRoot,
    adminOut.html + " vs " + liveOut.canvasRoot,
  );

  process.exit(bad ? 1 : 0);
};
void run();
