"use client";

import React from "react";

export interface SingleRowButtonPanelProps {
  buttonCount: number;
  activeButtonIndex: number;
  onSelectButtonIndex: (index: number) => void;
  // Shape / Corner Radius
  radiusValue: string;
  onCommitRadius: (value: string) => void;
  // Shadow
  shadowValue: string;
  onCommitShadow: (value: string) => void;
  // Background Color
  bgValue: string;
  onDraftBg: (value: string) => void;
  onCommitBg: (value: string) => void;
  // Text Color
  textColorValue: string;
  onDraftTextColor: (value: string) => void;
  onCommitTextColor: (value: string) => void;
  // Border Stroke Width
  borderValue: string;
  onCommitBorder: (value: string) => void;
}

const SHADOW_PRESETS = [
  { label: "None", value: "" },
  { label: "Soft", value: "0 4px 14px -2px rgba(0, 0, 0, 0.12)" },
  { label: "Strong", value: "0 10px 25px -4px rgba(0, 0, 0, 0.28)" },
];

export function SingleRowButtonPanel({
  buttonCount,
  activeButtonIndex,
  onSelectButtonIndex,
  radiusValue,
  onCommitRadius,
  shadowValue,
  onCommitShadow,
  bgValue,
  onDraftBg,
  onCommitBg,
  textColorValue,
  onDraftTextColor,
  onCommitTextColor,
  borderValue,
  onCommitBorder,
}: SingleRowButtonPanelProps) {
  // Parse numeric corner radius (0px to 40px)
  const isAutoRadius = !radiusValue || radiusValue === "auto";
  const numericRadius = isAutoRadius ? 8 : Math.min(40, Math.max(0, parseInt(radiusValue.replace(/[^\d]/g, "")) || 0));

  const bgHex = bgValue && bgValue.startsWith("#") ? bgValue : "#2563eb";
  const textHex = textColorValue && textColorValue.startsWith("#") ? textColorValue : "#ffffff";

  return (
    <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto py-1 px-1 flex-nowrap w-full">
      {/* 1. Contextual Single-Button Switcher Pill (only if multiple buttons exist) */}
      {buttonCount > 1 && (
        <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 shrink-0">
          {Array.from({ length: buttonCount }).map((_, i) => {
            const active = i === activeButtonIndex;
            const label = i === 0 ? "Primary Button" : i === 1 ? "Secondary Button" : `Button ${i + 1}`;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectButtonIndex(i)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-150 ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Shape / Corner Radius: Single Slider (0px to 40px) with adjacent Auto toggle */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Radius</span>
        <input
          type="range"
          min={0}
          max={40}
          step={1}
          value={numericRadius}
          onChange={(e) => {
            onCommitRadius(`${e.target.value}px`);
          }}
          className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />
        <span className="text-[10.5px] font-mono font-bold text-slate-700 min-w-[28px] text-right">
          {isAutoRadius ? "Auto" : `${numericRadius}px`}
        </span>
        <button
          type="button"
          onClick={() => onCommitRadius("")}
          className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold transition border ${
            isAutoRadius
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          Auto
        </button>
      </div>

      {/* 3. Shadow: Segmented Control (None | Soft | Strong) */}
      <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Shadow</span>
        <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
          {SHADOW_PRESETS.map((preset) => {
            const active =
              (preset.label === "None" && (!shadowValue || shadowValue === "none")) ||
              (preset.label === "Soft" && shadowValue.includes("14px")) ||
              (preset.label === "Strong" && shadowValue.includes("25px"));
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onCommitShadow(preset.value)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition ${
                  active
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Colors: Background color swatch & Text color swatch pickers */}
      <div className="flex items-center gap-3 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
        {/* Background Swatch */}
        <div className="flex items-center gap-1.5" title="Button Background Colour">
          <span className="text-[10.5px] font-bold text-slate-500">Bg</span>
          <div className="relative w-6 h-6 rounded-full border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0">
            <input
              type="color"
              value={bgHex}
              onChange={(e) => onDraftBg(e.target.value)}
              onBlur={(e) => onCommitBg(e.target.value)}
              className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
            />
            <div className="w-full h-full" style={{ backgroundColor: bgValue || "#2563eb" }} />
          </div>
        </div>

        {/* Text Colour Swatch */}
        <div className="flex items-center gap-1.5" title="Button Text Colour">
          <span className="text-[10.5px] font-bold text-slate-500">Text</span>
          <div className="relative w-6 h-6 rounded-full border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0">
            <input
              type="color"
              value={textHex}
              onChange={(e) => onDraftTextColor(e.target.value)}
              onBlur={(e) => onCommitTextColor(e.target.value)}
              className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
            />
            <div
              className="w-full h-full flex items-center justify-center font-black text-[10px] border"
              style={{
                backgroundColor: textColorValue || "#ffffff",
                color: textColorValue === "#ffffff" ? "#0f172a" : "#ffffff",
              }}
            >
              A
            </div>
          </div>
        </div>
      </div>

      {/* 5. Border Stroke: Minimal border width segmented selector (0px to 3px) */}
      <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Stroke</span>
        <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
          {["0px", "1px", "2px", "3px"].map((widthStr) => {
            const active =
              (borderValue || "0px").replace(/\s/g, "") === widthStr ||
              (widthStr === "0px" && (!borderValue || borderValue === "0" || borderValue === "none"));
            return (
              <button
                key={widthStr}
                type="button"
                onClick={() => onCommitBorder(widthStr === "0px" ? "" : widthStr)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                  active
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {widthStr}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Backward-compatible exports if referenced elsewhere
export { SingleRowButtonPanel as ButtonShapeControl };
export { SingleRowButtonPanel as ButtonShadowSegmentedControl };
