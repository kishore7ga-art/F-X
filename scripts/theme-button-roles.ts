/**
 * Which buttons the theme is allowed to paint as calls to action.
 *
 * ── Why a browser and not a unit test ──────────────────────────────────────
 *
 * The question is "which rule wins", and that is a cascade question. Both the
 * theme rule and the section's own `background: transparent !important` are
 * `!important`, so the answer turns on specificity between an eight-`:not()`
 * attribute chain and a single class — which is exactly the kind of reasoning
 * that is easy to get right on paper and still be wrong about. A layout engine
 * does not have opinions, so this asks one.
 *
 * The case that prompted it: a navbar's "Free Resources" disclosure is a bare
 * `<button>` carrying no ARIA and no telling class name. The only thing marking
 * it as a trigger is the `.wx-dropdown` next to it. It was rendering as a solid
 * accent block in the middle of a header.
 *
 * Run with `npm run test:buttons`.
 */
import { chromium } from "playwright-core";
import { themeStylesheet } from "@/lib/editor-themes";

const SCOPE = ".xite-site-canvas";

const MARKUP = `
<div class="xite-site-canvas" data-xite-theme="academic-blue">
  <header class="wx-header">
    <nav class="wx-desktop-nav">
      <a href="#" class="wx-nav-link">Placements</a>

      <!-- the reported case: a disclosure trigger with no ARIA and no telling class -->
      <div class="wx-resources">
        <button type="button" class="wx-resources-button" id="trigger"><span>Free Resources</span></button>
        <div class="wx-dropdown"><a class="wx-dropdown-item">Item</a></div>
      </div>

      <!-- a genuine call to action, which must still be painted -->
      <button type="button" id="cta"><span>Apply Now</span></button>

      <!-- the same disclosure in the mobile drawer, whose panel is named
           "list" rather than "dropdown" — caught by the chevron it carries -->
      <div class="wx-mobile-resources">
        <button type="button" id="mobile" class="wx-mobile-resources-btn">
          <span>Free Resources</span><span class="wx-chevron"></span>
        </button>
        <div class="wx-mobile-resource-list"><a href="#">Item</a></div>
      </div>

      <!-- other controls that were already escaped, as a regression guard -->
      <button type="button" id="hamburger" class="wx-menu-toggle">Menu</button>
      <button type="button" id="aria" aria-expanded="false">Courses</button>
    </nav>
  </header>
</div>`;

/** The accent the theme would supply. Pinned here so the assertion is exact. */
const ACCENT = "#1d4ed8";
const ACCENT_RGB = "rgb(29, 78, 216)";

const TOKENS = `.xite-site-canvas[data-xite-theme] { --xite-accent: ${ACCENT}; --xite-on-accent: #ffffff; }`;

const SECTION_CSS = `
.wx-resources { position: relative; display: flex; align-items: center; background: transparent !important; }
.wx-resources-button { border: 0 !important; background: transparent !important; color: #111317; }
.wx-dropdown { position: absolute; background: #ffffff; opacity: 0; visibility: hidden; }
.wx-mobile-resources-btn { border: 0 !important; background: #ffffff; color: #334155; }
`;

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(
    `<style>${themeStylesheet(SCOPE)}</style><style>${TOKENS}</style><style>${SECTION_CSS}</style>${MARKUP}`,
  );

  const read = (id: string) =>
    page.$eval(`#${id}`, (el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });

  /** Painted by the theme specifically — not merely non-transparent. */
  const painted = (bg: string) => bg === ACCENT_RGB;

  const results = {
    trigger: await read("trigger"),
    cta: await read("cta"),
    mobile: await read("mobile"),
    hamburger: await read("hamburger"),
    aria: await read("aria"),
  };
  await browser.close();

  let bad = 0;
  const check = (name: string, want: boolean, got: boolean, detail: string) => {
    const ok = want === got;
    if (!ok) bad++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(28)} ${detail}`);
  };

  check("dropdown trigger", false, painted(results.trigger.bg), `bg=${results.trigger.bg} — must not be the accent`);
  check("regular CTA not auto-themed", false, painted(results.cta.bg), `bg=${results.cta.bg} — must not have automatic theme background`);
  check("mobile disclosure", false, painted(results.mobile.bg), `bg=${results.mobile.bg} — panel named "list", caught by the chevron`);
  check("menu-toggle control", false, painted(results.hamburger.bg), `bg=${results.hamburger.bg}`);
  check("aria-expanded control", false, painted(results.aria.bg), `bg=${results.aria.bg}`);

  process.exit(bad ? 1 : 0);
};

void run();
