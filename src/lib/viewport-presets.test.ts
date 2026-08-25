import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  DEFAULT_VIEWPORT,
  DEFAULT_WIDTH,
  DESKTOP_WIDTHS,
  PHONE_WIDTHS,
  TABLET_WIDTHS,
  WIDTHS_FOR,
  ZOOM_LEVELS,
  effectiveScale,
  loadViewport,
  modeForWidth,
  nearestWidth,
  saveViewport,
  type DeviceMode,
  type ViewportState,
} from "./viewport-presets";

/**
 * The two numbers a preview is made of, and the rule that keeps them apart.
 *
 * The bug these tests exist to pin down is not a rendering one — it is that the
 * viewport width and the zoom were the same value. `maxWidth: "100%"` made the
 * *pane* decide the width, so choosing 1920 in a 900px pane laid the site out
 * for 900 and labelled it 1920. Everything below asserts the separation: the
 * width is what CSS sees, the scale is what the operator sees, and no input to
 * one may reach the other.
 */

const MODES: DeviceMode[] = ["desktop", "tablet", "phone"];

describe("the ladder — the widths that can be previewed", () => {
  it("offers the full thirty", () => {
    assert.equal(DESKTOP_WIDTHS.length, 10);
    assert.equal(TABLET_WIDTHS.length, 10);
    assert.equal(PHONE_WIDTHS.length, 10);
  });

  it("offers exactly the widths the spec names", () => {
    // Spelled out rather than derived, so that changing the ladder has to be a
    // deliberate edit to this list and not a side effect of touching the source.
    assert.deepEqual(
      DESKTOP_WIDTHS.map((p) => p.width),
      [1024, 1280, 1366, 1440, 1536, 1600, 1920, 2560, 2880, 3840],
    );
    assert.deepEqual(
      TABLET_WIDTHS.map((p) => p.width),
      [600, 640, 667, 720, 768, 800, 834, 900, 960, 1024],
    );
    assert.deepEqual(
      PHONE_WIDTHS.map((p) => p.width),
      [320, 360, 375, 390, 393, 412, 414, 430, 480, 540],
    );
  });

  it("starts each mode where the spec says", () => {
    assert.equal(DEFAULT_WIDTH.desktop, 1440);
    assert.equal(DEFAULT_WIDTH.tablet, 768);
    assert.equal(DEFAULT_WIDTH.phone, 390);
  });

  it("has a default that is itself a selectable width", () => {
    // A default outside the ladder would light no menu row, so the operator
    // could see a width the control claims does not exist.
    for (const mode of MODES) {
      assert.ok(
        WIDTHS_FOR[mode].some((preset) => preset.width === DEFAULT_WIDTH[mode]),
        `${mode} default ${DEFAULT_WIDTH[mode]} is not in its own ladder`,
      );
    }
  });

  it("lists each mode's widths in ascending order with no repeats", () => {
    for (const mode of MODES) {
      const widths = WIDTHS_FOR[mode].map((p) => p.width);
      assert.deepEqual(widths, [...widths].sort((a, b) => a - b), `${mode} is out of order`);
      assert.equal(new Set(widths).size, widths.length, `${mode} repeats a width`);
    }
  });

  it("carries no sentinel — every entry is a real number of pixels", () => {
    // The old ladder's first desktop entry was the string "100%", which is not a
    // width but "no particular width", and every consumer had to branch on it.
    for (const mode of MODES) {
      for (const preset of WIDTHS_FOR[mode]) {
        assert.equal(typeof preset.width, "number");
        assert.ok(preset.width > 0 && Number.isInteger(preset.width));
      }
    }
  });
});

describe("effectiveScale — how large it is drawn", () => {
  const at = (width: number, zoom: ViewportState["zoom"] = null): ViewportState => ({
    mode: modeForWidth(width),
    width,
    zoom,
  });

  it("shrinks a width too big for the pane, rather than shrinking the width", () => {
    // The heart of it. 1920 in a 960px pane is drawn at half size and is still
    // 1920 to the site's CSS.
    assert.equal(effectiveScale(at(1920), 960), 0.5);
  });

  it("scales every desktop width the old clamp made unreachable", () => {
    // 1536 and up could not be previewed at all on an ordinary laptop: each one
    // silently became the pane's width. Each must now fit by scaling.
    for (const width of [1536, 1600, 1920, 2560, 2880, 3840]) {
      const scale = effectiveScale(at(width), 900);
      assert.ok(scale < 1, `${width} did not scale down`);
      assert.ok(
        Math.abs(width * scale - 900) < 0.001,
        `${width} at scale ${scale} does not fill the 900px pane`,
      );
    }
  });

  it("draws a narrow canvas at life size instead of stretching it", () => {
    // A 390px phone in a 1200px pane is 390px. Blowing it up to fill the space
    // would misrepresent both the layout and the type size, which is the whole
    // thing being looked at.
    assert.equal(effectiveScale(at(390), 1200), 1);
  });

  it("honours an explicit zoom even when it overflows", () => {
    // Somebody who asks for 150% wants 150% and can scroll. Quietly clamping it
    // to fit would be the original bug wearing a different hat.
    assert.equal(effectiveScale(at(1920, 1.5), 600), 1.5);
    assert.equal(effectiveScale(at(320, 0.5), 4000), 0.5);
  });

  it("ignores the pane entirely once a zoom is chosen", () => {
    // Same state, wildly different panes, one answer: proof the pane cannot
    // reach an explicit zoom.
    const state = at(1440, 1);
    for (const pane of [100, 800, 1440, 5000]) {
      assert.equal(effectiveScale(state, pane), 1);
    }
  });

  it("falls back to life size before the pane has been measured", () => {
    // The first render happens before the ResizeObserver reports. Zero must not
    // become a scale of zero, which would paint nothing at all.
    assert.equal(effectiveScale(at(1440), 0), 1);
    assert.equal(effectiveScale(at(1440), Number.NaN), 1);
    assert.equal(effectiveScale(at(1440), -50), 1);
  });

  it("never lets the scale change the width", () => {
    // Stated as a property over the whole ladder: whatever the pane, whatever
    // the zoom, `width` is the number that went in.
    for (const mode of MODES) {
      for (const preset of WIDTHS_FOR[mode]) {
        for (const zoom of [null, ...ZOOM_LEVELS] as ViewportState["zoom"][]) {
          const state: ViewportState = { mode, width: preset.width, zoom };
          for (const pane of [320, 900, 1440, 3000]) {
            effectiveScale(state, pane);
            assert.equal(state.width, preset.width);
          }
        }
      }
    }
  });
});

describe("every one of the thirty widths, end to end", () => {
  it("is selectable, scales to fit a small pane, and keeps its own width", () => {
    const PANE = 880; // A laptop pane with a drawer open — the hard case.
    let checked = 0;

    for (const mode of MODES) {
      for (const preset of WIDTHS_FOR[mode]) {
        const state: ViewportState = { mode, width: preset.width, zoom: null };

        const scale = effectiveScale(state, PANE);
        const drawn = state.width * scale;

        // Fits: never wider than the pane.
        assert.ok(drawn <= PANE + 0.001, `${mode} ${preset.width} overflows at fit`);
        // Honest: the CSS width is untouched, so the container queries — and the
        // Tailwind mirror pointed at the same container — resolve against it.
        assert.equal(state.width, preset.width);
        // Visible: a scale of zero would be a blank canvas that reports success.
        assert.ok(scale > 0, `${mode} ${preset.width} scaled to nothing`);

        // And at each explicit zoom the width still does not move.
        for (const zoom of ZOOM_LEVELS) {
          assert.equal(effectiveScale({ ...state, zoom }, PANE), zoom);
        }

        checked += 1;
      }
    }

    assert.equal(checked, 30);
  });
});

describe("nearestWidth and modeForWidth", () => {
  it("finds the closest rung in a mode", () => {
    assert.equal(nearestWidth("phone", 400), 393);
    assert.equal(nearestWidth("tablet", 1000), 1024);
    assert.equal(nearestWidth("desktop", 1500), 1536);
  });

  it("returns a width that is actually offered", () => {
    for (const mode of MODES) {
      for (const probe of [1, 375, 999, 1441, 99999]) {
        const width = nearestWidth(mode, probe);
        assert.ok(WIDTHS_FOR[mode].some((p) => p.width === width));
      }
    }
  });

  it("reads 1024 as tablet, the one width on two ladders", () => {
    // Deliberate: a stored 1024 far more likely came from somebody checking the
    // tablet boundary than from somebody choosing the smallest desktop.
    assert.equal(modeForWidth(1024), "tablet");
  });

  it("places every other width in exactly one mode", () => {
    for (const mode of MODES) {
      for (const preset of WIDTHS_FOR[mode]) {
        if (preset.width === 1024) continue;
        assert.equal(modeForWidth(preset.width), mode, `${preset.width} landed in the wrong mode`);
      }
    }
  });
});

describe("persistence — local, and validated on the way back in", () => {
  const store = new Map<string, string>();

  const withStorage = (fn: () => void) => {
    const original = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
      },
    };
    try {
      fn();
    } finally {
      if (original === undefined) delete (globalThis as { window?: unknown }).window;
      else (globalThis as { window?: unknown }).window = original;
    }
  };

  afterEach(() => store.clear());

  it("survives a round trip", () => {
    withStorage(() => {
      const state: ViewportState = { mode: "phone", width: 430, zoom: 1.25 };
      saveViewport(state);
      assert.deepEqual(loadViewport(), state);
    });
  });

  it("starts at the desktop default with nothing stored", () => {
    withStorage(() => {
      assert.deepEqual(loadViewport(), DEFAULT_VIEWPORT);
      assert.equal(DEFAULT_VIEWPORT.width, 1440);
      assert.equal(DEFAULT_VIEWPORT.zoom, null);
    });
  });

  it("refuses a width that is not on the ladder", () => {
    // A value from an older build, or one typed into devtools, must not become
    // a viewport — it would light no menu row and could be any number at all.
    withStorage(() => {
      store.set("xite_editor_viewport", JSON.stringify({ mode: "phone", width: 1337, zoom: null }));
      assert.equal(loadViewport().width, DEFAULT_WIDTH.phone);
      assert.equal(loadViewport().mode, "phone");
    });
  });

  it("refuses a zoom that is not one of the levels", () => {
    withStorage(() => {
      store.set("xite_editor_viewport", JSON.stringify({ mode: "desktop", width: 1440, zoom: 9 }));
      assert.equal(loadViewport().zoom, null);
    });
  });

  it("falls back rather than throwing on damaged storage", () => {
    withStorage(() => {
      store.set("xite_editor_viewport", "{not json");
      assert.deepEqual(loadViewport(), DEFAULT_VIEWPORT);
    });
  });

  it("infers the mode when only a width was stored", () => {
    withStorage(() => {
      store.set("xite_editor_viewport", JSON.stringify({ width: 375 }));
      const loaded = loadViewport();
      assert.equal(loaded.mode, "phone");
      assert.equal(loaded.width, 375);
    });
  });

  it("returns the default on the server, where there is no window", () => {
    // The editor renders on the server first. Reading storage there would throw;
    // rendering the stored width there would produce markup the client
    // immediately contradicts.
    const original = (globalThis as { window?: unknown }).window;
    delete (globalThis as { window?: unknown }).window;
    try {
      assert.deepEqual(loadViewport(), DEFAULT_VIEWPORT);
      saveViewport({ mode: "phone", width: 320, zoom: null }); // must not throw
    } finally {
      if (original !== undefined) (globalThis as { window?: unknown }).window = original;
    }
  });
});
