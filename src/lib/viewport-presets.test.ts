import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  DEFAULT_VIEWPORT,
  EMPTY_CATALOGUE,
  ZOOM_LEVELS,
  cycleWidth,
  cycleZoom,
  effectiveScale,
  firstUsableTier,
  loadViewport,
  orderedTiers,
  positionInTier,
  presetsForTier,
  reconcileViewport,
  saveViewport,
  switchTier,
  tierDefaultWidth,
  type DeviceCatalogue,
  type ViewportState,
} from "./viewport-presets";

/**
 * The rules for moving through a catalogue the backend serves.
 *
 * Nothing here knows a real width. The fixture is small and deliberately
 * awkward — tiers out of order, a default that is not the smallest, a tier
 * with one width, a tier with none — because those are the shapes a live
 * catalogue will take, and the control must cycle through whatever it is
 * given without a special case for any of them.
 */

const catalogue: DeviceCatalogue = {
  version: 7,
  tiers: [
    { id: "phone", label: "Phone", icon: "phone", order: 2 },
    { id: "desktop", label: "Desktop", icon: "desktop", order: 0 },
    { id: "tablet", label: "Tablet", icon: "tablet", order: 1 },
    { id: "watch", label: "Watch", icon: "phone", order: 3 },
  ],
  presets: [
    { id: "d3", tierId: "desktop", width: 1920 },
    { id: "d1", tierId: "desktop", width: 1024 },
    { id: "d2", tierId: "desktop", width: 1440, isDefault: true },
    { id: "t1", tierId: "tablet", width: 768, isDefault: true },
    { id: "p1", tierId: "phone", width: 360 },
    { id: "p2", tierId: "phone", width: 390, isDefault: true },
    { id: "p3", tierId: "phone", width: 430 },
  ],
};

const at = (mode: string, width: number, memory: Record<string, number> = {}): ViewportState => ({
  mode,
  width,
  zoom: null,
  memory: { ...memory, [mode]: width },
});

describe("reading the catalogue", () => {
  it("orders tiers by their order field and presets by width", () => {
    assert.deepEqual(orderedTiers(catalogue).map((t) => t.id), ["desktop", "tablet", "phone", "watch"]);
    assert.deepEqual(presetsForTier(catalogue, "desktop").map((p) => p.width), [1024, 1440, 1920]);
    assert.deepEqual(presetsForTier(catalogue, "watch"), []);
  });

  it("starts a tier at its default, else its smallest, else nowhere", () => {
    assert.equal(tierDefaultWidth(catalogue, "desktop"), 1440);
    assert.equal(tierDefaultWidth({ ...catalogue, presets: catalogue.presets.map((p) => ({ ...p, isDefault: false })) }, "desktop"), 1024);
    assert.equal(tierDefaultWidth(catalogue, "watch"), null);
    assert.equal(firstUsableTier(catalogue)?.id, "desktop");
    assert.equal(firstUsableTier(EMPTY_CATALOGUE), null);
  });
});

describe("cycling within a tier — one click, no menu", () => {
  it("steps to the next width and wraps from the last to the first", () => {
    let state = at("phone", 360);
    state = cycleWidth(state, catalogue);
    assert.equal(state.width, 390);
    state = cycleWidth(state, catalogue);
    assert.equal(state.width, 430);
    state = cycleWidth(state, catalogue);
    assert.equal(state.width, 360);
    assert.equal(cycleWidth(state, catalogue, -1).width, 430);
  });

  it("returns the same object for a single-width tier, so nothing re-renders", () => {
    const state = at("tablet", 768);
    assert.equal(cycleWidth(state, catalogue), state);
  });

  it("steps from the nearest rung when the width is not on the ladder", () => {
    // 400 is between 390 and 430; nearest is 390, so next is 430.
    assert.equal(cycleWidth(at("phone", 400), catalogue).width, 430);
  });

  it("remembers the new width for its tier", () => {
    const state = cycleWidth(at("phone", 360), catalogue);
    assert.equal(state.memory.phone, 390);
  });

  it("reports the rung for the control to show", () => {
    assert.deepEqual(positionInTier(at("phone", 390), catalogue), { index: 1, total: 3 });
    assert.deepEqual(positionInTier(at("phone", 400), catalogue), { index: -1, total: 3 });
  });
});

describe("switching tiers — memory per tier", () => {
  it("goes to the tier's default the first time", () => {
    const state = switchTier(at("desktop", 1920), catalogue, "phone");
    assert.equal(state.mode, "phone");
    assert.equal(state.width, 390);
  });

  it("returns to the width last viewed in that tier", () => {
    let state = at("phone", 430);
    state = switchTier(state, catalogue, "desktop");
    assert.equal(state.width, 1440);
    state = cycleWidth(state, catalogue);
    assert.equal(state.width, 1920);
    state = switchTier(state, catalogue, "phone");
    assert.equal(state.width, 430);
    state = switchTier(state, catalogue, "desktop");
    assert.equal(state.width, 1920);
    assert.deepEqual(state.memory, { phone: 430, desktop: 1920 });
  });

  it("ignores a remembered width the catalogue no longer offers", () => {
    const state = switchTier(at("desktop", 1440, { phone: 999 }), catalogue, "phone");
    assert.equal(state.width, 390);
  });

  it("cycles when the tier is the active one, and refuses an empty tier", () => {
    const state = at("phone", 360);
    assert.equal(switchTier(state, catalogue, "phone").width, 390);
    assert.equal(switchTier(state, catalogue, "watch"), state);
  });
});

describe("reconcile — a stored choice against a catalogue that moved", () => {
  it("is the same object when nothing needs to change", () => {
    const state = at("phone", 390, { desktop: 1920 });
    assert.equal(reconcileViewport(state, catalogue), state);
  });

  it("leaves the state alone until a catalogue exists", () => {
    const state = at("anything", 1234);
    assert.equal(reconcileViewport(state, EMPTY_CATALOGUE), state);
  });

  it("moves a removed width to its nearest neighbour, not the default", () => {
    const smaller = { ...catalogue, presets: catalogue.presets.filter((p) => p.width !== 430) };
    const state = reconcileViewport(at("phone", 430), smaller);
    assert.equal(state.width, 390);
    assert.equal(state.memory.phone, 390);
  });

  it("falls to the first usable tier when the tier vanished or emptied", () => {
    assert.equal(reconcileViewport(at("gone", 500), catalogue).mode, "desktop");
    assert.equal(reconcileViewport(at("watch", 200), catalogue).mode, "desktop");
    assert.equal(reconcileViewport(at("watch", 200), catalogue).width, 1440);
  });

  it("forgets remembered widths that are no longer offered, keeps the rest", () => {
    const state = reconcileViewport(at("phone", 390, { desktop: 1920, tablet: 700 }), catalogue);
    assert.deepEqual(state.memory, { desktop: 1920, phone: 390 });
  });

  it("keeps the zoom whatever else moves", () => {
    const state: ViewportState = { ...at("gone", 500), zoom: 1.5 };
    assert.equal(reconcileViewport(state, catalogue).zoom, 1.5);
  });
});

describe("zoom — the other number, cycled the same way", () => {
  it("goes Fit → each level → Fit", () => {
    let state: ViewportState = at("phone", 390);
    const seen: (number | null)[] = [];
    for (let i = 0; i <= ZOOM_LEVELS.length; i++) {
      state = cycleZoom(state);
      seen.push(state.zoom);
    }
    assert.deepEqual(seen, [...ZOOM_LEVELS, null]);
  });

  it("never lets the scale change the width", () => {
    for (const zoom of [null, ...ZOOM_LEVELS]) {
      const state: ViewportState = { ...at("desktop", 1920), zoom };
      effectiveScale(state, 880);
      assert.equal(state.width, 1920);
    }
  });

  it("shrinks to fit, never enlarges, and honours an explicit zoom", () => {
    assert.equal(effectiveScale({ width: 1920, zoom: null }, 960), 0.5);
    assert.equal(effectiveScale({ width: 390, zoom: null }, 1200), 1);
    assert.equal(effectiveScale({ width: 390, zoom: 1.5 }, 300), 1.5);
    assert.equal(effectiveScale({ width: 1920, zoom: null }, 0), 1);
  });
});

describe("persistence — local, validated for shape on the way back in", () => {
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

  it("survives a round trip, memory included", () => {
    withStorage(() => {
      const state: ViewportState = { mode: "phone", width: 430, zoom: 1.25, memory: { phone: 430, desktop: 1920 } };
      saveViewport(state);
      assert.deepEqual(loadViewport(), state);
    });
  });

  it("starts at the placeholder with nothing stored", () => {
    withStorage(() => assert.deepEqual(loadViewport(), DEFAULT_VIEWPORT));
  });

  it("keeps an unknown width — the catalogue decides, not the loader", () => {
    withStorage(() => {
      store.set("xite_editor_viewport", JSON.stringify({ mode: "phone", width: 999, zoom: null }));
      const state = loadViewport();
      assert.equal(state.width, 999);
      assert.equal(reconcileViewport(state, catalogue).width, 430);
    });
  });

  it("refuses a zoom that is not one of the levels, and damaged storage", () => {
    withStorage(() => {
      store.set("xite_editor_viewport", JSON.stringify({ mode: "phone", width: 390, zoom: 3 }));
      assert.equal(loadViewport().zoom, null);
      store.set("xite_editor_viewport", "{not json");
      assert.deepEqual(loadViewport(), DEFAULT_VIEWPORT);
      store.set("xite_editor_viewport", JSON.stringify({ mode: "phone", width: -5 }));
      assert.deepEqual(loadViewport(), DEFAULT_VIEWPORT);
    });
  });
});
