"use client";

import React from "react";
import type { ColorTokenMap } from "@/lib/editor-themes";

interface PalettePillPreviewProps {
  tokens: ColorTokenMap;
  className?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Squarespace 7.1 Style 5-Segment Palette Pill Preview
 *
 * Container: flex h-9 w-24 overflow-hidden rounded-full border border-slate-300 dark:border-slate-700 shadow-inner
 * 5 Children segments:
 * - Each segment occupies flex-1 width (w-1/5)
 * - Colors directly bind to tokens.light1, tokens.light2, tokens.accent, tokens.dark1, tokens.dark2
 * - Subtle vertical separator line between colors: border-r border-black/5 dark:border-white/10 last:border-r-0
 */
export function PalettePillPreview({
  tokens,
  className = "",
  width,
  height,
}: PalettePillPreviewProps) {
  const segments = [
    { key: "light1", label: "Light Neutral 1 (Canvas)", color: tokens.light1 },
    { key: "light2", label: "Light Neutral 2 (Card Layer)", color: tokens.light2 },
    { key: "accent", label: "Primary / Accent (Brand)", color: tokens.accent },
    { key: "dark1", label: "Dark Neutral 1 (Secondary / Border)", color: tokens.dark1 },
    { key: "dark2", label: "Dark Neutral 2 (Headings & Text)", color: tokens.dark2 },
  ];

  return (
    <div
      className={`flex h-9 w-24 overflow-hidden rounded-full border border-slate-300 dark:border-slate-700 shadow-inner flex-shrink-0 ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
      role="img"
      aria-label={`Palette preview: ${segments.map((s) => s.color).join(", ")}`}
    >
      {segments.map((seg) => (
        <span
          key={seg.key}
          className="flex-1 h-full border-r border-black/5 dark:border-white/10 last:border-r-0 transition-colors duration-150"
          style={{ backgroundColor: seg.color }}
          title={`${seg.label}: ${seg.color}`}
          data-testid={`pill-segment-${seg.key}`}
        />
      ))}
    </div>
  );
}
