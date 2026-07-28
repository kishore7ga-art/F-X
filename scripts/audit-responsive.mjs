/**
 * Measures the running site at every breakpoint and names what overflows.
 *
 * "Nothing should overflow" is only a rule if something checks it. A screenshot
 * shows *that* a page is too wide; it does not say which element made it so,
 * and hunting that by eye across nine widths is exactly the job a machine
 * should do.
 *
 * Written after two false alarms that are worth recording. Screenshotting with
 * `chrome --headless --window-size=390,2400` looked like text clipped mid-word
 * at 390px — but `--window-size` sets the *window*, chrome included, so the CSS
 * viewport was wider than 390 and the capture simply cropped it. And a hero
 * that looked empty was animations frozen at t=0 by `--virtual-time-budget`,
 * not missing content. Both times the picture was misleading and the
 * measurement was not, which is the whole argument for this file.
 *
 * Usage:  node scripts/audit-responsive.mjs [url] [screenshotDir]
 */
import { chromium } from "playwright-core";

const WIDTHS = [1920, 1600, 1440, 1280, 1024, 768, 480, 390, 360];
const URL = process.argv[2] ?? "http://localhost:3000/";
const SHOTS = process.argv[3];

/** Long enough for the entry animations to settle before anything is judged. */
const SETTLE_MS = 2500;

const browser = await chromium.launch({ channel: "chrome" });
const results = [];

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(SETTLE_MS);

  const report = await page.evaluate(() => {
    const doc = document.documentElement;
    const limit = doc.clientWidth;
    const offenders = [];

    for (const el of document.querySelectorAll("body *")) {
      const box = el.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;
      const overhang = Math.round(box.right - limit);
      // 1px of slack: sub-pixel layout rounding is not a bug.
      if (overhang <= 1) continue;

      // Something an ancestor clips is not overflowing the page — that is what
      // the marquee, the hero's colour field and the footer wordmark all do on
      // purpose.
      let clipped = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const overflowX = getComputedStyle(p).overflowX;
        if (overflowX === "hidden" || overflowX === "clip") {
          clipped = true;
          break;
        }
      }
      if (clipped) continue;

      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? "").slice(0, 70),
        overhang,
      });
    }

    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: limit,
      overflow: doc.scrollWidth - limit,
      offenders: offenders.slice(0, 4),
    };
  });

  results.push({ width, ...report });
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/w-${width}.png` });
  await page.close();
}

await browser.close();

console.log("\n  width    scrollW   clientW   overflow");
let failed = 0;

for (const r of results) {
  const bad = r.overflow > 1;
  if (bad) failed += 1;
  console.log(
    `  ${String(r.width).padEnd(8)} ${String(r.scrollWidth).padEnd(9)} ` +
      `${String(r.clientWidth).padEnd(9)} ${String(r.overflow).padEnd(8)}` +
      (bad ? " <-- OVERFLOW" : ""),
  );
  for (const o of r.offenders) {
    console.log(`             ${o.tag}.${o.cls}  +${o.overhang}px`);
  }
}

console.log(
  failed
    ? `\n  ${failed} breakpoint(s) overflow.\n`
    : `\n  No overflow at any of the ${WIDTHS.length} breakpoints.\n`,
);

process.exit(failed ? 1 : 0);
