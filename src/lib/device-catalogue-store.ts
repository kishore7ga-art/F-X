"use client";

/**
 * The device catalogue, fetched once and kept fresh — the external store the
 * viewport reads its tiers and widths from.
 *
 * ── Why no flicker ─────────────────────────────────────────────────────────
 *
 * Three things keep the canvas still while this loads and refreshes:
 *
 *  1. The last catalogue is cached in `localStorage`, so a reload has tiers
 *     and widths before the network answers. The stored viewport was chosen
 *     from that catalogue, so it is already valid against it.
 *  2. A response whose `version` matches what is held is dropped without
 *     emitting. Subscribers see one referentially-stable object per version,
 *     which is what `useSyncExternalStore` needs to skip a render.
 *  3. Refreshes are background: on window focus and every few minutes, never
 *     blocking, and a failure keeps whatever is held. The catalogue is a
 *     ladder of numbers; a stale ladder is entirely usable.
 *
 * The frontend still holds no widths. `EMPTY_CATALOGUE` is what is served
 * before anything loads, and the viewport code treats it as "nothing to
 * reconcile against".
 */

import { useSyncExternalStore } from "react";

import { api } from "@/lib/api-client";
import { EMPTY_CATALOGUE, type DeviceCatalogue } from "@/lib/viewport-presets";

export const CATALOGUE_STORAGE_KEY = "xite_device_catalogue";
const CATALOGUE_PATH = "/api/v1/device-presets";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

let snapshot: DeviceCatalogue = EMPTY_CATALOGUE;
let hasRead = false;
let inFlight: Promise<void> | null = null;
let lastFetchedAt = 0;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function isCatalogue(value: unknown): value is DeviceCatalogue {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<DeviceCatalogue>;
  return typeof v.version === "number" && Array.isArray(v.tiers) && Array.isArray(v.presets);
}

/** Normalises what came off the wire to exactly the fields the app reads. */
function fromWire(value: DeviceCatalogue): DeviceCatalogue {
  return {
    version: value.version,
    tiers: value.tiers
      .filter((t) => t && typeof t.id === "string" && typeof t.icon === "string")
      .map((t) => ({ id: t.id, label: String(t.label ?? t.id), icon: t.icon, order: Number(t.order) || 0 })),
    presets: value.presets
      .filter((p) => p && typeof p.tierId === "string" && Number.isFinite(p.width) && p.width > 0)
      .map((p) => ({
        id: String(p.id ?? `${p.tierId}-${p.width}`),
        tierId: p.tierId,
        width: p.width,
        note: p.note ?? null,
        isDefault: Boolean(p.isDefault),
      })),
  };
}

function readCached(): DeviceCatalogue {
  if (typeof window === "undefined") return EMPTY_CATALOGUE;
  try {
    const raw = window.localStorage.getItem(CATALOGUE_STORAGE_KEY);
    if (!raw) return EMPTY_CATALOGUE;
    const parsed: unknown = JSON.parse(raw);
    return isCatalogue(parsed) ? fromWire(parsed) : EMPTY_CATALOGUE;
  } catch {
    return EMPTY_CATALOGUE;
  }
}

function writeCached(catalogue: DeviceCatalogue): void {
  try {
    window.localStorage.setItem(CATALOGUE_STORAGE_KEY, JSON.stringify(catalogue));
  } catch {
    // Storage disabled: the next load fetches instead. Nothing else changes.
  }
}

/** Publishes a catalogue if it is newer than what is held. */
function accept(next: DeviceCatalogue): void {
  if (next.version === snapshot.version && snapshot !== EMPTY_CATALOGUE) return;
  snapshot = next;
  hasRead = true;
  writeCached(next);
  emit();
}

/** Fetches unless a fetch is already in flight or one finished very recently. */
export function refreshDeviceCatalogue(force = false): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (inFlight) return inFlight;
  if (!force && Date.now() - lastFetchedAt < 5_000) return Promise.resolve();

  inFlight = api<unknown>(CATALOGUE_PATH)
    .then((payload) => {
      if (isCatalogue(payload)) accept(fromWire(payload));
    })
    .catch(() => {
      // Kept: whatever is held stays usable. The next focus tries again.
    })
    .finally(() => {
      inFlight = null;
      lastFetchedAt = Date.now();
    });
  return inFlight;
}

/* The window listeners exist while anyone is subscribed — attached when the
   first subscriber arrives, detached when the last one leaves. */
let subscribers = 0;
let detachWindow: (() => void) | null = null;

function attachWindow(): () => void {
  const onFocus = () => void refreshDeviceCatalogue();
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CATALOGUE_STORAGE_KEY && event.key !== null) return;
    const cached = readCached();
    // A cleared store is not a newer catalogue.
    if (cached.presets.length > 0) accept(cached);
  };
  const timer = window.setInterval(() => void refreshDeviceCatalogue(), REFRESH_INTERVAL_MS);
  window.addEventListener("focus", onFocus);
  window.addEventListener("storage", onStorage);
  void refreshDeviceCatalogue();
  return () => {
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("storage", onStorage);
    window.clearInterval(timer);
  };
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (subscribers++ === 0) detachWindow = attachWindow();

  return () => {
    listeners.delete(onChange);
    if (--subscribers === 0) {
      detachWindow?.();
      detachWindow = null;
    }
  };
}

function getSnapshot(): DeviceCatalogue {
  if (!hasRead) {
    snapshot = readCached();
    hasRead = true;
  }
  return snapshot;
}

function getServerSnapshot(): DeviceCatalogue {
  return EMPTY_CATALOGUE;
}

export function useDeviceCatalogue(): DeviceCatalogue {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Resets the module cache. Tests only. */
export function __resetDeviceCatalogueStore(): void {
  snapshot = EMPTY_CATALOGUE;
  hasRead = false;
  inFlight = null;
  lastFetchedAt = 0;
  listeners.clear();
  subscribers = 0;
  detachWindow?.();
  detachWindow = null;
}
