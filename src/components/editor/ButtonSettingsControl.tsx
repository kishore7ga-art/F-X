"use client";

import React from "react";
import { hexFromValue } from "@/lib/sections/section-edit";

export interface SingleRowButtonPanelProps {
  buttonCount: number;
  activeButtonIndex: number;
  onSelectButtonIndex: (index: number) => void;
  // Button Background Color
  bgValue: string;
  onDraftBg: (value: string) => void;
  onCommitBg: (value: string) => void;
  // Button Box Shape / Corner Radius
  radiusValue: string;
  onCommitRadius: (value: string) => void;
  // Button Size (Box Sizing)
  sizeValue?: string;
  onCommitSize?: (value: string) => void;
  // Button Text Color
  textColorValue: string;
  onDraftTextColor: (value: string) => void;
  onCommitTextColor: (value: string) => void;
  // Backward compatibility optional props
  borderValue?: string;
  onCommitBorder?: (value: string) => void;
  shadowValue?: string;
  onCommitShadow?: (value: string) => void;
}

const BUTTON_SIZES = [
  { label: "Small", value: "6px 14px" },
  { label: "Medium", value: "10px 20px" },
  { label: "Large", value: "14px 28px" },
];

export function SingleRowButtonPanel({
  buttonCount,
  activeButtonIndex,
  onSelectButtonIndex,
  bgValue,
  onDraftBg,
  onCommitBg,
  radiusValue,
  onCommitRadius,
  sizeValue,
  onCommitSize,
  textColorValue,
  onDraftTextColor,
  onCommitTextColor,
}: SingleRowButtonPanelProps) {
  // Parse numeric corner radius (0px to 40px)
  const safeRadius = String(radiusValue ?? "").trim();
  const isAutoRadius = !safeRadius || safeRadius === "auto";
  const numericRadius = isAutoRadius ? 8 : Math.min(40, Math.max(0, parseInt(safeRadius.replace(/[^\d]/g, ""), 10) || 0));

  const bgHex = hexFromValue(String(bgValue ?? ""), "#2563eb");
  const textHex = hexFromValue(String(textColorValue ?? ""), "#ffffff");

  return (
    <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1 px-1 flex-nowrap w-full">
      {/* Button Selector: Only shown if more than 1 button exists */}
      {buttonCount > 1 && (
        <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-0.5 rounded-full border border-slate-200">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 select-none">
            {buttonCount} buttons
          </span>
          {Array.from({ length: buttonCount }).map((_, i) => {
            const active = i === activeButtonIndex;
            const label = i === 0 ? "Primary" : i === 1 ? "Secondary" : `Btn ${i + 1}`;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectButtonIndex(i)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer ${
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

      {/* 1. Button Color */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60" title="Button color">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Button color</span>
        <div className="relative w-[22px] h-[22px] rounded-[6px] border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0">
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

      {/* 2. Button Radius (0px to 40px with Auto toggle) */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60" title="Button radius">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Button radius</span>
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
          className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold transition border cursor-pointer ${
            isAutoRadius
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          Auto
        </button>
      </div>

      {/* 3. Box Sizing (Button Size: Small | Medium | Large) */}
      <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60" title="Box sizing">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Box sizing</span>
        <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
          {BUTTON_SIZES.map((size) => {
            const active = (sizeValue || "").replace(/\s+/g, " ") === size.value;
            return (
              <button
                key={size.label}
                type="button"
                onClick={() => onCommitSize?.(size.value)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                  active
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {size.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Button Text Color */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60" title="Button text colour">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Button text colour</span>
        <div className="relative w-[22px] h-[22px] rounded-[6px] border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0">
          <input
            type="color"
            value={textHex}
            onChange={(e) => onDraftTextColor(e.target.value)}
            onBlur={(e) => onCommitTextColor(e.target.value)}
            className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full flex items-center justify-center font-black text-[10px] rounded-[5px]"
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
  );
}

// Backward-compatible exports if referenced elsewhere
export { SingleRowButtonPanel as ButtonShapeControl };
export { SingleRowButtonPanel as ButtonShadowSegmentedControl };
