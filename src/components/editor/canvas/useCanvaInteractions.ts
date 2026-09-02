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
function getElementLabel(el: HTMLElement): string {
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

  const activeEditingElemRef = useRef<HTMLElement | null>(null);
  const activeEditingSectionIdxRef = useRef<number | null>(null);
  const originalTextRef = useRef<string>("");

  const dragTargetRef = useRef<{
    element: HTMLElement;
    sectionIndex: number;
    startX: number;
    startY: number;
    initialRect: DOMRect;
    parentContainer: HTMLElement;
    siblings: HTMLElement[];
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

    activeEditingElemRef.current = null;
    activeEditingSectionIdxRef.current = null;
    originalTextRef.current = "";
    setIsEditingText(false);

    if (!revert) {
      // Find the section wrapper and commit changes to store
      const secContainer = el.closest("[data-xite-section]") as HTMLElement | null;
      if (secContainer) {
        const canvasBox = (secContainer.querySelector(".section-canvas-box") || secContainer) as HTMLElement;
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
   * 1. Double-Click Inline Editing (contentEditable)
   */
  const handleElementDoubleClick = useCallback((target: HTMLElement, sectionIndex: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // If clicking structural wrappers or media, ignore
    if (["SECTION", "HEADER", "FOOTER", "MAIN", "IMG", "SVG", "PATH"].includes(target.tagName)) return;

    // Find closest editable text node
    let textElem: HTMLElement | null = target.closest(
      "h1, h2, h3, h4, h5, h6, p, button, a, blockquote, li, label, figcaption, span, small, strong, em, [data-badge]"
    ) as HTMLElement | null;

    if (!textElem) {
      textElem = target;
    }

    // Finish any prior edit
    if (activeEditingElemRef.current && activeEditingElemRef.current !== textElem) {
      finishInlineTextEditing();
    }

    activeEditingElemRef.current = textElem;
    activeEditingSectionIdxRef.current = sectionIndex;
    originalTextRef.current = textElem.innerHTML;
    setIsEditingText(true);

    // Immediately set contentEditable="true"
    textElem.classList.add("xite-text-editing");
    textElem.setAttribute("contenteditable", "true");
    textElem.contentEditable = "true";

    // Add active blue border: outline: 2px solid #2563eb; outline-offset: 2px; border-radius: 4px;
    textElem.style.outline = "2px solid #2563eb";
    textElem.style.outlineOffset = "2px";
    textElem.style.borderRadius = "4px";
    textElem.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.2)";
    textElem.style.cursor = "text";
    textElem.style.userSelect = "text";
    (textElem.style as any).webkitUserSelect = "text";

    // Programmatically run element.focus()
    textElem.focus();

    // Use window.getSelection() to place blinking caret precisely where clicked
    if (e && e.clientX && e.clientY) {
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

    // Key handlers: Escape reverts & blurs; Enter commits on single-line tags
    textElem.onkeydown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Escape") {
        keyEvent.preventDefault();
        keyEvent.stopPropagation();
        textElem?.blur();
        finishInlineTextEditing(true);
        return;
      }
      if (keyEvent.key === "Enter") {
        const tag = textElem!.tagName.toLowerCase();
        const isSingleLine = ["h1", "h2", "h3", "h4", "h5", "h6", "button", "a", "span", "label"].includes(tag) ||
          textElem!.classList.contains("badge") ||
          textElem!.getAttribute("data-badge") !== null;
        if (isSingleLine && !keyEvent.shiftKey) {
          keyEvent.preventDefault();
          keyEvent.stopPropagation();
          textElem?.blur();
          finishInlineTextEditing(false);
        }
      }
    };

    // onBlur handler: Disables contentEditable, sanitizes text, dispatches update
    textElem.onblur = () => {
      finishInlineTextEditing(false);
    };
  }, [finishInlineTextEditing]);

  /**
   * Single-click: Selects the element and shows a clean 1px selection bounding box with 4 corner anchor dots
   */
  const handleElementClick = useCallback((target: HTMLElement, sectionIndex: number, e?: React.MouseEvent) => {
    // If currently editing text, stop click propagation so parent does not intercept focus
    if (activeEditingElemRef.current?.contains(target)) {
      e?.stopPropagation();
      return;
    }

    if (activeEditingElemRef.current) {
      finishInlineTextEditing();
    }

    if (e) {
      e.stopPropagation();
    }

    // Ignore section root container itself
    if (target.hasAttribute("data-xite-section") || target.classList.contains("section-wrapper-container")) {
      setSelectedElement(null);
      return;
    }

    // Find reasonable target (card, badge, heading, p, button, a, img, etc.)
    const selectable =
      (target.closest("h1, h2, h3, h4, h5, h6, p, button, a, img, .card, [data-card], .badge, [data-badge], li, div > div") as HTMLElement) ||
      target;

    const rect = selectable.getBoundingClientRect();
    const label = getElementLabel(selectable);

    setSelectedElement({
      tag: selectable.tagName.toLowerCase(),
      label,
      rect,
      element: selectable,
      sectionIndex,
    });
  }, [finishInlineTextEditing]);

  /**
   * Mouse hover: shows subtle outline with label
   */
  const handleElementHover = useCallback((target: HTMLElement | null) => {
    if (!target || isEditingText || isDragging) {
      setHoveredRect(null);
      return;
    }
    if (target.hasAttribute("data-xite-section") || target.classList.contains("section-wrapper-container")) {
      setHoveredRect(null);
      return;
    }
    const hoverTarget =
      (target.closest("h1, h2, h3, h4, h5, h6, p, button, a, img, li, .card, .badge, [data-badge]") as HTMLElement) || target;
    const rect = hoverTarget.getBoundingClientRect();
    setHoveredRect({ rect, label: getElementLabel(hoverTarget) });
  }, [isEditingText, isDragging]);

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

    dragTargetRef.current = {
      element,
      sectionIndex,
      startX: e.clientX,
      startY: e.clientY,
      initialRect,
      parentContainer: parent,
      siblings,
    };

    setIsDragging(true);

    const isHorizontal =
      window.getComputedStyle(parent).flexDirection?.includes("row") ||
      window.getComputedStyle(parent).display === "flex" ||
      window.getComputedStyle(parent).display === "inline-flex";

    let pendingRafId: number | null = null;
    let latestPointerEvent: { clientX: number; clientY: number } | null = null;

    const processDragFrame = () => {
      pendingRafId = null;
      if (!dragTargetRef.current || !latestPointerEvent) return;
      const { clientX, clientY } = latestPointerEvent;
      const { element: draggedEl, startX, startY, initialRect: origRect, siblings: sibs } = dragTargetRef.current;

      let deltaX = clientX - startX;
      let deltaY = clientY - startY;

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

      // Apply live smooth transform on dragged element
      draggedEl.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      draggedEl.style.opacity = "0.75";
      draggedEl.style.zIndex = "999";

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
      const { element: draggedEl, sectionIndex: secIdx, parentContainer, siblings: sibs } = dragTargetRef.current;
      const insertIndex = dropTargetIndexRef.current;

      // Reset dragged styling
      draggedEl.style.transform = "";
      draggedEl.style.opacity = "";
      draggedEl.style.zIndex = "";

      setSnapGuides([]);
      setDistanceBadges([]);
      setDropIndicator(null);
      setIsDragging(false);

      if (insertIndex !== null && parentContainer) {
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

  /**
   * Direct '+ Add Text' Action
   */
  const addTextToActiveSection = useCallback(() => {
    const secIdx = activeSectionIndex !== null ? activeSectionIndex : (sections.length > 0 ? 0 : null);
    if (secIdx === null) {
      showToast?.("Select a section to add text");
      return;
    }

    const section = sections[secIdx];
    if (!section) return;

    const secContainer = document.querySelector(`[data-xite-section="${section.id}"]`) as HTMLElement | null;
    if (!secContainer) return;

    const canvasBox = (secContainer.querySelector(".section-canvas-box") || secContainer) as HTMLElement;

    const newTextEl = document.createElement("p");
    newTextEl.style.fontSize = "clamp(1rem, 2vw, 1.25rem)";
    newTextEl.style.lineHeight = "1.6";
    newTextEl.style.color = "inherit";
    newTextEl.style.marginTop = "0.75rem";
    newTextEl.style.marginBottom = "0.75rem";
    newTextEl.style.maxWidth = "100%";
    newTextEl.style.wordBreak = "break-word";
    newTextEl.style.minWidth = "0";
    newTextEl.textContent = "Click here to edit this text...";

    if (selectedElement && selectedElement.element.isConnected && secContainer.contains(selectedElement.element)) {
      selectedElement.element.insertAdjacentElement("afterend", newTextEl);
    } else {
      const track = canvasBox.querySelector("div, main, [class*='content'], [class*='container']") || canvasBox;
      track.appendChild(newTextEl);
    }

    handleElementDoubleClick(newTextEl, secIdx);

    try {
      const range = document.createRange();
      range.selectNodeContents(newTextEl);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch {}

    showToast?.("Added text block — start typing now");
  }, [activeSectionIndex, sections, selectedElement, handleElementDoubleClick, showToast]);

  return {
    selectedElement,
    hoveredRect,
    isEditingText,
    isDragging,
    snapGuides,
    distanceBadges,
    dropIndicator,
    handleElementClick,
    handleElementHover,
    handleElementDoubleClick,
    handlePointerDragStart,
    finishInlineTextEditing,
    addTextToActiveSection,
    setSelectedElement,
    setHoveredRect,
  };
}

// Backward-compatible alias
export { useCanvaInteractions as useInPlaceCanvasEditor };
