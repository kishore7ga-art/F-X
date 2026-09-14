"use client";

import React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { PalettePillPreview } from "./PalettePillPreview";
import type { PalettePreset, ColorTokenMap } from "@/lib/editor-themes";

interface PaletteCardProps {
  preset: PalettePreset;
  selected: boolean;
  onSelect: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  tokens?: ColorTokenMap;
  className?: string;
}

/**
 * Squarespace 7.1 Selection Card Shell
 *
 * Uniform height (64px), rounded corners (12px), pill previews on the left (5 equal color segments),
 * title in the center, radio/checkmark on the far right.
 * Custom card retains the exact same shape and pill structure, with an indicator chevron.
 */
export function PaletteCard({
  preset,
  selected,
  onSelect,
  isExpanded = false,
  onToggleExpand,
  tokens,
  className = "",
}: PaletteCardProps) {
  const activeTokens = tokens ?? preset.tokens;

  const handleClick = () => {
    if (preset.isCustom && selected && onToggleExpand) {
      onToggleExpand();
    } else {
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-pressed={selected}
      aria-expanded={preset.isCustom ? isExpanded : undefined}
      className={`group relative flex h-16 min-h-[64px] w-full items-center justify-between rounded-xl border px-4 transition-all duration-200 cursor-pointer select-none ${
        selected
          ? "border-slate-950 ring-2 ring-slate-950/10 shadow-sm dark:border-white dark:ring-white/20 bg-slate-50/70 dark:bg-slate-900"
          : "border-slate-200 bg-white hover:border-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
      } ${className}`}
      data-testid={`palette-card-${preset.id}`}
    >
      {/* Left section: PalettePillPreview + Typography stack */}
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        <PalettePillPreview tokens={activeTokens} />
        <div className="flex flex-col truncate">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {preset.name}
          </span>
          {preset.isCustom && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              Click to customize
            </span>
          )}
        </div>
      </div>

      {/* Right section: Chevron (if custom) + Radio circle with checkmark */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {preset.isCustom && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!selected) {
                onSelect();
              } else if (onToggleExpand) {
                onToggleExpand();
              }
            }}
            aria-label={isExpanded ? "Collapse custom palette controls" : "Expand custom palette controls"}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Radio indicator circle */}
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
            selected
              ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
              : "border-slate-300 bg-transparent group-hover:border-slate-400 dark:border-slate-600"
          }`}
        >
          {selected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
        </div>
      </div>
    </div>
  );
}
