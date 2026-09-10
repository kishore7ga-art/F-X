"use client";

import React from "react";
import { Layers, X } from "lucide-react";

interface HeaderOverlayDropZoneProps {
  isOverlaid: boolean;
  onToggleOverlay: (enable: boolean) => void;
  headerTitle?: string;
  heroTitle?: string;
}

/**
 * The overlay toggle, pinned to the top-right corner of the header section on
 * the canvas. One click floats the header over the hero, the next detaches it.
 *
 * It renders inside the header's wrapper, so the wrapper must be positioned —
 * it always is (`relative` or `absolute`, see the canvas style in EditorStudio).
 */
export function HeaderOverlayDropZone({
  isOverlaid,
  onToggleOverlay,
  headerTitle = "Header",
  heroTitle = "Hero",
}: HeaderOverlayDropZoneProps) {
  return (
    <div
      /* `pointer-events-none` + `xite-editor-ui`: the classes every DOM read-back
         strips, so the button never ends up in the stored section markup. */
      className="xite-editor-ui pointer-events-none absolute top-2 right-2 z-[200] select-none"
      data-xite-canvas-chrome=""
      onMouseDownCapture={(e) => e.stopPropagation()}
      onDoubleClickCapture={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleOverlay(!isOverlaid);
        }}
        className={`pointer-events-auto flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold leading-none shadow-md backdrop-blur-md transition-all duration-150 cursor-pointer ${
          isOverlaid
            ? "bg-slate-900/95 border-cyan-500/60 text-cyan-200 hover:bg-red-950/90 hover:border-red-500/60 hover:text-red-200"
            : "bg-white/95 border-slate-200 text-slate-800 hover:border-indigo-500 hover:text-indigo-600"
        }`}
        title={
          isOverlaid
            ? `${headerTitle} is floating over ${heroTitle}. Click to remove the overlay.`
            : `Overlay ${headerTitle} on top of ${heroTitle}.`
        }
      >
        {isOverlaid ? <X className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
        <span>{isOverlaid ? "Remove overlay" : "Overlay"}</span>
      </button>
    </div>
  );
}
