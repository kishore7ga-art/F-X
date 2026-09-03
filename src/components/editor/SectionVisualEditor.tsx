"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, Layers, Check, Move } from "lucide-react";
import type { ViewportState } from "@/lib/viewport-presets";
import type { EditorThemeId, EditorFontId } from "@/lib/editor-themes";
import { ResponsiveCanvas } from "@/components/preview/ResponsiveCanvas";
import { useCanvaInteractions, getElementLabel } from "./canvas/useCanvaInteractions";
import { CanvaCanvasOverlay } from "./canvas/CanvaCanvasOverlay";

interface SectionVisualEditorProps {
  isOpen: boolean;
  section: { id: string; title: string; code: string; category?: string } | null;
  onClose: () => void;
  onUpdateSectionCode: (newCode: string) => void;
  viewport: ViewportState;
  themeId: EditorThemeId | null;
  fontId: EditorFontId | null;
  /** The same tokenize+render pipeline the main canvas and the published site use. */
  canvasHtml: (code: string) => string;
}

/**
 * Elements a click can select for repositioning.
 *
 * Kept close to the tag list `handleElementDoubleClick` already resolves text
 * edits against, so clicking a button selects the button rather than the
 * icon glyph or text run nested inside it.
 */
const SELECTABLE_SELECTOR =
  "button, a, img, svg, h1, h2, h3, h4, h5, h6, p, li, label, figcaption, [data-card], .card";

/**
 * A full-screen, single-section canvas: exactly one section rendered alone,
 * nothing else on the page competing for attention, where elements can be
 * clicked and dragged to reposition with the same magnetic snap guides and
 * gap-distance badges the main studio canvas computes but never renders.
 *
 * Replaces the earlier grid-of-thumbnail-cards reorder tool: that only moved
 * whole cards around a fixed grid, it couldn't touch a button or a heading,
 * and it showed a scaled-down static preview rather than the live section.
 */
export function SectionVisualEditor({
  isOpen,
  section,
  onClose,
  onUpdateSectionCode,
  viewport,
  themeId,
  fontId,
  canvasHtml,
}: SectionVisualEditorProps) {
  const [savedFlash, setSavedFlash] = useState(false);

  const flashSaved = useCallback((message: string) => {
    const lower = message.toLowerCase();
    if (!lower.includes("updated") && !lower.includes("moved")) return;
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }, []);

  const inPlaceEditor = useCanvaInteractions({
    sections: section ? [section] : [],
    activeSectionIndex: 0,
    onUpdateSectionCode: (_sectionIndex, newBodyHtml) => onUpdateSectionCode(newBodyHtml),
    showToast: flashSaved,
  });

  const { setSelectedElement, setHoveredRect, isEditingText, selectedElement, finishInlineTextEditing } =
    inPlaceEditor;

  // A fresh section (or a fresh open) starts with nothing selected — the
  // previous selection may point at a node from a different section's DOM.
  useEffect(() => {
    setSelectedElement(null);
    setHoveredRect(null);
  }, [section?.id, isOpen, setSelectedElement, setHoveredRect]);

  // Escape steps back one level at a time (finish edit, then deselect, then
  // close) and is intercepted in the capture phase so the studio underneath
  // — still mounted behind this full-screen overlay — never also reacts to it.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      if (isEditingText) {
        finishInlineTextEditing(true);
        return;
      }
      if (selectedElement) {
        setSelectedElement(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, isEditingText, selectedElement, finishInlineTextEditing, setSelectedElement, onClose]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (anchor) e.preventDefault();
      if (isEditingText) return;

      const container = e.currentTarget as HTMLElement;
      const raw = e.target as HTMLElement;
      if (raw === container) {
        setSelectedElement(null);
        return;
      }

      const resolved = raw.closest(SELECTABLE_SELECTOR) as HTMLElement | null;
      const target = resolved && container.contains(resolved) ? resolved : raw;
      e.stopPropagation();
      setSelectedElement({
        tag: target.tagName.toLowerCase(),
        label: getElementLabel(target),
        rect: target.getBoundingClientRect(),
        element: target,
        sectionIndex: 0,
      });
    },
    [isEditingText, setSelectedElement],
  );

  /**
   * Click-and-hold directly on an element to move it — no separate "select,
   * then grab the little handle above it" step. Selecting and starting the
   * drag happen together on mousedown; if the pointer never actually moves
   * past a few pixels (an ordinary click), handlePointerDragStart's own
   * activation threshold makes this a no-op beyond the selection.
   */
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0 || isEditingText) return;

      const container = e.currentTarget as HTMLElement;
      const raw = e.target as HTMLElement;
      if (raw === container) return;

      const resolved = raw.closest(SELECTABLE_SELECTOR) as HTMLElement | null;
      const target = resolved && container.contains(resolved) ? resolved : raw;

      setSelectedElement({
        tag: target.tagName.toLowerCase(),
        label: getElementLabel(target),
        rect: target.getBoundingClientRect(),
        element: target,
        sectionIndex: 0,
      });
      inPlaceEditor.handlePointerDragStart(e, target, 0);
    },
    [isEditingText, setSelectedElement, inPlaceEditor],
  );

  const handleCanvasMouseOver = useCallback(
    (e: React.MouseEvent) => {
      if (isEditingText || inPlaceEditor.isDragging) return;
      const container = e.currentTarget as HTMLElement;
      const raw = e.target as HTMLElement;
      if (raw === container) return;
      const resolved = raw.closest(SELECTABLE_SELECTOR) as HTMLElement | null;
      const target = resolved && container.contains(resolved) ? resolved : raw;
      setHoveredRect({ rect: target.getBoundingClientRect(), label: getElementLabel(target) });
    },
    [isEditingText, inPlaceEditor.isDragging, setHoveredRect],
  );

  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredRect(null);
  }, [setHoveredRect]);

  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      inPlaceEditor.handleElementDoubleClick(e.target as HTMLElement, 0, e);
    },
    [inPlaceEditor],
  );

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-xite-section]")) {
        setSelectedElement(null);
      }
    },
    [setSelectedElement],
  );

  if (!isOpen || !section) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Visual editor for ${section.title}`}
      className="fixed inset-0 z-[99999] flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Header Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3.5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Visual Editor</h2>
              <span className="rounded-md bg-blue-600/30 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300">
                {section.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Move className="h-3 w-3 shrink-0" />
              Click an element, drag its handle to reposition. Snap guides show alignment and gaps — double-click text to edit it.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {savedFlash && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-in fade-in">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 active:scale-95 transition"
          >
            Done
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Isolated single-section canvas */}
      <main
        onClick={handleBackgroundClick}
        className="flex-1 overflow-auto cursor-pointer"
        style={{
          backgroundColor: "#0f172a",
          backgroundImage:
            "radial-gradient(rgba(148, 163, 184, 0.45) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        <ResponsiveCanvas
          viewport={viewport}
          themeId={themeId}
          fontId={fontId}
          paneClassName="py-10"
          chromeClassName="shadow-2xl rounded-2xl border border-slate-300 bg-white"
        >
          <div
            data-xite-section={section.id}
            onMouseDown={handleCanvasMouseDown}
            onClickCapture={handleCanvasClick}
            onDoubleClickCapture={handleCanvasDoubleClick}
            onMouseOver={handleCanvasMouseOver}
            onMouseLeave={handleCanvasMouseLeave}
            className="xite-visual-editor-guides relative w-full cursor-default border border-dashed border-slate-600/60 rounded-xl"
          >
            <span className="pointer-events-none absolute -top-6 left-0 z-10 rounded-md border border-slate-600/60 bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 shadow-xs">
              {section.title}
            </span>
            <style>{`
              .xite-visual-editor-guides :where(button, a, img, svg, h1, h2, h3, h4, h5, h6, p, li, label, figcaption, [data-card], .card) {
                box-shadow: 0 0 0 1px rgba(100, 116, 139, 0.4);
                border-radius: 0.5rem;
                transition: box-shadow 150ms ease;
              }
              .xite-visual-editor-guides :where(button, a, img, svg, h1, h2, h3, h4, h5, h6, p, li, label, figcaption, [data-card], .card):hover {
                box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.9);
              }
            `}</style>
            <div
              dangerouslySetInnerHTML={{ __html: canvasHtml(section.code) }}
              style={{ display: "contents" }}
            />
          </div>
        </ResponsiveCanvas>
      </main>

      <CanvaCanvasOverlay
        selectedElement={inPlaceEditor.selectedElement}
        hoveredRect={inPlaceEditor.hoveredRect}
        isEditingText={inPlaceEditor.isEditingText}
        isDragging={inPlaceEditor.isDragging}
        snapGuides={inPlaceEditor.snapGuides}
        distanceBadges={inPlaceEditor.distanceBadges}
        dropIndicator={inPlaceEditor.dropIndicator}
        dropZoneRect={inPlaceEditor.dropZoneRect}
        onDragStart={inPlaceEditor.handlePointerDragStart}
        onStartEdit={(element, sectionIndex) => inPlaceEditor.handleElementDoubleClick(element, sectionIndex)}
      />
    </div>
  );
}
