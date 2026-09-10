"use client";

/**
 * The controller between a right-click on the canvas and the section it edits.
 *
 * ── What it owns ──────────────────────────────────────────────────────────
 *
 * - Routing a `contextmenu` event: leaf or card → select it and stop the event
 *   there; section surface → let the caller open the section toolbar.
 * - Applying prop changes to the live element, then writing the section's
 *   code back through the editor's history path — debounced, so dragging a
 *   colour picker is one undo step, not forty.
 * - Keeping the selected node fresh: the canvas rebuilds a section's DOM on
 *   every code change, so the element is re-resolved from its path after each
 *   commit rather than held by reference.
 * - Dismissal: an outside click or Escape clears the selection.
 *
 * ── What it does not own ──────────────────────────────────────────────────
 *
 * Section selection, the section toolbar and inline text editing all predate
 * this and stay where they are. The hook reports "an element in section N was
 * selected" and "a section was right-clicked" and the studio does the rest.
 */

import { useCallback, useEffect, useRef } from "react";

import { recomposeSectionCode } from "@/lib/section-runtime";
import { joinSectionCode, splitSectionCode } from "@/lib/sections/section-managed-css";
import { writeHoverRule } from "@/lib/editor/element-hover-css";
import {
  applyElementProps,
  elementId,
  ensureElementKey,
  parseElementId,
  readElementProps,
  resolvePath,
  resolveTarget,
  type ElementPropsByType,
  type LeafType,
} from "@/lib/editor/element-resolver";
import { selectionStore, useSelection, type SelectionState } from "@/lib/editor/selection-store";
import { sanitizeCleanDom } from "@/components/editor/canvas/useCanvaInteractions";

/** Anything under one of these is editor chrome, and a click there is not "outside". */
const CHROME_SELECTOR = '[data-xite-toolbar], [role="dialog"], .section-toolbar, [data-xite-canvas-chrome]';

const COMMIT_DELAY_MS = 250;

export interface SelectionControllerOptions {
  sections: ReadonlyArray<{ id: string; code: string; title: string }>;
  /** Writes one section's code through the editor's own mutation path. */
  onWriteSection: (sectionId: string, code: string) => void;
  /** An element in this section was selected — the studio marks the section active. */
  onElementSelected?: (sectionIndex: number) => void;
  /** Normalises canvas markup before it is stored (theme tokens, container units). */
  cleanHtml?: (html: string) => string;
}

export interface SelectionController {
  selection: SelectionState;
  /**
   * The live node for the selection, looked up from its path at call time —
   * never held, because the canvas rebuilds a section's DOM on every change.
   */
  resolveSelectedElement: () => HTMLElement | null;
  /**
   * Routes a right-click. Returns `true` when it selected an element and
   * consumed the event; `false` when the click is the section's own and the
   * caller should open the section toolbar.
   */
  handleContextMenu: (event: React.MouseEvent, sectionIndex: number) => boolean;
  /** Applies props to the element now and writes the section shortly after. */
  updateElementProps: <T extends LeafType>(id: string, props: Partial<ElementPropsByType[T]>) => void;
  /** Removes the selected element from its section. */
  deleteElement: () => void;
  clearSelection: () => void;
}

function canvasBoxFor(sectionId: string): HTMLElement | null {
  const wrapper = document.querySelector<HTMLElement>(`[data-xite-section="${sectionId}"]`);
  return wrapper?.querySelector<HTMLElement>(".section-canvas-box") ?? null;
}

export function useSelectionController({
  sections,
  onWriteSection,
  onElementSelected,
  cleanHtml,
}: SelectionControllerOptions): SelectionController {
  const selection = useSelection(selectionStore);

  // Latest values for listeners that must not re-subscribe on every render.
  const sectionsRef = useRef(sections);
  const writeRef = useRef(onWriteSection);
  const cleanRef = useRef(cleanHtml);
  useEffect(() => {
    sectionsRef.current = sections;
    writeRef.current = onWriteSection;
    cleanRef.current = cleanHtml;
  });

  const commitTimer = useRef<number | null>(null);
  const pendingSectionId = useRef<string | null>(null);

  /* ── Resolution ───────────────────────────────────────────────────────── */

  const resolveSelected = useCallback((state: SelectionState): HTMLElement | null => {
    if (!state.selectedId) return null;
    const parsed = parseElementId(state.selectedId);
    if (!parsed) return null;
    const box = canvasBoxFor(parsed.sectionId);
    return box ? resolvePath(box, parsed.path) : null;
  }, []);

  const resolveSelectedElement = useCallback(
    () => resolveSelected(selectionStore.getState()),
    [resolveSelected],
  );

  /**
   * After every commit the canvas may have rebuilt the section. A path that
   * no longer resolves means the structure changed underneath the selection
   * (an undo past a delete, a swap), and the only honest thing is to drop it.
   */
  useEffect(() => {
    if (!selection.selectedId) return;
    if (!resolveSelected(selection)) selectionStore.clearSelection();
  }, [selection, sections, resolveSelected]);

  /* ── Write-back ───────────────────────────────────────────────────────── */

  const writeSectionNow = useCallback((sectionId: string) => {
    const section = sectionsRef.current.find((s) => s.id === sectionId);
    const box = canvasBoxFor(sectionId);
    if (!section || !box) return;

    let body = sanitizeCleanDom(box);
    if (cleanRef.current) body = cleanRef.current(body);
    if (!body) return;

    let code = recomposeSectionCode(section.code, body);

    // Hover rules live in the stylesheet, keyed by the attribute the element
    // was stamped with when its hover colour was first set.
    const hovered = box.querySelectorAll<HTMLElement>("[data-xite-hover-bg], [data-xite-hover-color]");
    if (hovered.length > 0) {
      const parts = splitSectionCode(code);
      let css = parts.headCss;
      hovered.forEach((el) => {
        css = writeHoverRule(css, ensureElementKey(el), {
          background: el.getAttribute("data-xite-hover-bg") ?? "",
          color: el.getAttribute("data-xite-hover-color") ?? "",
        });
      });
      code = joinSectionCode({ ...parts, headCss: css });
    }

    if (code !== section.code) writeRef.current(sectionId, code);
  }, []);

  const flushCommit = useCallback(() => {
    if (commitTimer.current !== null) {
      window.clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
    const sectionId = pendingSectionId.current;
    pendingSectionId.current = null;
    if (sectionId) writeSectionNow(sectionId);
  }, [writeSectionNow]);

  const scheduleCommit = useCallback(
    (sectionId: string) => {
      // A pending write for a different section goes out first, never lost.
      if (pendingSectionId.current && pendingSectionId.current !== sectionId) flushCommit();
      pendingSectionId.current = sectionId;
      if (commitTimer.current !== null) window.clearTimeout(commitTimer.current);
      commitTimer.current = window.setTimeout(flushCommit, COMMIT_DELAY_MS);
    },
    [flushCommit],
  );

  useEffect(() => () => flushCommit(), [flushCommit]);

  /* ── Actions ──────────────────────────────────────────────────────────── */

  const clearSelection = useCallback(() => {
    flushCommit();
    selectionStore.clearSelection();
  }, [flushCommit]);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, sectionIndex: number): boolean => {
      const section = sectionsRef.current[sectionIndex];
      const target = event.target as HTMLElement | null;
      if (!section || !target) return false;
      if (target.closest(CHROME_SELECTOR)) return false;

      const box = canvasBoxFor(section.id);
      const hit = box ? resolveTarget(target, box) : null;
      if (!hit) {
        // The section's own surface: hand it back, with no element selected.
        clearSelection();
        return false;
      }

      // Nothing above this element gets to react: not the section wrapper's
      // own menu, and not the browser's.
      event.preventDefault();
      event.stopPropagation();

      flushCommit();
      const id = elementId(section.id, hit.path);
      const meta = {
        ...readElementProps(hit.type, hit.element),
        tag: hit.element.tagName.toLowerCase(),
        cardPath: hit.cardPath,
      };
      selectionStore.selectElement(id, hit.type, section.id, meta);
      onElementSelected?.(sectionIndex);
      return true;
    },
    [clearSelection, flushCommit, onElementSelected],
  );

  const updateElementProps = useCallback(
    <T extends LeafType>(id: string, props: Partial<ElementPropsByType[T]>) => {
      const state = selectionStore.getState();
      if (state.selectedId !== id || !state.type || state.type === "section" || !state.sectionId) return;
      const element = resolveSelected(state);
      if (!element) return;

      if ("hoverBackground" in props || "hoverTextColor" in props) ensureElementKey(element);
      applyElementProps(state.type as T, element, props);
      selectionStore.updateElementProps(id, props as Record<string, unknown>);
      scheduleCommit(state.sectionId);
    },
    [resolveSelected, scheduleCommit],
  );

  const deleteElement = useCallback(() => {
    const state = selectionStore.getState();
    if (!state.selectedId || !state.sectionId) return;
    const element = resolveSelected(state);
    if (!element) return;
    // Cancel any pending write; the delete's own write supersedes it.
    if (commitTimer.current !== null) window.clearTimeout(commitTimer.current);
    commitTimer.current = null;
    pendingSectionId.current = null;
    element.remove();
    const sectionId = state.sectionId;
    selectionStore.clearSelection();
    writeSectionNow(sectionId);
  }, [resolveSelected, writeSectionNow]);

  /* ── Dismissal ────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!selection.selectedId) return;

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(CHROME_SELECTOR)) return;
      const element = resolveSelected(selectionStore.getState());
      if (element && element.contains(target)) return;
      clearSelection();
    };

    // Capture phase, so this runs before the studio's own Escape handling and
    // an Escape with an element selected clears only that.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const active = document.activeElement as HTMLElement | null;
      if (active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)) {
        active.blur();
        event.stopPropagation();
        return;
      }
      event.stopPropagation();
      clearSelection();
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [selection.selectedId, resolveSelected, clearSelection]);

  return {
    selection,
    resolveSelectedElement,
    handleContextMenu,
    updateElementProps,
    deleteElement,
    clearSelection,
  };
}
