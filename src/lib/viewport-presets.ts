/**
 * The widths a site can be previewed at, and the two numbers that decide how
 * one is shown.
 *
 * ── The distinction this file exists to keep ───────────────────────────────
 *
 * A preview has two independent sizes, and conflating them is the bug that
 * makes a responsive preview lie:
 *
 *   viewport width   what the site's CSS is laid out against. 1920 means the
 *                    site believes it has 1920 pixels, and its breakpoints,
 *                    columns and type scale respond accordingly.
 *
 *   zoom             how big that is drawn on screen. Purely visual. It must
 *                    never reach the site's CSS.
 *
 * ── Where the widths come from ─────────────────────────────────────────────
 *
 * Not from here. This file used to list thirty of them, and every new phone
 * was a frontend release. The list is now a *catalogue* the backend serves
 * (`GET /api/v1/device-presets`): tiers, and presets grouped under them. This
 * file holds the shape of that catalogue and the rules for moving through it —
 * cycle within a tier, switch between tiers remembering where each was left,
 * and reconcile a stored choice against a catalogue that has since changed.
 * Every function is pure over the catalogue it is handed, so the rules are
 * testable with a fixture and identical whatever the backend sends.
 *
 * The single width that *is* here — `DEFAULT_VIEWPORT` — is the one the server
 * renders before any catalogue has arrived, so that hydration matches. It is
 * replaced by a reconcile the moment the catalogue loads.
 */

/* ── The catalogue, as the backend serves it ──────────────────────────────── */

/** The glyph a tier is drawn with. A closed set: the section toolbar writes
 *  CSS to three tiers, and this is what maps a tier somebody named onto them. */
export type DeviceIcon = "phone" | "tablet" | "desktop";

export type DeviceTier = {
  id: string;
  label: string;
  icon: DeviceIcon;
  order: number;
};

export type DevicePreset = {
  id: string;
  tierId: string;
  /** CSS pixels the site is laid out against. */
  width: number;
  /** What the operator is shown. Blank where the number speaks for itself. */
  note?: string | null;
  isDefault?: boolean;
};

export type DeviceCatalogue = {
  /** Monotonic; the backend bumps it on every change. Compared to skip work. */
  version: number;
  tiers: DeviceTier[];
  presets: DevicePreset[];
};

/** Before anything has loaded. Referentially stable — it is a server snapshot. */
export const EMPTY_CATALOGUE: DeviceCatalogue = Object.freeze({
  version: 0,
  tiers: [],
  presets: [],
}) as DeviceCatalogue;

/** A tier's presets, ascending by width. Tolerates a backend that did not sort. */
export function presetsForTier(catalogue: DeviceCatalogue, tierId: string): DevicePreset[] {
  return catalogue.presets.filter((p) => p.tierId === tierId).sort((a, b) => a.width - b.width);
}

/** Tiers in display order. */
export function orderedTiers(catalogue: DeviceCatalogue): DeviceTier[] {
  return [...catalogue.tiers].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function tierById(catalogue: DeviceCatalogue, tierId: string): DeviceTier | null {
  return catalogue.tiers.find((t) => t.id === tierId) ?? null;
}

/** The width a tier starts at: its default, else its smallest, else null if empty. */
export function tierDefaultWidth(catalogue: DeviceCatalogue, tierId: string): number | null {
  const presets = presetsForTier(catalogue, tierId);
  if (presets.length === 0) return null;
  return (presets.find((p) => p.isDefault) ?? presets[0]!).width;
}

/** The first tier that has any presets, in display order. */
export function firstUsableTier(catalogue: DeviceCatalogue): DeviceTier | null {
  return orderedTiers(catalogue).find((t) => presetsForTier(catalogue, t.id).length > 0) ?? null;
}

/* ── Zoom ─────────────────────────────────────────────────────────────────── */

export const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

/* ── The state ────────────────────────────────────────────────────────────── */

/**
 * The whole preview state. One object, so nothing can hold half of it.
 *
 * `mode` is a tier id from the catalogue. `memory` is the width last viewed
 * in each tier, keyed by tier id, so switching Phone → Tablet → Phone returns
 * to the phone width that was being looked at rather than the tier's default.
 *
 * A `zoom` of `null` is "fit", and it is deliberately not one of the levels:
 * fit means "make the selected width visible, whatever that takes", a number
 * derived from the pane rather than one the operator picked. Storing it as a
 * percentage would freeze it at whatever the pane happened to be at the time.
 */
export type ViewportState = {
  mode: string;
  /** CSS pixels. Reconciled against the catalogue whenever either changes. */
  width: number;
  /** An explicit choice, or `null` while fitting to the pane. */
  zoom: ZoomLevel | null;
  /** Last-viewed width per tier. */
  memory: Record<string, number>;
};

/**
 * The one width the frontend knows without asking. It is what the server
 * renders, so that the client hydrates to the same markup; the first
 * reconcile against the catalogue replaces it. Not a preset — a placeholder.
 */
export const DEFAULT_VIEWPORT: ViewportState = {
  mode: "desktop",
  width: 1440,
  zoom: null,
  memory: {},
};

export function sameViewport(a: ViewportState, b: ViewportState): boolean {
  if (a.mode !== b.mode || a.width !== b.width || a.zoom !== b.zoom) return false;
  const ka = Object.keys(a.memory);
  const kb = Object.keys(b.memory);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a.memory[k] === b.memory[k]);
}

/**
 * The scale to draw at.
 *
 * With an explicit zoom, that zoom — even when it overflows the pane, because
 * an operator who asked for 150% wants 150% and can scroll.
 *
 * Without one, the scale that makes the selected width fit, capped at 1: a
 * 390px phone inside a 1200px pane is shown at 390px, not blown up to fill the
 * space. Enlarging would misrepresent both the layout and the type size, which
 * is the whole thing being inspected.
 */
export function effectiveScale(state: { width: number; zoom: ZoomLevel | null }, availableWidth: number): number {
  if (state.zoom !== null) return state.zoom;
  if (!Number.isFinite(availableWidth) || availableWidth <= 0) return 1;
  return Math.min(1, availableWidth / state.width);
}

/* ── Moving through the catalogue ─────────────────────────────────────────── */

/** The nearest of `presets` to `width`; ties go to the smaller. */
export function nearestPreset(presets: readonly DevicePreset[], width: number): DevicePreset | null {
  let best: DevicePreset | null = null;
  for (const preset of presets) {
    if (!best || Math.abs(preset.width - width) < Math.abs(best.width - width)) best = preset;
  }
  return best;
}

/** Position of the current width in its tier: `{ index, total }`, 0-based. */
export function positionInTier(state: ViewportState, catalogue: DeviceCatalogue): { index: number; total: number } {
  const presets = presetsForTier(catalogue, state.mode);
  return { index: presets.findIndex((p) => p.width === state.width), total: presets.length };
}

/**
 * The next width in the current tier, wrapping from the last back to the
 * first. A tier with one width returns the state unchanged — there is nowhere
 * to go, and the caller can tell because the object is the same one.
 */
export function cycleWidth(state: ViewportState, catalogue: DeviceCatalogue, direction: 1 | -1 = 1): ViewportState {
  const presets = presetsForTier(catalogue, state.mode);
  if (presets.length <= 1) return state;
  const current = presets.findIndex((p) => p.width === state.width);
  // A width not on the ladder (mid-update) steps from its nearest neighbour.
  const from = current >= 0 ? current : presets.indexOf(nearestPreset(presets, state.width)!);
  const next = presets[(from + direction + presets.length) % presets.length]!;
  return { ...state, width: next.width, memory: { ...state.memory, [state.mode]: next.width } };
}

/**
 * Switching tier goes back to where that tier was left, when that width is
 * still offered; otherwise to the tier's default. Switching to the tier
 * already active is a cycle, so one button does both without a menu.
 */
export function switchTier(state: ViewportState, catalogue: DeviceCatalogue, tierId: string): ViewportState {
  if (tierId === state.mode) return cycleWidth(state, catalogue);
  const presets = presetsForTier(catalogue, tierId);
  if (presets.length === 0) return state;
  const remembered = state.memory[tierId];
  const width =
    remembered !== undefined && presets.some((p) => p.width === remembered)
      ? remembered
      : tierDefaultWidth(catalogue, tierId)!;
  return {
    ...state,
    mode: tierId,
    width,
    memory: { ...state.memory, [state.mode]: state.width, [tierId]: width },
  };
}

export function cycleZoom(state: ViewportState): ViewportState {
  // Fit → 50 → 75 → 100 → 125 → 150 → Fit.
  if (state.zoom === null) return { ...state, zoom: ZOOM_LEVELS[0] };
  const at = ZOOM_LEVELS.indexOf(state.zoom);
  const next = ZOOM_LEVELS[at + 1];
  return { ...state, zoom: next ?? null };
}

/**
 * A stored state made valid against the catalogue it is now shown with.
 *
 * Returns the **same object** when nothing needs to change, so a catalogue
 * refresh that altered nothing relevant causes no state write, no re-render
 * and no flicker on the canvas. When something did change:
 *
 *   - the tier no longer exists → the first tier that has widths
 *   - the tier exists but is now empty → likewise
 *   - the width is no longer in the tier → the nearest width that is; a
 *     removed 414 lands on 412, not on the default, so the operator keeps
 *     looking at roughly what they were looking at
 *   - remembered widths that are no longer offered are forgotten
 *
 * An empty catalogue (nothing loaded yet, or nothing configured) leaves the
 * state alone: there is nothing to reconcile against, and the placeholder
 * width keeps the canvas drawable until there is.
 */
export function reconcileViewport(state: ViewportState, catalogue: DeviceCatalogue): ViewportState {
  if (catalogue.presets.length === 0) return state;

  let mode = state.mode;
  let presets = presetsForTier(catalogue, mode);
  let width: number;
  if (presets.length === 0) {
    // The tier is gone or empty. A width from another tier means nothing
    // here, so this is a switch: what was last viewed in the new tier, else
    // its default.
    const fallback = firstUsableTier(catalogue);
    if (!fallback) return state;
    mode = fallback.id;
    presets = presetsForTier(catalogue, mode);
    const remembered = state.memory[mode];
    width =
      remembered !== undefined && presets.some((p) => p.width === remembered)
        ? remembered
        : tierDefaultWidth(catalogue, mode)!;
  } else {
    width = presets.some((p) => p.width === state.width)
      ? state.width
      : nearestPreset(presets, state.width)!.width;
  }

  const memory: Record<string, number> = {};
  for (const [tierId, remembered] of Object.entries(state.memory)) {
    if (presetsForTier(catalogue, tierId).some((p) => p.width === remembered)) memory[tierId] = remembered;
  }
  memory[mode] = width;

  const next: ViewportState = { mode, width, zoom: state.zoom, memory };
  return sameViewport(next, state) ? state : next;
}

/* ── Persistence ──────────────────────────────────────────────────────────── */

/** Exported so the store hook can tell a cross-tab `storage` event apart. */
export const VIEWPORT_STORAGE_KEY = "xite_editor_viewport";

/**
 * Remembered per browser, not per site.
 *
 * Which width somebody is checking is a property of the person and the moment,
 * not of the website — so it does not belong in the database, and storing it
 * there would also make it a value two open tabs could fight over. It is also
 * deliberately not part of the site's saved content: switching to phone must
 * never be a change to the page.
 *
 * Validated for *shape* only. Whether the width is one the catalogue offers is
 * `reconcileViewport`'s question, answered once the catalogue is here.
 */
export function loadViewport(): ViewportState {
  if (typeof window === "undefined") return DEFAULT_VIEWPORT;

  try {
    const raw = window.localStorage.getItem(VIEWPORT_STORAGE_KEY);
    if (!raw) return DEFAULT_VIEWPORT;

    const parsed = JSON.parse(raw) as Partial<ViewportState>;
    const width = Number(parsed.width);
    if (!Number.isFinite(width) || width <= 0) return DEFAULT_VIEWPORT;
    const mode = typeof parsed.mode === "string" && parsed.mode ? parsed.mode : DEFAULT_VIEWPORT.mode;
    const zoom = ZOOM_LEVELS.includes(parsed.zoom as ZoomLevel) ? (parsed.zoom as ZoomLevel) : null;

    const memory: Record<string, number> = {};
    if (parsed.memory && typeof parsed.memory === "object") {
      for (const [tierId, remembered] of Object.entries(parsed.memory)) {
        if (Number.isFinite(remembered) && (remembered as number) > 0) memory[tierId] = remembered as number;
      }
    }
    memory[mode] = width;

    return { mode, width, zoom, memory };
  } catch {
    return DEFAULT_VIEWPORT;
  }
}

export function saveViewport(state: ViewportState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // A browser with storage disabled simply does not remember. Not worth an
    // error path: the editor works identically, it just starts at the default.
  }
}
