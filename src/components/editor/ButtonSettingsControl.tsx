"use client";

import React, { useEffect, useState } from "react";
import { hexFromValue } from "@/lib/sections/section-edit";
import { ExternalLink, Link2 } from "lucide-react";

export interface SingleRowButtonPanelProps {
  // 1. Button Background Color
  bgValue: string;
  onDraftBg: (value: string) => void;
  onCommitBg: (value: string) => void;
  // 2. Button Box Shape / Corner Radius
  radiusValue: string;
  onCommitRadius: (value: string) => void;
  // 3. Button Text Color
  textColorValue?: string;
  onDraftTextColor?: (value: string) => void;
  onCommitTextColor?: (value: string) => void;
  // 4. Button Navigation
  urlValue?: string;
  onCommitUrl?: (url: string) => void;
  isNewTab?: boolean;
  onToggleNewTab?: (newTab: boolean) => void;
  // Optional backward-compatibility props
  buttonCount?: number;
  activeButtonIndex?: number;
  onSelectButtonIndex?: (index: number) => void;
  sizeValue?: string;
  onCommitSize?: (value: string) => void;
  borderValue?: string;
  onCommitBorder?: (value: string) => void;
  shadowValue?: string;
  onCommitShadow?: (value: string) => void;
}

export function SingleRowButtonPanel({
  bgValue,
  onDraftBg,
  onCommitBg,
  radiusValue,
  onCommitRadius,
  textColorValue,
  onDraftTextColor,
  onCommitTextColor,
  urlValue,
  onCommitUrl,
  isNewTab,
  onToggleNewTab,
}: SingleRowButtonPanelProps) {
  // Parse numeric corner radius (0px to 40px)
  const safeRadius = String(radiusValue ?? "").trim();
  const isAutoRadius = !safeRadius || safeRadius === "auto";
  const numericRadius = isAutoRadius ? 8 : Math.min(40, Math.max(0, parseInt(safeRadius.replace(/[^\d]/g, ""), 10) || 0));

  const bgHex = hexFromValue(String(bgValue ?? ""), "#2563eb");
  const textHex = hexFromValue(String(textColorValue ?? ""), "#ffffff");

  const [tempUrl, setTempUrl] = useState(urlValue ?? "");
  useEffect(() => {
    setTempUrl(urlValue ?? "");
  }, [urlValue]);

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-1 px-1 flex-nowrap w-full">
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
        <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">{bgHex}</span>
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

      {/* 3. Button Text Color */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60" title="Button text colour">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Text colour</span>
        <div className="relative w-[22px] h-[22px] rounded-[6px] border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0">
          <input
            type="color"
            value={textHex}
            onChange={(e) => onDraftTextColor?.(e.target.value)}
            onBlur={(e) => onCommitTextColor?.(e.target.value)}
            className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
          />
          <div className="w-full h-full" style={{ backgroundColor: textColorValue || "#ffffff" }} />
        </div>
        <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">{textHex}</span>
      </div>

      {/* 4. Button Navigation */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60" title="Button navigation">
        <div className="flex items-center gap-1 text-slate-500 shrink-0">
          <Link2 className="w-3.5 h-3.5" />
          <span className="text-[10.5px] font-bold whitespace-nowrap">Navigation</span>
        </div>
        <input
          type="text"
          value={tempUrl}
          onChange={(e) => setTempUrl(e.target.value)}
          onBlur={() => onCommitUrl?.(tempUrl)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onCommitUrl?.(tempUrl);
              e.currentTarget.blur();
            }
          }}
          placeholder="https://… or /page or #section"
          className="h-6 w-36 sm:w-44 px-2 text-[11px] font-mono bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-slate-800 placeholder:text-slate-400"
        />
        <label
          className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer select-none shrink-0"
          title="Open in new tab"
        >
          <input
            type="checkbox"
            checked={Boolean(isNewTab)}
            onChange={(e) => onToggleNewTab?.(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 accent-slate-900 cursor-pointer"
          />
          <ExternalLink className="w-3 h-3 text-slate-400" />
          <span className="hidden sm:inline">New tab</span>
        </label>
      </div>
    </div>
  );
}

// Backward-compatible exports if referenced elsewhere
export { SingleRowButtonPanel as ButtonShapeControl };
export { SingleRowButtonPanel as ButtonShadowSegmentedControl };
