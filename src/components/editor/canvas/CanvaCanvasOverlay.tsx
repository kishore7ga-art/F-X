"use client";

import React from "react";
import { GripVertical } from "lucide-react";
import type { SelectedElementInfo, DropIndicatorInfo } from "./useCanvaInteractions";
import type { SnapGuide, DistanceBadge } from "@/stores/useVisualCanvasStore";

interface CanvaCanvasOverlayProps {
  selectedElement: SelectedElementInfo | null;
  hoveredRect: { rect: DOMRect; label: string } | null;
  isEditingText: boolean;
  isDragging: boolean;
  snapGuides: SnapGuide[];
  distanceBadges: DistanceBadge[];
  dropIndicator: DropIndicatorInfo | null;
  onDragStart?: (e: React.MouseEvent<HTMLElement>, element: HTMLElement, sectionIndex: number) => void;
  onStartEdit?: (element: HTMLElement, sectionIndex: number) => void;
}

export function CanvaCanvasOverlay({
  selectedElement,
  hoveredRect,
  isEditingText,
  isDragging,
  snapGuides,
  distanceBadges,
  dropIndicator,
  onDragStart,
  onStartEdit,
}: CanvaCanvasOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[99990] overflow-hidden select-none">
      {/* 1. Subtle Hover Box (when not selected / not editing) */}
      {!isEditingText && !isDragging && hoveredRect && (!selectedElement || selectedElement.element !== (hoveredRect as any).element) && (
        <div
          className="absolute border border-dashed border-blue-400/80 bg-blue-500/5 transition-all duration-75 pointer-events-none rounded-[2px]"
          style={{
            left: `${hoveredRect.rect.left}px`,
            top: `${hoveredRect.rect.top}px`,
            width: `${hoveredRect.rect.width}px`,
            height: `${hoveredRect.rect.height}px`,
          }}
        >
          <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-blue-600 text-white font-sans font-bold text-[9px] uppercase tracking-wider shadow-xs">
            {hoveredRect.label}
          </span>
        </div>
      )}

      {/* 2. Selection Bounding Box with 4 Corner Anchor Dots */}
      {selectedElement && !isEditingText && (
        <div
          className="absolute border border-blue-600 ring-1 ring-blue-500/30 transition-none pointer-events-none rounded-[2px]"
          style={{
            left: `${selectedElement.rect.left}px`,
            top: `${selectedElement.rect.top}px`,
            width: `${selectedElement.rect.width}px`,
            height: `${selectedElement.rect.height}px`,
          }}
        >
          {/* Top Label Badge & Drag Handle */}
          <div
            onMouseDown={(e) => {
              if (onDragStart) {
                onDragStart(e, selectedElement.element, selectedElement.sectionIndex);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onStartEdit) {
                onStartEdit(selectedElement.element, selectedElement.sectionIndex);
              }
            }}
            className="pointer-events-auto absolute -top-6 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded-t bg-blue-600 text-white font-sans font-bold text-[9.5px] uppercase tracking-wider shadow-xs cursor-grab active:cursor-grabbing hover:bg-blue-700 transition"
          >
            <GripVertical className="w-3 h-3 text-white/90" />
            <span>{selectedElement.label}</span>
          </div>

          {/* 4 Corner Anchor Dots */}
          {/* Top-Left */}
          <div
            className="absolute -left-1 -top-1 w-[7px] h-[7px] bg-white border-[1.5px] border-blue-600 rounded-[1px] shadow-xs pointer-events-none"
          />
          {/* Top-Right */}
          <div
            className="absolute -right-1 -top-1 w-[7px] h-[7px] bg-white border-[1.5px] border-blue-600 rounded-[1px] shadow-xs pointer-events-none"
          />
          {/* Bottom-Left */}
          <div
            className="absolute -left-1 -bottom-1 w-[7px] h-[7px] bg-white border-[1.5px] border-blue-600 rounded-[1px] shadow-xs pointer-events-none"
          />
          {/* Bottom-Right */}
          <div
            className="absolute -right-1 -bottom-1 w-[7px] h-[7px] bg-white border-[1.5px] border-blue-600 rounded-[1px] shadow-xs pointer-events-none"
          />
        </div>
      )}

      {/* 3. Magnetic Snap Guidelines (#ec4899 Magenta) with Strict Deduplication */}
      {Array.from(
        new Map(snapGuides.map((g) => [`${g.orientation}-${Math.round(g.coordinate)}`, g])).values()
      ).map((line, idx) => {
        const guideKey = `guide-${line.orientation}-${Math.round(line.coordinate)}-${idx}`;
        if (line.orientation === "vertical") {
          return (
            <div
              key={guideKey}
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: `${line.coordinate}px`,
                width: "1.5px",
                backgroundColor: line.color || "#ec4899",
                boxShadow: `0 0 8px ${line.color || "#ec4899"}99, 0 0 2px ${line.color || "#ec4899"}`,
              }}
            >
              {/* Endpoint anchor nodes */}
              <div
                className="absolute top-0 -left-1 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: line.color || "#ec4899" }}
              />
              <div
                className="absolute bottom-0 -left-1 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: line.color || "#ec4899" }}
              />
            </div>
          );
        }

        return (
          <div
            key={guideKey}
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: `${line.coordinate}px`,
              height: "1.5px",
              backgroundColor: line.color || "#ec4899",
              boxShadow: `0 0 8px ${line.color || "#ec4899"}99, 0 0 2px ${line.color || "#ec4899"}`,
            }}
          >
            <div
              className="absolute left-0 -top-1 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: line.color || "#ec4899" }}
            />
            <div
              className="absolute right-0 -top-1 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: line.color || "#ec4899" }}
            />
          </div>
        );
      })}

      {/* 4. Distance Badges (Gap Indicators, e.g., 24px) with Strict Deduplication */}
      {Array.from(
        new Map(
          distanceBadges.map((b) => [
            `${b.orientation}-${b.distance}-${Math.round(b.x)}-${Math.round(b.y)}`,
            b,
          ])
        ).values()
      ).map((dist, idx) => {
        const badgeKey = `dist-badge-${dist.orientation}-${dist.distance}-${Math.round(dist.x)}-${Math.round(dist.y)}-${idx}`;
        const isHorizontal = dist.orientation === "horizontal";
        return (
          <div
            key={badgeKey}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-50"
            style={{ left: `${dist.x}px`, top: `${dist.y}px` }}
          >
            {/* Dimension Line */}
            {isHorizontal ? (
              <div
                className="absolute h-0.5 bg-pink-500/80 -translate-y-1/2"
                style={{ width: `${dist.distance}px` }}
              />
            ) : (
              <div
                className="absolute w-0.5 bg-pink-500/80 -translate-x-1/2"
                style={{ height: `${dist.distance}px` }}
              />
            )}

            {/* Pill Badge */}
            <span className="relative z-10 px-1.5 py-0.5 rounded-md bg-pink-600 text-white font-mono font-bold text-[9px] shadow-md border border-white/30">
              {dist.distance}px
            </span>
          </div>
        );
      })}

      {/* 5. Drop Insertion Indicator (Flex / Grid flow) */}
      {dropIndicator && (
        <div
          className="absolute bg-blue-600 pointer-events-none z-50 shadow-[0_0_8px_rgba(37,99,235,0.7)]"
          style={{
            left: `${dropIndicator.x}px`,
            top: `${dropIndicator.y}px`,
            width: `${dropIndicator.width}px`,
            height: `${dropIndicator.height}px`,
            borderRadius: "2px",
          }}
        >
          {dropIndicator.orientation === "vertical" ? (
            <>
              <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-blue-600 border border-white" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-blue-600 border border-white" />
            </>
          ) : (
            <>
              <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-blue-600 border border-white" />
              <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-blue-600 border border-white" />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Backward-compatible alias
export { CanvaCanvasOverlay as InPlaceCanvasOverlay };
