"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SnapGuide, DistanceBadge } from "@/stores/useVisualCanvasStore";

export interface SelectedElementInfo {
  tag: string;
  label: string;
  rect: DOMRect;
  element: HTMLElement;
  sectionIndex: number;
}

export interface DropIndicatorInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: "horizontal" | "vertical";
}

interface UseCanvaInteractionsProps {
  sections: Array<{ id: string; code: string; title: string }>;
  activeSectionIndex: number | null;
  onUpdateSectionCode: (sectionIndex: number, newBodyHtml: string) => void;
  showToast?: (message: string) => void;
}

/**
 * Returns a human-friendly label for an element tag or role
 */
export function getElementLabel(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  if (tag.startsWith("h") && tag.length === 2) return `Heading ${tag[1]}`;
  if (tag === "p") return "Paragraph";
  if (tag === "button") return "Button";
  if (tag === "a") return "Link";
  if (tag === "img") return "Image";
  if (el.classList.contains("badge") || el.getAttribute("data-badge") !== null) return "Badge";
  if (tag === "span" || tag === "small" || tag === "strong" || tag === "em") return "Text";
  if (el.classList.contains("card") || el.getAttribute("data-card") !== null) return "Card";
  return tag.toUpperCase();
}

/**
 * Detects if an element is text-editable and finds the most specific text node
 */
export function findTextEditableElement(target: HTMLElement | null): HTMLElement | null {
  if (!target) return null;

  // Ignore structural wrappers, form inputs, and media elements
  const nonTextTags = new Set([
    "SECTION", "HEADER", "FOOTER", "MAIN", "BODY", "HTML",
    "IMG", "VIDEO", "AUDIO", "CANVAS", "SVG", "PATH", "CIRCLE", "RECT", "POLYGON", "G",
    "INPUT", "TEXTAREA", "SELECT", "IFRAME"
  ]);
  if (nonTextTags.has(target.tagName.toUpperCase())) return null;

  // 1. Direct standard text elements
  const directText = target.closest<HTMLElement>(
    "h1, h2, h3, h4, h5, h6, p, blockquote, figcaption, label, span, small, strong, em, b, i, u, s, cite, td, th"
  );
  if (directText) return directText;

  // 2. Buttons & links (interactive text elements)
  const actionText = target.closest<HTMLElement>("button, a, [data-badge]");
  if (actionText) {
    const innerText = actionText.querySelector<HTMLElement>("span, p, h1, h2, h3, h4, h5, h6");
    if (innerText && actionText.contains(innerText)) {
      return innerText;
    }
    return actionText;
  }

  // 3. If target is a DIV or LI containing text
  const tag = target.tagName.toUpperCase();
  if (tag === "DIV" || tag === "LI") {
    const text = (target.textContent || "").trim();
    if (text.length > 0) {
      const inner = target.querySelector<HTMLElement>(
        "h1, h2, h3, h4, h5, h6, p, span, small, strong, em, b, i, [data-badge]"
      );
      if (inner && target.contains(inner) && inner.children.length === 0) {
        return inner;
      }
      if (target.children.length <= 2) {
        return target;
      }
    }
  }

  // 4. Fallback: if target has non-empty text content and 0 child elements
  if ((target.textContent || "").trim().length > 0 && target.children.length === 0) {
    return target;
  }

  return null;
}

/**
 * Strips editor-added attributes, temporary styles, and helper nodes from a cloned HTML tree
 */
function sanitizeCleanDom(node: HTMLElement): string {
  const clone = node.cloneNode(true) as HTMLElement;

  // Remove editor badges, guides, insertion indicators
  clone.querySelectorAll(".pointer-events-none, .xite-editor-ui, [data-xite-indicator]").forEach((el) => {
    el.remove();
  });

  // Remove inline editing attributes and outline styling
  clone.querySelectorAll("[contenteditable], .xite-text-editing, [data-xite-selected], [data-xite-hover]").forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.removeAttribute("contenteditable");
    htmlEl.removeAttribute("data-xite-selected");
    htmlEl.removeAttribute("data-xite-hover");
    htmlEl.classList.remove("xite-text-editing");
    htmlEl.style.outline = "";
    htmlEl.style.outlineOffset = "";
    htmlEl.style.borderRadius = "";
    htmlEl.style.boxShadow = "";
    htmlEl.style.cursor = "";
    htmlEl.style.userSelect = "";
    htmlEl.style.transform = "";
    htmlEl.style.zIndex = "";
    (htmlEl.style as any).webkitUserSelect = "";
  });

  return clone.innerHTML;
}

export function useCanvaInteractions({
  sections,
  activeSectionIndex,
  onUpdateSectionCode,
  showToast,
}: UseCanvaInteractionsProps) {
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo | null>(null);
  const [hoveredRect, setHoveredRect] = useState<{ rect: DOMRect; label: string } | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [distanceBadges, setDistanceBadges] = useState<DistanceBadge[]>([]);
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorInfo | null>(null);
  const [dropZoneRect, setDropZoneRect] = useState<DOMRect | null>(null);

  const activeEditingElemRef = useRef<HTMLElement | null>(null);
  const activeEditingSectionIdxRef = useRef<number | null>(null);
  const originalTextRef = useRef<string>("");
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragTargetRef = useRef<{
    element: HTMLElement;
    sectionIndex: number;
    startX: number;
    startY: number;
    initialRect: DOMRect;
    parentContainer: HTMLElement;
    siblings: HTMLElement[];
    /**
     * The dragged element's own visual scale (its screen-pixel rect over its
     * un-transformed layout size). The studio canvas renders sections inside
     * `ResponsiveCanvas`, which shrinks the whole canvas with a CSS
     * `transform: scale(...)` whenever the chosen viewport is wider than the
     * pane — desktop widths in a normal browser window, essentially always.
     * `deltaX`/`deltaY` below are real cursor-movement pixels; applying them
     * as-is to `translate3d` on an element inside that scaled ancestor gets
     * scaled down a second time, so the element visibly lags the cursor.
     * Dividing by this factor cancels the ancestor's scale back out.
     */
    scale: number;
    /**
     * `position: absolute` / `fixed` elements — badges pinned around a hero
     * image, a floating price tag, anything laid out by coordinates rather
     * than flow. Reordering their DOM position (the in-flow path below) does
     * nothing visible for these, so they're moved by writing `left`/`top`
     * directly instead of a `transform` that then gets reset on drop.
     */
    isOutOfFlow: boolean;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const dropTargetIndexRef = useRef<number | null>(null);

  // Update selection bounding box on scroll or window resize
  const refreshSelectionRect = useCallback(() => {
    if (selectedElement && selectedElement.element.isConnected) {
      const rect = selectedElement.element.getBoundingClientRect();
      setSelectedElement((prev) => (prev ? { ...prev, rect } : null));
    } else if (selectedElement && !selectedElement.element.isConnected) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  useEffect(() => {
    window.addEventListener("resize", refreshSelectionRect);
    window.addEventListener("scroll", refreshSelectionRect, true);
    return () => {
      window.removeEventListener("resize", refreshSelectionRect);
      window.removeEventListener("scroll", refreshSelectionRect, true);
    };
  }, [refreshSelectionRect]);


  /**
   * Finish inline editing: clean up styles and commit HTML to persistent project store
   */
  const finishInlineTextEditing = useCallback((revert = false) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    const el = activeEditingElemRef.current;
    const secIdx = activeEditingSectionIdxRef.current;
    if (!el || secIdx === null) {
      setIsEditingText(false);
      return;
    }

    if (revert && originalTextRef.current) {
      el.innerHTML = originalTextRef.current;
    }

    // Clean inline edit styling
    el.removeAttribute("contenteditable");
    el.contentEditable = "false";
    el.classList.remove("xite-text-editing");
    el.style.outline = "";
    el.style.outlineOffset = "";
    el.style.borderRadius = "";
    el.style.boxShadow = "";
    el.style.userSelect = "";
    (el.style as any).webkitUserSelect = "";
    el.style.cursor = "";
    el.style.caretColor = "";

    activeEditingElemRef.current = null;
    activeEditingSectionIdxRef.current = null;
    originalTextRef.current = "";
    setIsEditingText(false);

    if (!revert) {
      // Find the section wrapper and commit changes to store
      const secContainer = el.closest("[data-xite-section]") as HTMLElement | null;
      if (secContainer) {
        const canvasBox = (secContainer.querySelector(".section-canvas-box") ||
          secContainer.querySelector("header, section, footer, main") ||
          secContainer) as HTMLElement;
        const cleanHtml = sanitizeCleanDom(canvasBox);
        if (cleanHtml) {
          onUpdateSectionCode(secIdx, cleanHtml);
          showToast?.("Text updated");
        }
      }
    }

    refreshSelectionRect();
  }, [onUpdateSectionCode, showToast, refreshSelectionRect]);

  /**
   * Activates inline contenteditable text editing with caret focus
   */
  const activateTextEditing = useCallback((element: HTMLElement, sectionIndex: number, e?: React.MouseEvent) => {
    if (!element) return;

    // Prevent default navigation if element is an <a> or <button>
    if (element.tagName === "A" || element.closest("a")) {
      e?.preventDefault();
    }

    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    // Finish any prior edit on a DIFFERENT element
    if (activeEditingElemRef.current && activeEditingElemRef.current !== element) {
      finishInlineTextEditing();
    }

    // If already editing this exact element, keep it active
    if (activeEditingElemRef.current === element && element.isContentEditable) {
      return;
    }

    activeEditingElemRef.current = element;
    activeEditingSectionIdxRef.current = sectionIndex;
    originalTextRef.current = element.innerHTML;
    setIsEditingText(true);

    // Set contentEditable with high-visibility blue editing outline & glow
    element.classList.add("xite-text-editing");
    element.setAttribute("contenteditable", "true");
    element.contentEditable = "true";

    element.style.outline = "2px solid #3b82f6";
    element.style.outlineOffset = "3px";
    element.style.borderRadius = "4px";
    element.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.25)";
    element.style.cursor = "text";
    element.style.caretColor = "#2563eb";
    element.style.userSelect = "text";
    (element.style as any).webkitUserSelect = "text";

    // Focus element
    element.focus();

    // Place blinking caret precisely where user clicked
    if (e && e.clientX && e.clientY && typeof document !== "undefined") {
      try {
        if ((document as any).caretRangeFromPoint) {
          const range = (document as any).caretRangeFromPoint(e.clientX, e.clientY);
          if (range) {
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        } else if ((document as any).caretPositionFromPoint) {
          const pos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
          if (pos) {
            const range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }
      } catch {}
    }

    // Key handlers: Escape reverts; Enter commits on single-line tags
    element.onkeydown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Escape") {
        keyEvent.preventDefault();
        keyEvent.stopPropagation();
        element.blur();
        finishInlineTextEditing(true);
        return;
      }
      if (keyEvent.key === "Enter") {
        const tag = element.tagName.toLowerCase();
        const isSingleLine = ["h1", "h2", "h3", "h4", "h5", "h6", "button", "a", "span", "label", "th", "td"].includes(tag) ||
          element.classList.contains("badge") ||
          element.getAttribute("data-badge") !== null;
        if (isSingleLine && !keyEvent.shiftKey) {
          keyEvent.preventDefault();
          keyEvent.stopPropagation();
          element.blur();
          finishInlineTextEditing(false);
        }
      }
    };

    // On blur: small debounce to allow intra-element focus transitions without premature cancel
    element.onblur = () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = setTimeout(() => {
        if (activeEditingElemRef.current === element) {
          const active = typeof document !== "undefined" ? document.activeElement : null;
          if (active !== element && !element.contains(active)) {
            finishInlineTextEditing(false);
          }
        }
      }, 180);
    };
  }, [finishInlineTextEditing]);

  /**
   * Check if a clicked element is inside the actively edited text element
   */
  const isEditingTarget = useCallback((target: HTMLElement | null): boolean => {
    if (!target || !activeEditingElemRef.current) return false;
    return activeEditingElemRef.current === target || activeEditingElemRef.current.contains(target);
  }, []);

  /**
   * 1. Click-to-Edit: clicking any text element activates inline text editing
   */
  const handleElementClick = useCallback((target: HTMLElement, sectionIndex: number, e?: React.MouseEvent) => {
    // If currently editing text and clicked inside it, let native cursor move
    if (isEditingTarget(target)) {
      e?.stopPropagation();
      return;
    }

    // Find if user clicked a text-editable element
    const textTarget = findTextEditableElement(target);
    if (textTarget) {
      activateTextEditing(textTarget, sectionIndex, e);
      return;
    }

    // Otherwise, user clicked non-text background or wrapper
    if (activeEditingElemRef.current) {
      finishInlineTextEditing();
    }
    setSelectedElement(null);
  }, [isEditingTarget, findTextEditableElement, activateTextEditing, finishInlineTextEditing]);

  /**
   * Double-click also activates text editing (or lets native word selection work inside active text)
   */
  const handleElementDoubleClick = useCallback((target: HTMLElement, sectionIndex: number, e?: React.MouseEvent) => {
    // If currently editing text and clicked inside it, let native word selection happen
    if (isEditingTarget(target)) {
      return;
    }

    const textTarget = findTextEditableElement(target);
    if (textTarget) {
      activateTextEditing(textTarget, sectionIndex, e);
      return;
    }
  }, [isEditingTarget, findTextEditableElement, activateTextEditing]);

  /**
   * Mouse hover: clean preview canvas without dashed boxes
   */
  const handleElementHover = useCallback((target: HTMLElement | null) => {
    // Keep canvas preview completely clean and unbordered
    setHoveredRect(null);
  }, []);

  /**
   * 2. Free / Flow Drag & Drop with Magnetic Snap Guidelines (#ec4899)
   */
  const handlePointerDragStart = useCallback((e: React.MouseEvent<HTMLElement>, element: HTMLElement, sectionIndex: number) => {
    if (isEditingText) return;

    e.preventDefault();
    e.stopPropagation();

    const parent = element.parentElement;
    if (!parent) return;

    const initialRect = element.getBoundingClientRect();
    const siblings = Array.from(parent.children).filter(
      (child) => child !== element && !child.classList.contains("xite-editor-ui")
    ) as HTMLElement[];

    const measuredWidth = (element as HTMLElement).offsetWidth;
    const scale = measuredWidth > 0 && initialRect.width > 0 ? initialRect.width / measuredWidth : 1;

    const computedPosition = window.getComputedStyle(element).position;
    const isOutOfFlow = computedPosition === "absolute" || computedPosition === "fixed";

    dragTargetRef.current = {
      element,
      sectionIndex,
      startX: e.clientX,
      startY: e.clientY,
      initialRect,
      parentContainer: parent,
      siblings,
      scale,
      isOutOfFlow,
      startLeft: element.offsetLeft,
      startTop: element.offsetTop,
    };

    setIsDragging(true);

    const isHorizontal =
      window.getComputedStyle(parent).flexDirection?.includes("row") ||
      window.getComputedStyle(parent).display === "flex" ||
      window.getComputedStyle(parent).display === "inline-flex";

    let pendingRafId: number | null = null;
    let latestPointerEvent: { clientX: number; clientY: number } | null = null;
    /**
     * Below this many pixels of movement, nothing happens yet.
     *
     * `handlePointerDragStart` now fires on every mousedown on a selectable
     * element, not only from a dedicated drag handle — so an ordinary click
     * has to pass through here too, and without
     * this guard a single pixel of jitter on mouseup would be read as an
     * intentional reorder.
     */
    const DRAG_ACTIVATION_THRESHOLD = 4;
    let dragActivated = false;

    const processDragFrame = () => {
      pendingRafId = null;
      if (!dragTargetRef.current || !latestPointerEvent) return;
      const { clientX, clientY } = latestPointerEvent;
      const {
        element: draggedEl,
        startX,
        startY,
        initialRect: origRect,
        siblings: sibs,
        scale,
        isOutOfFlow,
        startLeft,
        startTop,
      } = dragTargetRef.current;

      let deltaX = clientX - startX;
      let deltaY = clientY - startY;

      if (!dragActivated) {
        if (Math.hypot(deltaX, deltaY) < DRAG_ACTIVATION_THRESHOLD) return;
        dragActivated = true;
      }

      const currentLeft = origRect.left + deltaX;
      const currentRight = origRect.right + deltaX;
      const currentCenterX = currentLeft + origRect.width / 2;

      const currentTop = origRect.top + deltaY;
      const currentBottom = origRect.bottom + deltaY;
      const currentCenterY = currentTop + origRect.height / 2;

      const guidesMap = new Map<string, SnapGuide>();
      const badgesMap = new Map<string, DistanceBadge>();
      const SNAP_THRESHOLD = 6; // 6px magnetic snap threshold

      const addGuide = (orientation: "horizontal" | "vertical", coord: number) => {
        const rounded = Math.round(coord);
        const key = `${orientation}-${rounded}`;
        if (!guidesMap.has(key)) {
          guidesMap.set(key, {
            id: `snap-${key}`,
            orientation,
            coordinate: rounded,
            color: "#ec4899",
          });
        }
      };

      const addBadge = (orientation: "horizontal" | "vertical", dist: number, x: number, y: number) => {
        const roundedDist = Math.round(dist);
        const key = `${orientation}-${roundedDist}-${Math.round(x)}-${Math.round(y)}`;
        if (!badgesMap.has(key)) {
          badgesMap.set(key, {
            id: `dist-${key}`,
            distance: roundedDist,
            x: Math.round(x),
            y: Math.round(y),
            orientation,
          });
        }
      };

      // Check Magnetic Snap against each sibling
      for (const sib of sibs) {
        const sibRect = sib.getBoundingClientRect();
        const sibCenterX = sibRect.left + sibRect.width / 2;
        const sibCenterY = sibRect.top + sibRect.height / 2;

        // 1. Horizontal / Vertical Axis Snapping (#ec4899)
        // Left-to-left
        if (Math.abs(currentLeft - sibRect.left) <= SNAP_THRESHOLD) {
          deltaX = sibRect.left - origRect.left;
          addGuide("vertical", sibRect.left);
        }
        // Right-to-right
        else if (Math.abs(currentRight - sibRect.right) <= SNAP_THRESHOLD) {
          deltaX = sibRect.right - origRect.right;
          addGuide("vertical", sibRect.right);
        }
        // Center-to-center X
        else if (Math.abs(currentCenterX - sibCenterX) <= SNAP_THRESHOLD) {
          deltaX = sibCenterX - (origRect.left + origRect.width / 2);
          addGuide("vertical", sibCenterX);
        }

        // Top-to-top
        if (Math.abs(currentTop - sibRect.top) <= SNAP_THRESHOLD) {
          deltaY = sibRect.top - origRect.top;
          addGuide("horizontal", sibRect.top);
        }
        // Bottom-to-bottom
        else if (Math.abs(currentBottom - sibRect.bottom) <= SNAP_THRESHOLD) {
          deltaY = sibRect.bottom - origRect.bottom;
          addGuide("horizontal", sibRect.bottom);
        }
        // Center-to-center Y
        else if (Math.abs(currentCenterY - sibCenterY) <= SNAP_THRESHOLD) {
          deltaY = sibCenterY - (origRect.top + origRect.height / 2);
          addGuide("horizontal", sibCenterY);
        }

        // 2. Numeric Distance Badge (e.g., 24px gap indicator)
        if (isHorizontal) {
          const gapRight = Math.round(sibRect.left - currentRight);
          if (gapRight > 0 && gapRight <= 120) {
            addBadge("horizontal", gapRight, currentRight + gapRight / 2, sibCenterY);
          }
          const gapLeft = Math.round(currentLeft - sibRect.right);
          if (gapLeft > 0 && gapLeft <= 120) {
            addBadge("horizontal", gapLeft, sibRect.right + gapLeft / 2, sibCenterY);
          }
        } else {
          const gapBottom = Math.round(sibRect.top - currentBottom);
          if (gapBottom > 0 && gapBottom <= 120) {
            addBadge("vertical", gapBottom, sibCenterX, currentBottom + gapBottom / 2);
          }
          const gapTop = Math.round(currentTop - sibRect.bottom);
          if (gapTop > 0 && gapTop <= 120) {
            addBadge("vertical", gapTop, sibCenterX, sibRect.bottom + gapTop / 2);
          }
        }
      }

      setSnapGuides(Array.from(guidesMap.values()));
      setDistanceBadges(Array.from(badgesMap.values()));

      if (isOutOfFlow) {
        // Positioned by coordinates, not flow: move it by writing left/top
        // directly (scale-compensated) so the new position survives drop —
        // a transform here would just get reset with nothing to replace it.
        draggedEl.style.left = `${startLeft + deltaX / scale}px`;
        draggedEl.style.top = `${startTop + deltaY / scale}px`;
        draggedEl.style.right = "auto";
        draggedEl.style.bottom = "auto";
        draggedEl.style.opacity = "0.85";
        draggedEl.style.zIndex = "999";
        dropTargetIndexRef.current = null;
        setDropIndicator(null);
        setDropZoneRect(null);
        return;
      }

      // Apply live smooth transform on dragged element, compensated for the
      // canvas's own scale so it tracks the cursor 1:1 at any viewport zoom
      draggedEl.style.transform = `translate3d(${deltaX / scale}px, ${deltaY / scale}px, 0)`;
      draggedEl.style.opacity = "0.75";
      draggedEl.style.zIndex = "999";

      // Highlight the container being dropped into
      setDropZoneRect(dragTargetRef.current.parentContainer.getBoundingClientRect());

      // Calculate drop insertion index in container flow
      let insertIndex = sibs.length;
      let targetSibling: HTMLElement | null = null;
      let insertBefore = true;

      for (let i = 0; i < sibs.length; i++) {
        const sib = sibs[i];
        const rect = sib.getBoundingClientRect();
        if (isHorizontal) {
          const midX = rect.left + rect.width / 2;
          if (clientX < midX) {
            insertIndex = i;
            targetSibling = sib;
            insertBefore = true;
            break;
          }
        } else {
          const midY = rect.top + rect.height / 2;
          if (clientY < midY) {
            insertIndex = i;
            targetSibling = sib;
            insertBefore = true;
            break;
          }
        }
      }

      dropTargetIndexRef.current = insertIndex;

      // Update drop insertion line
      if (targetSibling) {
        const rect = targetSibling.getBoundingClientRect();
        if (isHorizontal) {
          setDropIndicator({
            x: insertBefore ? rect.left - 2 : rect.right - 2,
            y: rect.top,
            width: 3,
            height: rect.height,
            orientation: "vertical",
          });
        } else {
          setDropIndicator({
            x: rect.left,
            y: insertBefore ? rect.top - 2 : rect.bottom - 2,
            width: rect.width,
            height: 3,
            orientation: "horizontal",
          });
        }
      } else if (sibs.length > 0) {
        const lastSib = sibs[sibs.length - 1];
        const rect = lastSib.getBoundingClientRect();
        if (isHorizontal) {
          setDropIndicator({
            x: rect.right + 2,
            y: rect.top,
            width: 3,
            height: rect.height,
            orientation: "vertical",
          });
        } else {
          setDropIndicator({
            x: rect.left,
            y: rect.bottom + 2,
            width: rect.width,
            height: 3,
            orientation: "horizontal",
          });
        }
      }
    };

    const onPointerMove = (moveEvt: PointerEvent | MouseEvent) => {
      latestPointerEvent = { clientX: moveEvt.clientX, clientY: moveEvt.clientY };
      if (!pendingRafId) {
        pendingRafId = requestAnimationFrame(processDragFrame);
      }
    };

    const onPointerUp = () => {
      if (pendingRafId) {
        cancelAnimationFrame(pendingRafId);
        pendingRafId = null;
      }
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("mouseup", onPointerUp);

      if (!dragTargetRef.current) return;
      const { element: draggedEl, sectionIndex: secIdx, parentContainer, siblings: sibs, isOutOfFlow } = dragTargetRef.current;
      const insertIndex = dropTargetIndexRef.current;

      // Reset the transient drag styling. Left/top are the committed result
      // for an out-of-flow element, not transient state, so they're untouched
      // — and so is transform: an out-of-flow drag never writes one (some of
      // these badges are centered with `transform: translate(-50%, -50%)`
      // alongside their left/top, and clearing it here would un-center them).
      if (!isOutOfFlow) {
        draggedEl.style.transform = "";
      }
      draggedEl.style.opacity = "";
      draggedEl.style.zIndex = "";

      setSnapGuides([]);
      setDistanceBadges([]);
      setDropIndicator(null);
      setDropZoneRect(null);
      setIsDragging(false);

      if (isOutOfFlow) {
        if (dragActivated) {
          const secContainer = draggedEl.closest("[data-xite-section]") as HTMLElement | null;
          if (secContainer) {
            const canvasBox = (secContainer.querySelector(".section-canvas-box") || secContainer) as HTMLElement;
            const cleanHtml = sanitizeCleanDom(canvasBox);
            if (cleanHtml) {
              onUpdateSectionCode(secIdx, cleanHtml);
              showToast?.("Element moved");
            }
          }
        }
      } else if (insertIndex !== null && parentContainer) {
        // Reorder cleanly within container flow
        if (insertIndex >= sibs.length) {
          parentContainer.appendChild(draggedEl);
        } else {
          const refNode = sibs[insertIndex];
          parentContainer.insertBefore(draggedEl, refNode);
        }

        // Commit layout state to persistent store
        const secContainer = parentContainer.closest("[data-xite-section]") as HTMLElement | null;
        if (secContainer) {
          const canvasBox = (secContainer.querySelector(".section-canvas-box") || secContainer) as HTMLElement;
          const cleanHtml = sanitizeCleanDom(canvasBox);
          if (cleanHtml) {
            onUpdateSectionCode(secIdx, cleanHtml);
            showToast?.("Element moved & snapped in flow");
          }
        }
      }

      dragTargetRef.current = null;
      dropTargetIndexRef.current = null;
      refreshSelectionRect();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("mouseup", onPointerUp);
  }, [isEditingText, onUpdateSectionCode, showToast, refreshSelectionRect]);

  return {
    selectedElement,
    hoveredRect,
    isEditingText,
    isDragging,
    snapGuides,
    distanceBadges,
    dropIndicator,
    dropZoneRect,
    handleElementClick,
    handleElementHover,
    handleElementDoubleClick,
    handlePointerDragStart,
    finishInlineTextEditing,
    isEditingTarget,
    setSelectedElement,
    setHoveredRect,
  };
}

// Backward-compatible alias
export { useCanvaInteractions as useInPlaceCanvasEditor };
