"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { canMove } from "@/lib/section-variants";

interface SectionOutsideControlsProps {
  sections: ReadonlyArray<{ id: string; title?: string; category?: string; code?: string }>;
  onMoveSection: (index: number, direction: 1 | -1) => void;
  revision: string;
}

const GAP = 8;
const PILL_WIDTH = 58;

export function SectionOutsideControls({
  sections,
  onMoveSection,
  revision,
}: SectionOutsideControlsProps) {
  const [positions, setPositions] = useState<Array<{ top: number; left: number; index: number; id: string }>>([]);

  const measureAll = useCallback(() => {
    if (sections.length <= 1) {
      setPositions([]);
      return;
    }

    const nextPositions: Array<{ top: number; left: number; index: number; id: string }> = [];

    sections.forEach((sec, idx) => {
      const isHeader =
        sec.category === "navbar" ||
        sec.title?.toLowerCase().includes("header") ||
        sec.title?.toLowerCase().includes("navbar");
      if (isHeader) return; // Navbar stays at top, no move pill needed

      const el = document.querySelector<HTMLElement>(`[data-xite-section="${sec.id}"]`);
      if (!el || !el.isConnected) return;

      const rect = el.getBoundingClientRect();
      // Only render if element is in/near viewport
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;

      const roomRight = window.innerWidth - rect.right - GAP;
      const left = roomRight >= PILL_WIDTH ? rect.right + GAP : Math.max(GAP, rect.left - GAP - PILL_WIDTH);
      const top = rect.top + 8;

      nextPositions.push({ top, left, index: idx, id: sec.id });
    });

    setPositions(nextPositions);
  }, [sections]);

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          measureAll();
        });
      }
    };

    schedule();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [measureAll, revision]);

  if (sections.length <= 1 || positions.length === 0) return null;

  return (
    <>
      {positions.map((pos) => {
        const canUp = canMove(sections as any, pos.index, -1);
        const canDown = canMove(sections as any, pos.index, 1);

        return (
          <div
            key={pos.id}
            data-xite-canvas-chrome=""
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="fixed z-[9996] flex items-center bg-white/95 text-slate-700 backdrop-blur-md border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.08)] rounded-xl p-0.5 transition-all duration-75 select-none opacity-85 hover:opacity-100 pointer-events-auto"
            style={{
              top: pos.top,
              left: pos.left,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMoveSection(pos.index, -1);
              }}
              disabled={!canUp}
              title="Move Section Up"
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2]" />
            </button>
            <div className="w-px h-3 bg-slate-200" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMoveSection(pos.index, 1);
              }}
              disabled={!canDown}
              title="Move Section Down"
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        );
      })}
    </>
  );
}
