"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  DEFAULT_VIEWPORT,
  VIEWPORT_STORAGE_KEY,
  loadViewport,
  saveViewport,
  type ViewportState,
} from "@/lib/viewport-presets";

/**
 * The stored preview viewport, read the way an external store should be read.
 *
 * ── Why this is not `useState` plus an effect ──────────────────────────────
 *
 * The obvious shape is `useState(DEFAULT)` with `useEffect(() => setState(
 * loadViewport()), [])`, and it is wrong twice over. React 19's linter rejects
 * it outright — a synchronous `setState` in an effect body is a cascading
 * render — and the deeper problem is that it models `localStorage` as
 * initialisation when it is a *source*: another tab can change it, and the
 * effect version would never notice.
 *
 * Reading it lazily in `useState` instead would be worse still: the server has
 * no `localStorage`, so the server would render 1440 and the client would
 * render whatever was stored, and hydration would mismatch.
 *
 * `useSyncExternalStore` is the primitive for exactly this. `getServerSnapshot`
 * gives the server and the hydration pass the plain default, so the markup
 * matches; `getSnapshot` reads storage on the client and React re-renders once
 * after hydration with the real value.
 *
 * ── The module-level snapshot ──────────────────────────────────────────────
 *
 * `getSnapshot` must return a *referentially stable* value — a fresh object each
 * call is an infinite render loop, since React compares snapshots by identity.
 * So the parsed state is cached here and replaced only when it genuinely
 * changes. The cache is module-level rather than per-component on purpose: the
 * editor canvas and the preview dock are one viewport, and two components
 * holding two copies is how they would come to disagree.
 */

let snapshot: ViewportState = DEFAULT_VIEWPORT;
let hasRead = false;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function same(a: ViewportState, b: ViewportState): boolean {
  return a.mode === b.mode && a.width === b.width && a.zoom === b.zoom;
}

/** Re-reads storage and publishes the result if it differs. */
function refresh(): void {
  const next = loadViewport();
  hasRead = true;
  if (same(next, snapshot)) return;
  snapshot = next;
  emit();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);

  /**
   * Cross-tab. `storage` fires in *other* tabs, so a colleague — or the same
   * person in a second window — switching to phone is reflected here rather
   * than being silently overwritten by whichever tab saves last.
   *
   * `event.key === null` means the whole store was cleared, which is also a
   * change to ours.
   */
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === VIEWPORT_STORAGE_KEY) refresh();
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): ViewportState {
  // The first client read. Not emitted — React is asking for the value, not
  // being told it changed, and emitting mid-render would be a re-entrant update.
  if (!hasRead) {
    snapshot = loadViewport();
    hasRead = true;
  }
  return snapshot;
}

function getServerSnapshot(): ViewportState {
  return DEFAULT_VIEWPORT;
}

export function useViewport(): [ViewportState, (next: ViewportState) => void] {
  const viewport = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setViewport = useCallback((next: ViewportState) => {
    saveViewport(next);
    if (same(next, snapshot)) return;
    snapshot = next;
    hasRead = true;
    emit();
  }, []);

  return [viewport, setViewport];
}

/** Resets the module cache. Tests only — nothing in the app should need it. */
export function __resetViewportStore(): void {
  snapshot = DEFAULT_VIEWPORT;
  hasRead = false;
  listeners.clear();
}
