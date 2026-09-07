"use client";

import React from "react";
import { X, MousePointerClick } from "lucide-react";
import { hexFromValue } from "@/lib/sections/section-edit";

export interface ButtonToolbarProps {
  radius: string;
  bgColor: string;
  textColor: string;
  onChangeRadius: (radius: string) => void;
  onChangeBgColor: (color: string) => void;
  onChangeTextColor: (color: string) => void;
  onClose: () => void;
}

const QUICK_COLORS = [
  "#2563eb", // Royal Blue
  "#10b981", // Emerald Green
  "#8b5cf6", // Vibrant Violet
  "#ef4444", // Coral Red
  "#f97316", // Sunset Orange
  "#0f172a", // Obsidian Black
  "#ffffff", // Crisp White
];

const RADIUS_PRESETS = [
  { label: "0px", value: "0px", title: "Sharp" },
  { label: "6px", value: "6px", title: "Subtle" },
  { label: "12px", value: "12px", title: "Rounded" },
  { label: "24px", value: "24px", title: "Smooth" },
  { label: "Pill", value: "9999px", title: "Full Pill" },
];

export function ButtonToolbar({
  radius,
  bgColor,
  textColor,
  onChangeRadius,
  onChangeBgColor,
  onChangeTextColor,
  onClose,
}: ButtonToolbarProps) {
  const bgHex = hexFromValue(bgColor, "#2563eb");
  const textHex = hexFromValue(textColor, "#ffffff");

  // Parse numeric radius for slider display
  const numericRadius = Math.min(
    40,
    Math.max(0, parseInt(radius.replace(/[^\d]/g, ""), 10) || 0)
  );

  return (
    <div
      role="toolbar"
      aria-label="Button editing toolbar"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 sm:gap-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-2xl transition-all max-w-[95vw] overflow-x-auto no-scrollbar"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Title & Badge */}
      <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-200">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
          <MousePointerClick className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black tracking-tight text-slate-800 leading-tight">
            Button Style
          </span>
          <span className="text-[9px] font-bold text-cyan-600 tracking-wider uppercase">
            Right-click Edit
          </span>
        </div>
      </div>

      {/* 1. BUTTON RADIUS */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">
          Radius
        </span>
        <div className="flex items-center gap-1">
          {RADIUS_PRESETS.map((p) => {
            const isSelected =
              radius.toLowerCase() === p.value.toLowerCase() ||
              (p.value === "9999px" && parseInt(radius, 10) > 40);
            return (
              <button
                key={p.value}
                type="button"
                title={p.title}
                onClick={() => onChangeRadius(p.value)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <input
          type="range"
          min={0}
          max={40}
          step={1}
          value={numericRadius}
          onChange={(e) => onChangeRadius(`${e.target.value}px`)}
          className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 ml-1 hidden sm:inline-block"
          title={`Custom radius: ${numericRadius}px`}
        />
        <span className="text-[10px] font-mono font-bold text-slate-700 min-w-[26px] text-right hidden sm:inline-block">
          {radius === "9999px" ? "Pill" : `${numericRadius}px`}
        </span>
      </div>

      {/* 2. BUTTON COLOR */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">
          Button Color
        </span>
        <label
          className="relative w-[24px] h-[24px] rounded-[7px] border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0 block"
          title="Pick button background color"
        >
          <input
            type="color"
            value={bgHex}
            onChange={(e) => onChangeBgColor(e.target.value)}
            className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
          />
          <div className="w-full h-full" style={{ backgroundColor: bgHex }} />
        </label>
        <input
          type="text"
          value={bgHex}
          onChange={(e) => onChangeBgColor(e.target.value)}
          maxLength={7}
          className="w-16 h-6 px-1 text-[10.5px] font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg text-center uppercase outline-none focus:border-slate-400"
        />
        {/* Quick Swatches */}
        <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-slate-200">
          {QUICK_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeBgColor(c)}
              className={`w-3.5 h-3.5 rounded-full border transition hover:scale-110 ${
                bgHex.toLowerCase() === c.toLowerCase()
                  ? "ring-2 ring-slate-900 ring-offset-1"
                  : "border-black/10"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* 3. BUTTON TEXT COLOR */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
        <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">
          Text Color
        </span>
        <label
          className="relative w-[24px] h-[24px] rounded-[7px] border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0 block"
          title="Pick button text color"
        >
          <input
            type="color"
            value={textHex}
            onChange={(e) => onChangeTextColor(e.target.value)}
            className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
          />
          <div className="w-full h-full" style={{ backgroundColor: textHex }} />
        </label>
        <input
          type="text"
          value={textHex}
          onChange={(e) => onChangeTextColor(e.target.value)}
          maxLength={7}
          className="w-16 h-6 px-1 text-[10.5px] font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg text-center uppercase outline-none focus:border-slate-400"
        />
        {/* Quick Swatches */}
        <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-slate-200">
          {QUICK_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeTextColor(c)}
              className={`w-3.5 h-3.5 rounded-full border transition hover:scale-110 ${
                textHex.toLowerCase() === c.toLowerCase()
                  ? "ring-2 ring-slate-900 ring-offset-1"
                  : "border-black/10"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        title="Close button toolbar"
        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ml-auto cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
