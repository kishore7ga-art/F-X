"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

export interface DimensionBoundaries {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
}

export const DIMENSION_CONFIGS: Record<string, DimensionBoundaries> = {
  // Height properties
  "section height": { min: 200, max: 1200, step: 10, defaultValue: 560, unit: "px" },
  "height": { min: 200, max: 1200, step: 10, defaultValue: 560, unit: "px" },
  "min-height": { min: 200, max: 1200, step: 10, defaultValue: 560, unit: "px" },
  "minimum height": { min: 200, max: 1200, step: 10, defaultValue: 560, unit: "px" },

  // Width properties
  "content width": { min: 320, max: 1600, step: 20, defaultValue: 1200, unit: "px" },
  "container width": { min: 320, max: 1600, step: 20, defaultValue: 1200, unit: "px" },
  "max-width": { min: 320, max: 1600, step: 20, defaultValue: 1200, unit: "px" },
  "maximum width": { min: 320, max: 1600, step: 20, defaultValue: 1200, unit: "px" },
  "width": { min: 320, max: 1600, step: 20, defaultValue: 1200, unit: "px" },

  // Gap & Spacing (Clean & Bounded 0px - 80px)
  "element gap / spacing": { min: 0, max: 80, step: 4, defaultValue: 24, unit: "px" },
  "gap": { min: 0, max: 80, step: 4, defaultValue: 24, unit: "px" },
  "item spacing": { min: 0, max: 80, step: 4, defaultValue: 24, unit: "px" },
  "spacing": { min: 0, max: 80, step: 4, defaultValue: 24, unit: "px" },

  // Border Width (0px - 4px)
  "border width": { min: 0, max: 4, step: 1, defaultValue: 0, unit: "px" },
  "border-width": { min: 0, max: 4, step: 1, defaultValue: 0, unit: "px" },

  // Button Shape & Border Radius (0px - 999px)
  "shape / radius": { min: 0, max: 999, step: 2, defaultValue: 8, unit: "px" },
  "button shape": { min: 0, max: 999, step: 2, defaultValue: 8, unit: "px" },
  "border radius": { min: 0, max: 999, step: 2, defaultValue: 8, unit: "px" },
  "border-radius": { min: 0, max: 999, step: 2, defaultValue: 8, unit: "px" },
  "radius": { min: 0, max: 999, step: 2, defaultValue: 8, unit: "px" },

  // Default Fallback
  "default": { min: 0, max: 1400, step: 1, defaultValue: 0, unit: "px" },
};

/** Clamps a numeric value strictly within [min, max] boundaries */
export function clampDimensionValue(val: number, min: number, max: number): number {
  if (isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}

/** Extracts numeric portion from strings like "560px", "1200", "80%" */
export function parseNumericDimension(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const trimmed = String(raw).trim().toLowerCase();
  if (trimmed === "auto" || trimmed === "" || trimmed === "inherit" || trimmed === "initial") {
    return null;
  }
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return isNaN(num) ? null : num;
}

export interface BoundedDimensionControlProps {
  label: string;
  value: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  hint?: string;
  provenance?: string | null;
  onDraft: (value: string) => void;
  onCommit: (value: string) => void;
  className?: string;
}

export function BoundedDimensionControl({
  label,
  value,
  min: customMin,
  max: customMax,
  step: customStep,
  unit: customUnit,
  defaultValue: customDefault,
  hint,
  provenance,
  onDraft,
  onCommit,
  className = "",
}: BoundedDimensionControlProps) {
  // Resolve config boundaries based on property label
  const config = useMemo(() => {
    const key = label.toLowerCase().trim();
    const matched = DIMENSION_CONFIGS[key];
    if (matched) {
      return {
        min: matched.min,
        max: matched.max,
        step: matched.step,
        unit: customUnit ?? matched.unit,
        defaultValue: customDefault ?? matched.defaultValue,
      };
    }
    const def = DIMENSION_CONFIGS["default"];
    return {
      min: customMin ?? def.min,
      max: customMax ?? def.max,
      step: customStep ?? def.step,
      unit: customUnit ?? def.unit,
      defaultValue: customDefault ?? def.defaultValue,
    };
  }, [label, customMin, customMax, customStep, customUnit, customDefault]);

  const numericValue = parseNumericDimension(value);
  const isAuto = numericValue === null;

  // Local text input state for smooth typing without early clamping
  const [localInput, setLocalInput] = useState<string>(
    isAuto ? "" : String(numericValue)
  );

  // Sync with external value changes
  useEffect(() => {
    const nextNum = parseNumericDimension(value);
    setLocalInput(nextNum === null ? "" : String(nextNum));
  }, [value]);

  const activeSliderValue = isAuto
    ? config.defaultValue
    : clampDimensionValue(numericValue, config.min, config.max);

  // Calculate percentage for filled track
  const trackPercentage = useMemo(() => {
    const range = config.max - config.min;
    if (range <= 0) return 0;
    const progress = (activeSliderValue - config.min) / range;
    return Math.min(Math.max(progress * 100, 0), 100);
  }, [activeSliderValue, config.min, config.max]);

  // Handle Auto Toggle Click
  const handleToggleAuto = useCallback(() => {
    if (isAuto) {
      // Toggle from Auto to Default Numeric Value
      const clamped = clampDimensionValue(config.defaultValue, config.min, config.max);
      const formatted = `${clamped}${config.unit}`;
      setLocalInput(String(clamped));
      onDraft(formatted);
      onCommit(formatted);
    } else {
      // Reset to Auto
      setLocalInput("");
      onDraft("");
      onCommit("");
    }
  }, [isAuto, config, onDraft, onCommit]);

  // Handle Slider Movement
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawNum = parseFloat(e.target.value);
      const clamped = clampDimensionValue(rawNum, config.min, config.max);
      setLocalInput(String(clamped));
      const formatted = `${clamped}${config.unit}`;
      onDraft(formatted);
    },
    [config, onDraft]
  );

  // Handle Slider Mouse Up / Release
  const handleSliderCommit = useCallback(() => {
    if (localInput === "") {
      onCommit("");
      return;
    }
    const rawNum = parseFloat(localInput);
    const clamped = clampDimensionValue(rawNum, config.min, config.max);
    const formatted = `${clamped}${config.unit}`;
    onCommit(formatted);
  }, [localInput, config, onCommit]);

  // Handle Manual Text Input Typing
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Allow user to type freely (e.g. "auto", "5", "56", "560")
      setLocalInput(val);
      if (val.trim() === "" || val.trim().toLowerCase() === "auto") {
        onDraft("");
        return;
      }
      const num = parseFloat(val);
      if (!isNaN(num)) {
        // Live preview with current draft
        onDraft(`${num}${config.unit}`);
      }
    },
    [config, onDraft]
  );

  // Handle Input Blur / Enter Key Commit (with strict clamping)
  const handleInputBlur = useCallback(() => {
    const trimmed = localInput.trim().toLowerCase();
    if (trimmed === "" || trimmed === "auto" || trimmed === "inherit") {
      setLocalInput("");
      onDraft("");
      onCommit("");
      return;
    }
    const parsed = parseFloat(trimmed.replace(/[^\d.-]/g, ""));
    if (isNaN(parsed)) {
      setLocalInput("");
      onDraft("");
      onCommit("");
      return;
    }
    // Hard min/max clamping
    const clamped = clampDimensionValue(parsed, config.min, config.max);
    setLocalInput(String(clamped));
    const formatted = `${clamped}${config.unit}`;
    onDraft(formatted);
    onCommit(formatted);
  }, [localInput, config, onDraft, onCommit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    },
    []
  );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Header Row: Label, Provenance & 'Auto' Pill Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10.5px] font-bold text-slate-600 truncate">{label}</span>
          {provenance && (
            <span className="shrink-0 text-[9px] font-semibold text-slate-300 truncate" title={hint}>
              {provenance}
            </span>
          )}
        </div>

        {/* 'Auto' Toggle Pill Button */}
        <button
          type="button"
          onClick={handleToggleAuto}
          title={isAuto ? "Custom dimension override" : "Reset to automatic size"}
          className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold transition-all duration-150 ${
            isAuto
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200"
          }`}
        >
          Auto
        </button>
      </div>

      {/* Control Body: Horizontal Slider + Compact Unit Input Box */}
      <div className="flex items-center gap-2.5">
        {/* Sleek Neutral Slider Track */}
        <div className="relative flex-1 flex items-center h-6 group">
          {/* Background Track */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
            {/* Filled Progress Track (Muted Charcoal / Slate - No Bright Blue) */}
            <div
              className={`absolute top-0 left-0 bottom-0 transition-all duration-75 ${
                isAuto ? "bg-slate-300 opacity-40" : "bg-slate-800"
              }`}
              style={{ width: isAuto ? "0%" : `${trackPercentage}%` }}
            />
          </div>

          {/* Range Input Slider Overlay */}
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={activeSliderValue}
            onChange={handleSliderChange}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            title={`${label}: ${isAuto ? "auto" : `${activeSliderValue}${config.unit}`}`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {/* Custom Neutral Thumb (Crisp White Knob with Drop Shadow) */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border border-slate-300 shadow-md ring-1 ring-black/5 pointer-events-none transition-transform duration-75 group-hover:scale-110 ${
              isAuto ? "opacity-50" : "opacity-100"
            }`}
            style={{ left: isAuto ? "0%" : `${trackPercentage}%` }}
          />
        </div>

        {/* Compact Numeric Input with Unit Badge */}
        <div className="relative w-20 shrink-0">
          <input
            type="text"
            value={isAuto && localInput === "" ? "" : localInput}
            placeholder="auto"
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className={`w-full rounded-lg border px-2 py-1 text-[10.5px] font-semibold text-slate-800 outline-none transition text-left pr-5 placeholder:text-slate-300 ${
              isAuto
                ? "border-slate-200 bg-slate-50/70 text-slate-400 focus:bg-white focus:border-slate-400"
                : "border-slate-300 bg-white text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 shadow-sm"
            }`}
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
            {config.unit}
          </span>
        </div>
      </div>

      {/* Boundary Hint or Property Helper */}
      <div className="flex items-center justify-between text-[8.5px] text-slate-400 font-medium px-0.5">
        <span>{config.min}{config.unit}</span>
        <span>{config.max}{config.unit}</span>
      </div>
    </div>
  );
}
