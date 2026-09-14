"use client";

/**
 * The controller between canvas interactions (left-click, right-click) and the section it edits.
 *
 * ── What it owns ──────────────────────────────────────────────────────────
 *
 * - Routing contextmenu & click events: resolves element hierarchy, updates selectionStore.
 * - Right-click context menu state (position, open/close).
 * - Applying prop changes to the live element, then writing the section's
 *   code back through the editor's history path — debounced for smooth live editing.
 * - Element operations: delete, duplicate, move up/down, heading level change, ancestor selection.
 * - Re-resolving elements after DOM rebuilds.
 * - Dismissal: an outside click or Escape clears the selection and context menu.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { recomposeSectionCode } from "@/lib/section-runtime";
import { joinSectionCode, splitSectionCode } from "@/lib/sections/section-managed-css";
import { writeHoverRule } from "@/lib/editor/element-hover-css";
import {
  applyElementProps,
  changeHeadingTagDom,
  duplicateElementDom,
  elementId,
  ensureElementKey,
  getAncestorHierarchy,
  moveElementDom,
  parseElementId,
  pathOf,
  readElementProps,
  replaceImageWithVideoDom,
  replaceImageWithYouTubeDom,
  replacePlusWithElementDom,
  replaceVideoWithImageDom,
  replaceVideoWithYouTubeDom,
  replaceYouTubeWithImageDom,
  replaceYouTubeWithVideoDom,
  resolvePath,
  resolveTarget,
  type ElementPropsByType,
  type HeadingLevel,
  type LeafType,
} from "@/lib/editor/element-resolver";
import {
  selectionStore,
  useSelection,
  type ElementType,
  type SelectionState,
} from "@/lib/editor/selection-store";
import { sanitizeCleanDom } from "@/components/editor/canvas/useCanvaInteractions";

/** Anything under one of these is editor chrome, and a click there is not "outside". */
const CHROME_SELECTOR = '[data-xite-toolbar], [role="dialog"], .section-toolbar, [data-xite-canvas-chrome], [data-xite-context-menu]';

const COMMIT_DELAY_MS = 250;

export interface SelectionControllerOptions {
  sections: ReadonlyArray<{ id: string; code: string; title: string }>;
  /** Writes one section's code through the editor's own mutation path. */
  onWriteSection: (sectionId: string, code: string) => void;
  /** An element in this section was selected — the studio marks the section active. */
  onElementSelected?: (sectionIndex: number) => void;
  /**
   * A right-click on text. Return true to claim the event for inline editing.
   */
  onTextHit?: (element: HTMLElement, sectionIndex: number) => boolean;
  /** Normalises canvas markup before it is stored (theme tokens, container units). */
  cleanHtml?: (html: string) => string;
}

export interface SelectionController {
  selection: SelectionState;
  contextMenu: {
    isOpen: boolean;
    position: { x: number; y: number };
  };
  closeContextMenu: () => void;
  /**
   * The live node for the selection, looked up from its path at call time —
   * never held, because the canvas rebuilds a section's DOM on every change.
   */
  resolveSelectedElement: () => HTMLElement | null;
  /**
   * Routes a right-click. Returns `true` when it selected an element and
   * consumed the event; `false` when the click is the section's own.
   */
  handleContextMenu: (event: React.MouseEvent, sectionIndex: number) => boolean;
  /**
   * Selects an element on left-click. Returns `true` when an element was selected.
   */
  handleElementSelect: (target: HTMLElement, sectionIndex: number) => boolean;
  /**
   * Handles element double-click to select and activate primary editing mode.
   */
  handleElementDoubleClick: (target: HTMLElement, sectionIndex: number) => boolean;
  /** Applies props to the element now and writes the section shortly after. */
  updateElementProps: <T extends LeafType>(id: string, props: Partial<ElementPropsByType[T]>) => void;
  /** Replaces an element's media type (e.g. image <-> video <-> youtube) */
  replaceMedia: (targetType: "image" | "video" | "youtube", initialProps?: Record<string, unknown>) => void;
  /** Replaces a plus placeholder with a real element */
  replacePlusWith: (targetType: "image" | "video" | "youtube" | "icon" | "button", initialProps?: Record<string, unknown>) => void;
  /** Changes the icon SVG of an icon element */
  changeIcon: (iconName: string) => void;
  /** Removes the selected element from its section. */
  deleteElement: () => void;
  /** Duplicates the selected element in its section. */
  duplicateElement: () => void;
  /** Moves the selected element up or down among its siblings. */
  moveElement: (direction: "up" | "down") => void;
  /** Changes a heading element's semantic tag (h1-h6). */
  changeHeadingLevel: (level: HeadingLevel) => void;
  /** Selects an ancestor in the element hierarchy (Container, Card, Section). */
  selectAncestor: (path: string, type: ElementType) => void;
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
  onTextHit,
  cleanHtml,
}: SelectionControllerOptions): SelectionController {
  const selection = useSelection(selectionStore);
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; position: { x: number; y: number } }>({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

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
   * If it does resolve, refresh the meta snapshot to ensure undo/redo state sync.
   */
  useEffect(() => {
    if (!selection.selectedId) return;
    const el = resolveSelected(selection);
    if (!el) {
      selectionStore.clearSelection();
      return;
    }
    if (selection.type && selection.type !== "section") {
      const freshProps = readElementProps(selection.type as LeafType, el);
      selectionStore.updateElementProps(selection.selectedId, {
        ...freshProps,
        tag: el.tagName.toLowerCase(),
      });
    }
  }, [selection.selectedId, selection.type, sections, resolveSelected]);

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
    closeContextMenu();
    selectionStore.clearSelection();
  }, [flushCommit, closeContextMenu]);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, sectionIndex: number): boolean => {
      const section = sectionsRef.current[sectionIndex];
      const target = event.target as HTMLElement | null;
      if (!section || !target) return false;
      if (target.closest(CHROME_SELECTOR)) return false;

      const box = canvasBoxFor(section.id);
      const hit = box ? resolveTarget(target, box) : null;
      if (!box || !hit) {
        clearSelection();
        return false;
      }

      event.preventDefault();
      event.stopPropagation();

      flushCommit();
      const id = elementId(section.id, hit.path);
      const ancestors = getAncestorHierarchy(hit.element, box, section.id, section.title);
      const meta = {
        ...readElementProps(hit.type, hit.element),
        tag: hit.element.tagName.toLowerCase(),
        cardPath: hit.cardPath,
        containerPath: hit.containerPath,
      };

      selectionStore.selectElement(id, hit.type, section.id, meta, ancestors);
      setContextMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
      });
      onElementSelected?.(sectionIndex);
      return true;
    },
    [clearSelection, flushCommit, onElementSelected],
  );

  const handleElementSelect = useCallback(
    (target: HTMLElement, sectionIndex: number): boolean => {
      const section = sectionsRef.current[sectionIndex];
      if (!section || !target) return false;
      if (target.closest(CHROME_SELECTOR)) return false;

      const box = canvasBoxFor(section.id);
      const hit = box ? resolveTarget(target, box) : null;
      if (!box || !hit) {
        clearSelection();
        return false;
      }

      closeContextMenu();
      flushCommit();
      const id = elementId(section.id, hit.path);
      const ancestors = getAncestorHierarchy(hit.element, box, section.id, section.title);
      const meta = {
        ...readElementProps(hit.type, hit.element),
        tag: hit.element.tagName.toLowerCase(),
        cardPath: hit.cardPath,
        containerPath: hit.containerPath,
      };

      selectionStore.selectElement(id, hit.type, section.id, meta, ancestors);
      onElementSelected?.(sectionIndex);
      return true;
    },
    [clearSelection, closeContextMenu, flushCommit, onElementSelected],
  );

  const handleElementDoubleClick = useCallback(
    (target: HTMLElement, sectionIndex: number): boolean => {
      const selected = handleElementSelect(target, sectionIndex);
      if (selected) {
        const state = selectionStore.getState();
        if (state.type === "text" || state.type === "heading") {
          const selectedEl = resolveSelectedElement();
          if (selectedEl) {
            onTextHit?.(selectedEl, sectionIndex);
          }
        }
      }
      return selected;
    },
    [handleElementSelect, resolveSelectedElement, onTextHit],
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
    if (commitTimer.current !== null) window.clearTimeout(commitTimer.current);
    commitTimer.current = null;
    pendingSectionId.current = null;
    element.remove();
    const sectionId = state.sectionId;
    selectionStore.clearSelection();
    closeContextMenu();
    writeSectionNow(sectionId);
  }, [resolveSelected, closeContextMenu, writeSectionNow]);

  const duplicateElement = useCallback(() => {
    const state = selectionStore.getState();
    if (!state.selectedId || !state.sectionId) return;
    const element = resolveSelected(state);
    if (!element) return;
    flushCommit();
    duplicateElementDom(element);
    const sectionId = state.sectionId;
    closeContextMenu();
    writeSectionNow(sectionId);
  }, [resolveSelected, flushCommit, closeContextMenu, writeSectionNow]);

  const moveElement = useCallback(
    (direction: "up" | "down") => {
      const state = selectionStore.getState();
      if (!state.selectedId || !state.sectionId) return;
      const element = resolveSelected(state);
      if (!element) return;
      flushCommit();
      const moved = moveElementDom(element, direction);
      if (moved) {
        const sectionId = state.sectionId;
        const box = canvasBoxFor(sectionId);
        if (box && state.type && state.type !== "section") {
          const newPath = pathOf(element, box);
          const newId = elementId(sectionId, newPath);
          const ancestors = getAncestorHierarchy(
            element,
            box,
            sectionId,
            sectionsRef.current.find((s) => s.id === sectionId)?.title || "Section",
          );
          const meta = {
            ...readElementProps(state.type as LeafType, element),
            tag: element.tagName.toLowerCase(),
          };
          selectionStore.selectElement(newId, state.type, sectionId, meta, ancestors);
        }
        closeContextMenu();
        writeSectionNow(sectionId);
      }
    },
    [resolveSelected, flushCommit, closeContextMenu, writeSectionNow],
  );

  const changeHeadingLevel = useCallback(
    (level: HeadingLevel) => {
      const state = selectionStore.getState();
      if (!state.selectedId || !state.sectionId || state.type !== "heading") return;
      const element = resolveSelected(state);
      if (!element) return;
      flushCommit();
      changeHeadingTagDom(element, level);
      const sectionId = state.sectionId;
      writeSectionNow(sectionId);
    },
    [resolveSelected, flushCommit, writeSectionNow],
  );

  const selectAncestor = useCallback(
    (path: string, type: ElementType) => {
      const state = selectionStore.getState();
      if (!state.sectionId) return;
      const box = canvasBoxFor(state.sectionId);
      if (!box) return;

      if (path === "" || type === "section") {
        clearSelection();
        return;
      }

      const ancestorEl = resolvePath(box, path);
      if (!ancestorEl) return;

      const leafType = type as LeafType;
      const id = elementId(state.sectionId, path);
      const ancestors = getAncestorHierarchy(
        ancestorEl,
        box,
        state.sectionId,
        sectionsRef.current.find((s) => s.id === state.sectionId)?.title || "Section",
      );
      const meta = {
        ...readElementProps(leafType, ancestorEl),
        tag: ancestorEl.tagName.toLowerCase(),
      };

      selectionStore.selectElement(id, type, state.sectionId, meta, ancestors);
      closeContextMenu();
    },
    [clearSelection, closeContextMenu],
  );

  /* ── Dismissal ────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!selection.selectedId && !contextMenu.isOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(CHROME_SELECTOR)) return;
      const element = resolveSelected(selectionStore.getState());
      if (element && element.contains(target)) return;
      clearSelection();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const isInputActive =
        active &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName) ||
          active.isContentEditable ||
          active.getAttribute("contenteditable") === "true");

      if (event.key === "Escape") {
        if (isInputActive && active) {
          active.blur();
          event.stopPropagation();
          return;
        }
        event.stopPropagation();
        clearSelection();
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && !isInputActive) {
        const state = selectionStore.getState();
        if (state.selectedId && state.type && state.type !== "section") {
          event.preventDefault();
          event.stopPropagation();
          deleteElement();
        }
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [selection.selectedId, contextMenu.isOpen, resolveSelected, clearSelection, deleteElement]);

  const replaceMedia = useCallback(
    (targetType: "image" | "video" | "youtube", initialProps?: Record<string, unknown>) => {
      const state = selectionStore.getState();
      if (!state.selectedId || !state.sectionId) return;
      const element = resolveSelected(state);
      if (!element) return;
      flushCommit();

      let newEl: HTMLElement;
      if (targetType === "video") {
        newEl = replaceImageWithVideoDom(element, initialProps);
      } else if (targetType === "youtube") {
        newEl = replaceImageWithYouTubeDom(element, initialProps);
      } else {
        newEl = replaceVideoWithImageDom(element, initialProps);
      }

      const sectionId = state.sectionId;
      const box = canvasBoxFor(sectionId);
      if (box) {
        const newPath = pathOf(newEl, box);
        const newId = elementId(sectionId, newPath);
        const ancestors = getAncestorHierarchy(
          newEl,
          box,
          sectionId,
          sectionsRef.current.find((s) => s.id === sectionId)?.title || "Section",
        );
        const meta = {
          ...readElementProps(targetType as LeafType, newEl),
          tag: newEl.tagName.toLowerCase(),
        };
        selectionStore.selectElement(newId, targetType, sectionId, meta, ancestors);
      }
      closeContextMenu();
      writeSectionNow(sectionId);
    },
    [resolveSelected, flushCommit, closeContextMenu, writeSectionNow],
  );

  const replacePlusWith = useCallback(
    (targetType: "image" | "video" | "youtube" | "icon" | "button", initialProps?: Record<string, unknown>) => {
      const state = selectionStore.getState();
      if (!state.selectedId || !state.sectionId) return;
      const element = resolveSelected(state);
      if (!element) return;
      flushCommit();

      const newEl = replacePlusWithElementDom(element, targetType, initialProps);
      const sectionId = state.sectionId;
      const box = canvasBoxFor(sectionId);
      if (box) {
        const newPath = pathOf(newEl, box);
        const newId = elementId(sectionId, newPath);
        const ancestors = getAncestorHierarchy(
          newEl,
          box,
          sectionId,
          sectionsRef.current.find((s) => s.id === sectionId)?.title || "Section",
        );
        const meta = {
          ...readElementProps(targetType as LeafType, newEl),
          tag: newEl.tagName.toLowerCase(),
        };
        selectionStore.selectElement(newId, targetType, sectionId, meta, ancestors);
      }
      closeContextMenu();
      writeSectionNow(sectionId);
    },
    [resolveSelected, flushCommit, closeContextMenu, writeSectionNow],
  );

  const changeIcon = useCallback(
    (iconName: string) => {
      const state = selectionStore.getState();
      if (!state.selectedId || !state.sectionId || state.type !== "icon") return;
      const element = resolveSelected(state);
      if (!element) return;
      flushCommit();

      element.setAttribute("data-icon-name", iconName);
      selectionStore.updateElementProps(state.selectedId, { iconName });
      writeSectionNow(state.sectionId);
    },
    [resolveSelected, flushCommit, writeSectionNow],
  );

  return {
    selection,
    contextMenu,
    closeContextMenu,
    resolveSelectedElement,
    handleContextMenu,
    handleElementSelect,
    handleElementDoubleClick,
    updateElementProps,
    replaceMedia,
    replacePlusWith,
    changeIcon,
    deleteElement,
    duplicateElement,
    moveElement,
    changeHeadingLevel,
    selectAncestor,
    clearSelection,
  };
}
