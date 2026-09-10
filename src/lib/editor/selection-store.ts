"use client";

/**
 * The selection: which one thing on the canvas the toolbar is editing.
 *
 * ── Why a store and not a `useState` in EditorStudio ──────────────────────
 *
 * The thing selected is read in three places that do not share a parent worth
 * naming: the canvas wrapper that draws the highlight, the toolbar that switches
 * its controls on `type`, and the document-level listeners that clear it on an
 * outside click or Escape. Threading it through props from the 2,800-line
 * studio component is how the previous button/image/map popups each ended up
 * with their own private copy of "what is selected" — three states that had to
 * be closed in the right order and could disagree.
 *
 * So: one plain store, framework-free, with a React hook over it. No library —
 * `useSyncExternalStore` is React's own, and the store is small enough that a
 * dependency would cost more than it saves.
 *
 * ── What an id is ─────────────────────────────────────────────────────────
 *
 * Elements inside a section carry no ids: a section is a string of HTML, and
 * the canvas rebuilds its DOM whenever that string changes (an undo, another
 * control's edit). So an element is identified by *where* it is —
 * `<sectionId>::<child-index path>` — and re-resolved from that path whenever
 * the DOM has been rebuilt. See `element-resolver.ts`.
 */

import { useSyncExternalStore } from "react";

export type ElementType = "section" | "card" | "button" | "image" | "text";

export interface SelectionState {
  selectedId: string | null;
  type: ElementType | null;
  /** The section the element lives in — the editing context for every write. */
  sectionId?: string;
  /**
   * The element's current props as the toolbar last read them. A snapshot,
   * refreshed on every selection and every commit; the toolbar renders from it
   * so a control never has to touch the DOM to know its own value.
   */
  meta?: Record<string, unknown>;
}

const EMPTY: SelectionState = { selectedId: null, type: null };

type Listener = () => void;

/** Framework-free so it can be unit-tested with `node --test`. */
export function createSelectionStore(initial: SelectionState = EMPTY) {
  let state: SelectionState = initial;
  const listeners = new Set<Listener>();

  const emit = () => listeners.forEach((l) => l());

  return {
    getState: () => state,
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    selectElement(id: string, type: ElementType, sectionId: string, meta?: Record<string, unknown>) {
      // Re-selecting the same thing is a no-op, so a right-click on an already
      // selected card does not reset the toolbar's tab.
      if (state.selectedId === id && state.type === type && state.sectionId === sectionId && meta === undefined) {
        return;
      }
      state = { selectedId: id, type, sectionId, meta: meta ?? {} };
      emit();
    },
    clearSelection() {
      if (state.selectedId === null && state.type === null) return;
      state = EMPTY;
      emit();
    },
    /**
     * Merges new props into the selected element's snapshot. Only the snapshot
     * — applying them to the canvas and writing the section is the controller's
     * job, which calls this afterwards so the toolbar shows what it just did.
     */
    updateElementProps(id: string, newProps: Record<string, unknown>) {
      if (state.selectedId !== id) return;
      state = { ...state, meta: { ...(state.meta ?? {}), ...newProps } };
      emit();
    },
  };
}

export type SelectionStore = ReturnType<typeof createSelectionStore>;

/** The one store the editor uses. Module-scoped: one editor per document. */
export const selectionStore = createSelectionStore();

const getServerSnapshot = () => EMPTY;

/** Subscribes a component to the selection. */
export function useSelection(store: SelectionStore = selectionStore): SelectionState {
  return useSyncExternalStore(store.subscribe, store.getState, getServerSnapshot);
}
