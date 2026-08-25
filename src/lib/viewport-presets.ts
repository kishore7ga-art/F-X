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
 * The canvas previously carried `maxWidth: "100%"`, which collapsed the two: a
 * 1920px selection inside a 900px editor pane became a **900px viewport**, so
 * the site laid itself out for 900 and the operator was shown a desktop preview
 * that was really a small-laptop one. Every width above the pane silently
 * became the pane. Six of the ten desktop widths could not be previewed at all.
 *
 * The width is now real and the fitting is a transform. 1920 stays 1920 to CSS;
 * `scale()` is what makes it visible.
 */

export type DeviceMode = "desktop" | "tablet" | "phone";

export type ViewportPreset = {
  /** CSS pixels the site is laid out against. */
  width: number;
  /** What the operator is shown. Blank where the number speaks for itself. */
  note?: string;
};

/**
 * Desktop widths, from the smallest laptop still worth checking to 4K.
 *
 * 1024 is here as well as in the tablet list on purpose: it is the boundary,
 * and which side of it a layout falls on is exactly what somebody checking
 * 1024 wants to know.
 */
export const DESKTOP_WIDTHS: readonly ViewportPreset[] = [
  { width: 1024, note: "Small laptop" },
  { width: 1280 },
  { width: 1366, note: "Most common laptop" },
  { width: 1440, note: "Default" },
  { width: 1536 },
  { width: 1600 },
  { width: 1920, note: "Full HD" },
  { width: 2560, note: "QHD" },
  { width: 2880 },
  { width: 3840, note: "4K" },
] as const;

export const TABLET_WIDTHS: readonly ViewportPreset[] = [
  { width: 600 },
  { width: 640 },
  { width: 667 },
  { width: 720 },
  { width: 768, note: "iPad portrait · default" },
  { width: 800 },
  { width: 834, note: "iPad Air" },
  { width: 900 },
  { width: 960 },
  { width: 1024, note: "iPad landscape" },
] as const;

export const PHONE_WIDTHS: readonly ViewportPreset[] = [
  { width: 320, note: "iPhone SE (1st gen)" },
  { width: 360, note: "Most common Android" },
  { width: 375, note: "iPhone SE / 8" },
  { width: 390, note: "iPhone 14 · default" },
  { width: 393, note: "Pixel 7" },
  { width: 412, note: "Pixel 7 Pro" },
  { width: 414, note: "iPhone Plus" },
  { width: 430, note: "iPhone Pro Max" },
  { width: 480 },
  { width: 540 },
] as const;

export const WIDTHS_FOR: Record<DeviceMode, readonly ViewportPreset[]> = {
  desktop: DESKTOP_WIDTHS,
  tablet: TABLET_WIDTHS,
  phone: PHONE_WIDTHS,
};

/** Where each mode starts. */
export const DEFAULT_WIDTH: Record<DeviceMode, number> = {
  desktop: 1440,
  tablet: 768,
  phone: 390,
};

export const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

/**
 * The whole preview state. One object, so nothing can hold half of it.
 *
 * A `zoom` of `null` is "fit", and it is deliberately not one of the levels:
 * fit means "make the selected width visible, whatever that takes", a number
 * derived from the pane rather than one the operator picked. Storing it as a
 * percentage would freeze it at whatever the pane happened to be at the time,
 * so that opening a drawer, or reopening the editor on another screen, would
 * leave the canvas at a scale nobody chose and nothing would correct it.
 */
export type ViewportState = {
  mode: DeviceMode;
  /** CSS pixels. Always one of the presets for `mode`. */
  width: number;
  /** An explicit choice, or `null` while fitting to the pane. */
  zoom: ZoomLevel | null;
};

export const DEFAULT_VIEWPORT: ViewportState = {
  mode: "desktop",
  width: DEFAULT_WIDTH.desktop,
  zoom: null,
};

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
export function effectiveScale(state: ViewportState, availableWidth: number): number {
  if (state.zoom !== null) return state.zoom;
  if (!Number.isFinite(availableWidth) || availableWidth <= 0) return 1;
  return Math.min(1, availableWidth / state.width);
}

/** The nearest preset to `width` within `mode`. Used when switching modes. */
export function nearestWidth(mode: DeviceMode, width: number): number {
  const presets = WIDTHS_FOR[mode];
  let best = presets[0]!.width;
  let bestGap = Math.abs(best - width);

  for (const preset of presets) {
    const gap = Math.abs(preset.width - width);
    if (gap < bestGap) {
      best = preset.width;
      bestGap = gap;
    }
  }
  return best;
}

/**
 * Which mode a width belongs to, for restoring a persisted selection.
 *
 * 1024 appears in two lists; tablet wins, because a stored 1024 is far more
 * likely to have come from someone checking the tablet boundary than from
 * someone choosing the smallest desktop.
 */
export function modeForWidth(width: number): DeviceMode {
  if (PHONE_WIDTHS.some((p) => p.width === width)) return "phone";
  if (TABLET_WIDTHS.some((p) => p.width === width)) return "tablet";
  return "desktop";
}

/** Exported so the store hook can tell a cross-tab `storage` event apart. */
export const VIEWPORT_STORAGE_KEY = "xite_editor_viewport";
const STORAGE_KEY = VIEWPORT_STORAGE_KEY;

/**
 * Remembered per browser, not per site.
 *
 * Which width somebody is checking is a property of the person and the moment,
 * not of the website — so it does not belong in the database, and storing it
 * there would also make it a value two open tabs could fight over. It is also
 * deliberately not part of the site's saved content: switching to phone must
 * never be a change to the page.
 */
export function loadViewport(): ViewportState {
  if (typeof window === "undefined") return DEFAULT_VIEWPORT;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VIEWPORT;

    const parsed = JSON.parse(raw) as Partial<ViewportState>;
    const width = Number(parsed.width);
    if (!Number.isFinite(width)) return DEFAULT_VIEWPORT;

    // Validated against the presets rather than trusted: a width from an older
    // build, or one somebody typed into devtools, must not become a viewport.
    const mode: DeviceMode =
      parsed.mode === "phone" || parsed.mode === "tablet" || parsed.mode === "desktop"
        ? parsed.mode
        : modeForWidth(width);

    const known = WIDTHS_FOR[mode].some((preset) => preset.width === width);
    const zoom = ZOOM_LEVELS.includes(parsed.zoom as ZoomLevel) ? (parsed.zoom as ZoomLevel) : null;

    return { mode, width: known ? width : DEFAULT_WIDTH[mode], zoom };
  } catch {
    return DEFAULT_VIEWPORT;
  }
}

export function saveViewport(state: ViewportState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // A browser with storage disabled simply does not remember. Not worth an
    // error path: the editor works identically, it just starts at the default.
  }
}
