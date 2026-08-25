/**
 * The responsive canvas, in a real browser.
 *
 * ── Why this cannot be a unit test ─────────────────────────────────────────
 *
 * The claim being made is "when the operator selects 1920, the site is genuinely
 * laid out as if the viewport were 1920 pixels wide". Every part of that claim
 * is a browser behaviour: whether `container-type: inline-size` measures the
 * element's own width or its transformed one, whether `@container` rules fire at
 * the right threshold, and whether a `transform: scale()` on an ancestor leaks
 * into any of it. Node can assert the arithmetic in `effectiveScale` — and does,
 * in `viewport-presets.test.ts` — but only a layout engine can answer this.
 *
 * That distinction is the whole bug. `maxWidth: "100%"` clamped the canvas to
 * the pane, and because the canvas *is* the query container, the clamp changed
 * which `@container` rules matched. The preview did not merely look small: it
 * resolved a different layout and reported the width it had been asked for. A
 * unit test on the width string would have passed the entire time.
 *
 * So: a real Chromium, the real `sectionRuntimeCss` / `sectionResponsiveCss` /
 * `viewportMediaToContainer` output, the real DOM shape `ResponsiveCanvas`
 * emits, and the real `effectiveScale`. Run with `npm run test:canvas`.
 */

import assert from "node:assert/strict";

import { chromium } from "playwright-core";

import {
  sectionResponsiveCss,
  sectionRuntimeCss,
  viewportMediaToContainer,
} from "../src/lib/section-runtime";
import {
  WIDTHS_FOR,
  effectiveScale,
  type DeviceMode,
  type ViewportState,
} from "../src/lib/viewport-presets";

const SCOPE = ".xite-site-canvas";
const MODES: DeviceMode[] = ["desktop", "tablet", "phone"];

/**
 * A section written the way sections here are written: plain `@media` width
 * queries, put through the same rewrite the runtime applies.
 *
 * The thresholds are chosen to sit between rungs of the ladder, so each width
 * lands unambiguously in one band and an off-by-one clamp shows up as a wrong
 * band rather than as a rounding difference.
 */
const SECTION_CSS = viewportMediaToContainer(`
  .probe { --band: xs; }
  @media (min-width: 480px)  { .probe { --band: sm; } }
  @media (min-width: 768px)  { .probe { --band: md; } }
  @media (min-width: 1024px) { .probe { --band: lg; } }
  @media (min-width: 1440px) { .probe { --band: xl; } }
  @media (min-width: 1920px) { .probe { --band: xxl; } }
`);

/** The band a width should resolve to, from the thresholds above. */
function expectedBand(width: number): string {
  if (width >= 1920) return "xxl";
  if (width >= 1440) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 480) return "sm";
  return "xs";
}

/**
 * The page, built to match `ResponsiveCanvas` exactly: a pane that scrolls, a
 * fit box carrying the *scaled* footprint, and the canvas positioned absolutely
 * inside it at its real width with the transform on its wrapper.
 */
function harness(): string {
  return `<!doctype html>
<html><head><style>
  html, body { margin: 0; padding: 0; }
  #pane { width: 100%; overflow-x: auto; }
  ${sectionRuntimeCss(SCOPE, { fillViewport: false })}
  ${sectionResponsiveCss(SCOPE)}
  ${SECTION_CSS}
</style></head>
<body>
  <div id="pane">
    <div id="fit" style="position:relative;margin:0 auto;box-sizing:content-box">
      <div id="scaled" style="position:absolute;top:0;left:0;transform-origin:top left">
        <div id="canvas" class="xite-site-canvas">
          <div data-xite-section="s1">
            <div class="probe" style="height:600px">probe</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body></html>`;
}

type Reading = {
  canvasWidth: number;
  probeWidth: number;
  band: string;
  paintedWidth: number;
  paneScrollWidth: number;
  paneClientWidth: number;
  fitWidth: number;
};

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let checked = 0;
  const failures: string[] = [];

  const check = (label: string, fn: () => void) => {
    try {
      fn();
      checked += 1;
    } catch (error) {
      failures.push(`${label}: ${(error as Error).message}`);
    }
  };

  /**
   * Two pane sizes, deliberately.
   *
   * 880 is a laptop with a drawer open — smaller than 24 of the 30 widths, so it
   * exercises the scaled path that the old `maxWidth: "100%"` used to swallow.
   * 1600 is a wide monitor, where most widths need no scaling at all and the
   * canvas must be shown at life size rather than stretched to fill.
   */
  for (const paneWidth of [880, 1600]) {
    await page.setViewportSize({ width: paneWidth, height: 900 });
    await page.setContent(harness());

    for (const mode of MODES) {
      for (const preset of WIDTHS_FOR[mode]) {
        // Every zoom, plus fit. The width must be identical in all six.
        for (const zoom of [null, 0.5, 0.75, 1, 1.25, 1.5] as ViewportState["zoom"][]) {
          const viewport: ViewportState = { mode, width: preset.width, zoom };
          const scale = effectiveScale(viewport, paneWidth);

          const reading: Reading = await page.evaluate(
            ({ width, scale }) => {
              const fit = document.getElementById("fit")!;
              const scaled = document.getElementById("scaled")!;
              const canvas = document.getElementById("canvas")!;
              const probe = document.querySelector(".probe")!;
              const pane = document.getElementById("pane")!;

              scaled.style.width = `${width}px`;
              scaled.style.transform = scale === 1 ? "" : `scale(${scale})`;
              canvas.style.width = `${width}px`;

              // Layout settles before the fit box is sized, exactly as the
              // component's ResizeObserver does it.
              const naturalHeight = (scaled as HTMLElement).offsetHeight;
              fit.style.width = `${width * scale}px`;
              fit.style.height = `${naturalHeight * scale}px`;

              return {
                // The layout width — what CSS believes. Unaffected by transforms.
                canvasWidth: (canvas as HTMLElement).offsetWidth,
                probeWidth: (probe as HTMLElement).offsetWidth,
                band: getComputedStyle(probe).getPropertyValue("--band").trim(),
                // The painted width — what the operator sees. Transformed.
                paintedWidth: canvas.getBoundingClientRect().width,
                paneScrollWidth: pane.scrollWidth,
                paneClientWidth: pane.clientWidth,
                fitWidth: (fit as HTMLElement).offsetWidth,
              };
            },
            { width: preset.width, scale },
          );

          const at = `${mode} ${preset.width}px @ zoom=${zoom ?? "fit"} in a ${paneWidth}px pane`;

          // ── 1. The width is real ──────────────────────────────────────────
          // The claim on the toolbar. This is the assertion the old code failed:
          // at 1920 in an 880px pane it measured 880.
          check(`${at} — canvas is the selected width`, () => {
            assert.equal(reading.canvasWidth, preset.width);
          });

          // ── 2. The section is laid out against it ─────────────────────────
          // Not just the canvas: the section inside it has to fill the same box,
          // or the width is real and nothing is using it.
          check(`${at} — section fills the canvas`, () => {
            assert.equal(reading.probeWidth, preset.width);
          });

          // ── 3. The responsive rules resolve against it ────────────────────
          // The point of the whole exercise. A clamped canvas resolved the
          // pane's breakpoints while claiming the selected width.
          check(`${at} — container query resolves at the selected width`, () => {
            assert.equal(reading.band, expectedBand(preset.width));
          });

          // ── 4. Zoom is visual only ────────────────────────────────────────
          // Same width, six different scales, one layout. If zoom could reach
          // the CSS width, assertions 1–3 would move with it.
          check(`${at} — painted size follows the zoom`, () => {
            assert.ok(
              Math.abs(reading.paintedWidth - preset.width * scale) < 1,
              `painted ${reading.paintedWidth}, expected ${preset.width * scale}`,
            );
          });

          // ── 5. Fit really fits ────────────────────────────────────────────
          // And the page reserves the scaled footprint rather than the
          // unscaled one, so a 3840px canvas does not produce five screens of
          // empty horizontal scroll.
          if (zoom === null) {
            check(`${at} — fit leaves no horizontal overflow`, () => {
              assert.ok(
                reading.paneScrollWidth <= reading.paneClientWidth + 1,
                `pane scrolls ${reading.paneScrollWidth} in ${reading.paneClientWidth}`,
              );
            });
            check(`${at} — fit box carries the scaled footprint`, () => {
              assert.ok(
                Math.abs(reading.fitWidth - preset.width * scale) < 1,
                `fit box ${reading.fitWidth}, expected ${preset.width * scale}`,
              );
            });
          }
        }
      }
    }
  }

  await browser.close();

  for (const failure of failures) console.error(`  ✖ ${failure}`);
  console.log(
    `[canvas] ${checked} checks passed across 30 widths x 6 zooms x 2 pane sizes` +
      (failures.length ? `, ${failures.length} FAILED` : ""),
  );

  if (failures.length) process.exit(1);
}

void main();
