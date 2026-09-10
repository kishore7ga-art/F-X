"use client";

import React, { useEffect, useState } from "react";
import { Layers, X } from "lucide-react";

interface HeaderOverlayDropZoneProps {
  isOverlaid: boolean;
  onToggleOverlay: (enable: boolean) => void;
  /** Looks up the header section's wrapper on the canvas; null when there is none. */
  resolveHeader: () => HTMLElement | null;
  /** Changes when the canvas may have moved or been rebuilt, to re-measure. */
  revision: string;
  headerTitle?: string;
  heroTitle?: string;
}

const GAP = 12;
const BUTTON_WIDTH = 132;

/**
 * The overlay toggle, beside the header section — outside the canvas.
 *
 * It used to sit inside the header's top-right corner, which put it on top of
 * whatever the header keeps there: usually its call-to-action button. And it
 * cannot simply hang off the wrapper's edge, because the canvas frame is
 * `overflow: hidden` (and scaled), so anything past the edge is clipped.
 *
 * So it is rendered outside the canvas altogether, fixed to the viewport, and
 * follows the header wrapper's rect — to its right when there is room, to its
 * left when the canvas fills the pane. The same measuring pattern as the
 * selection highlight: rAF on scroll and resize, ResizeObserver on the wrapper.
 */
export function HeaderOverlayDropZone({
  isOverlaid,
  onToggleOverlay,
  resolveHeader,
  revision,
  headerTitle = "Header",
  heroTitle = "Hero",
}: HeaderOverlayDropZoneProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    let frame = 0;
    let observed: HTMLElement | null = null;
    const observer = new ResizeObserver(() => schedule());

    const measure = () => {
      frame = 0;
      const header = resolveHeader();
      if (!header || !header.isConnected) {
        setPos(null);
        return;
      }
      if (observed !== header) {
        if (observed) observer.unobserve(observed);
        observer.observe(header);
        observed = header;
      }
      const rect = header.getBoundingClientRect();
      const roomRight = window.innerWidth - rect.right - GAP;
      const left = roomRight >= BUTTON_WIDTH ? rect.right + GAP : Math.max(GAP, rect.left - GAP - BUTTON_WIDTH);
      setPos({ top: rect.top, left });
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    schedule();
    observer.observe(document.documentElement);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [resolveHeader, revision]);

  if (!pos) return null;

  return (
    <div
      className="fixed z-[9997] select-none"
      style={{ top: pos.top, left: pos.left, width: BUTTON_WIDTH }}
      data-xite-canvas-chrome=""
      onMouseDownCapture={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleOverlay(!isOverlaid);
        }}
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold leading-none shadow-md backdrop-blur-md transition-all duration-150 cursor-pointer ${
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
