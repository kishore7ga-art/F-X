"use client";

import React, { useMemo } from "react";
import type { SnapGuide, DistanceBadge } from "@/stores/useVisualCanvasStore";

interface SnapGuidesProps {
  guides: SnapGuide[];
  distanceBadges: DistanceBadge[];
  sectionWidth?: number;
  sectionHeight?: number;
}

export function SnapGuides({
  guides,
  distanceBadges,
  sectionWidth = 1200,
  sectionHeight = 600,
}: SnapGuidesProps) {
  // 1. Filter & Deduplicate Matches: Remove duplicate snap lines sharing the same axis and position
  const uniqueGuides = useMemo(() => {
    const seen = new Set<string>();
    return guides.filter((g) => {
      const key = `${g.orientation}-${Math.round(g.coordinate)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [guides]);

  // 2. Filter & Deduplicate Distance Badges: Remove duplicate badges at identical coordinates
  const uniqueBadges = useMemo(() => {
    const seen = new Set<string>();
    return distanceBadges.filter((b) => {
      const key = `${b.orientation}-${b.distance}-${Math.round(b.x)}-${Math.round(b.y)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [distanceBadges]);

  if (uniqueGuides.length === 0 && uniqueBadges.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 overflow-hidden select-none"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      {/* 1. Alignment Guide Lines with Strictly Unique Keys */}
      {uniqueGuides.map((line, idx) => {
        const uniqueKey = `guide-${line.orientation}-${Math.round(line.coordinate)}-${idx}`;
        const isVertical = line.orientation === "vertical";

        if (isVertical) {
          return (
            <div
              key={uniqueKey}
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: `${line.coordinate}px`,
                width: "1.5px",
                backgroundColor: line.color || "#ec4899",
                boxShadow: `0 0 8px ${line.color || "#ec4899"}99, 0 0 2px ${line.color || "#ec4899"}`,
              }}
            >
              {/* Endpoint Anchor Nodes */}
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

        // Horizontal Guide Line
        return (
          <div
            key={uniqueKey}
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

      {/* 2. Dynamic Distance Badges & Gap Indicators with Strictly Unique Keys */}
      {uniqueBadges.map((dist, idx) => {
        const uniqueBadgeKey = `dist-badge-${dist.orientation}-${dist.distance}-${Math.round(dist.x)}-${Math.round(dist.y)}-${idx}`;
        const isHorizontal = dist.orientation === "horizontal";

        return (
          <div
            key={uniqueBadgeKey}
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
    </div>
  );
}
