"use client";

import React, { useState, useRef } from "react";
import { Layers, MoveDown, Sparkles, Unlink } from "lucide-react";

interface HeaderOverlayDropZoneProps {
  isOverlaid: boolean;
  onToggleOverlay: (enable: boolean) => void;
  headerTitle?: string;
  heroTitle?: string;
}

export function HeaderOverlayDropZone({
  isOverlaid,
  onToggleOverlay,
  headerTitle = "Header",
  heroTitle = "Hero",
}: HeaderOverlayDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const startYRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    pointerIdRef.current = e.pointerId;
    startYRef.current = e.clientY;
    setIsDragging(true);
    setDragY(0);
    setDragProgress(0);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    const delta = e.clientY - startYRef.current;
    const clampedDelta = Math.max(0, delta);
    setDragY(clampedDelta);
    const progress = Math.min(1, clampedDelta / 55);
    setDragProgress(progress);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const wasTriggered = dragProgress >= 0.55 || dragY >= 40;
    setIsDragging(false);
    setDragY(0);
    setDragProgress(0);
    pointerIdRef.current = null;

    if (wasTriggered) {
      onToggleOverlay(!isOverlaid);
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragY(0);
    setDragProgress(0);
    pointerIdRef.current = null;
  };

  return (
    <div className="relative w-full select-none z-50 flex flex-col items-center">
      {/* Floating Action Badge between Header and Hero */}
      <div
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-50 transition-transform duration-150 ease-out"
        style={{
          transform: isDragging
            ? `translate(-50%, ${dragY}px) scale(1.03)`
            : "translate(-50%, 0px)",
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border text-xs font-semibold backdrop-blur-md cursor-grab active:cursor-grabbing transition-colors ${
            isOverlaid
              ? "bg-slate-900/90 text-cyan-300 border-cyan-500/50 hover:bg-slate-900 shadow-cyan-950/40"
              : isDragging
              ? "bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/40"
              : "bg-slate-900/85 hover:bg-slate-900 text-slate-100 border-slate-700/80 shadow-slate-950/40"
          }`}
          title={
            isOverlaid
              ? "Header is transparently overlaid on Hero. Click Detach to restore."
              : "Press and drag down over Hero to overlay, or click directly."
          }
        >
          {isOverlaid ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="font-bold tracking-tight text-[11px] text-cyan-200">
                  Header Overlaid on Hero
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleOverlay(false);
                }}
                className="ml-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 text-[10px] font-bold transition"
              >
                <Unlink className="w-3 h-3" />
                <span>Detach</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-slate-200">
                <MoveDown className={`w-3.5 h-3.5 transition-transform ${isDragging ? "translate-y-0.5 text-cyan-300" : "text-slate-400"}`} />
                <span className="text-[11px] font-medium text-slate-300">
                  {isDragging ? "Drop to overlay on Hero" : "Press and drag over Hero to overlay"}
                </span>
              </div>

              {/* Direct 1-click button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleOverlay(true);
                }}
                className="ml-0.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10.5px] shadow-xs transition"
              >
                <Layers className="w-3 h-3" />
                <span>Overlay on Hero</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Illuminated Drop Target on Hero section during active drag */}
      {isDragging && !isOverlaid && (
        <div
          className={`pointer-events-none absolute top-4 left-4 right-4 h-24 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1.5 backdrop-blur-xs ${
            dragProgress > 0.5
              ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_25px_rgba(6,182,212,0.25)]"
              : "border-indigo-400/80 bg-indigo-500/10"
          }`}
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 text-white text-xs font-bold shadow-md border border-cyan-400/50">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>{dragProgress > 0.5 ? "Release now to Overlay on Hero!" : "Drag down further onto Hero..."}</span>
          </div>
          <span className="text-[11px] font-medium text-cyan-100/80">
            {headerTitle} will float transparently over {heroTitle}
          </span>
        </div>
      )}
    </div>
  );
}
