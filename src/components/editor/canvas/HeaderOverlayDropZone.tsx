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

const GAP = 8;
const BUTTON_WIDTH = 80;

/**
 * The overlay toggle, beside the header section — outside the canvas.
 *
 * Rendered outside the canvas frame so it stays cleanly out of the section's
 * content (and avoids covering the header CTA), while staying close to the
 * header and hero sections.
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
      const roomLeft = rect.left - GAP;
      const roomRight = window.innerWidth - rect.right - GAP;
      const left =
        roomLeft >= BUTTON_WIDTH
          ? rect.left - GAP - BUTTON_WIDTH
          : roomRight >= BUTTON_WIDTH
          ? rect.right + GAP
          : Math.max(GAP, rect.left + GAP);
      setPos({ top: rect.top + 8, left });
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
  }, [resolveHeader, revision, isOverlaid]);

  if (!pos) return null;

  return (
    <div
      className="fixed z-[9997] select-none pointer-events-auto"
      style={{ top: pos.top, left: pos.left, width: BUTTON_WIDTH }}
      data-xite-canvas-chrome=""
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleOverlay(!isOverlaid);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className={`flex w-full items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[10.5px] font-bold shadow-xs backdrop-blur-md transition-all duration-150 cursor-pointer ${
          isOverlaid
            ? "bg-slate-900/95 border-cyan-500/60 text-cyan-300 hover:bg-red-950/90 hover:border-red-500/60 hover:text-red-200"
            : "bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
        }`}
        title={
          isOverlaid
            ? `${headerTitle} is floating over ${heroTitle}. Click to remove the overlay.`
            : `Overlay ${headerTitle} on top of ${heroTitle}.`
        }
      >
        {isOverlaid ? <X className="h-3 w-3 shrink-0" /> : <Layers className="h-3 w-3 shrink-0" />}
        <span className="truncate">{isOverlaid ? "Overlaid" : "Overlay"}</span>
      </button>
    </div>
  );
}
