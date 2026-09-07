"use client";

import React, { useState, useEffect, useId } from "react";
import {
  Bold,
  Italic,
  Underline,
  RotateCcw,
  Sparkles,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { hexFromValue } from "@/lib/sections/section-edit";

export interface SingleRowTextColorPanelProps {
  currentColor: string;
  onSelectColor: (hex: string) => void;
  onFormat?: (command: "bold" | "italic" | "underline" | "removeFormat") => void;
  isEditingText?: boolean;
  currentFont?: string;
  onSelectFont?: (font: string) => void;
  currentFontSize?: string;
  onSelectFontSize?: (size: string) => void;
  currentAlign?: string;
  onSelectAlign?: (align: "left" | "center" | "right" | "justify") => void;
}

const TEXT_PALETTES = [
  { name: "White", hex: "#ffffff" },
  { name: "Charcoal Black", hex: "#18181b" },
  { name: "Slate Gray", hex: "#64748b" },
  { name: "Coral Red", hex: "#ef4444" },
  { name: "Rose Pink", hex: "#ec4899" },
  { name: "Vibrant Orange", hex: "#f97316" },
  { name: "Warm Amber", hex: "#eab308" },
  { name: "Emerald Green", hex: "#10b981" },
  { name: "Sky Cyan", hex: "#06b6d4" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Electric Violet", hex: "#8b5cf6" },
  { name: "Gold", hex: "#f59e0b" },
];

export const FONT_FAMILY_OPTIONS = [
  { label: "Default Font", value: "" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Outfit", value: "'Outfit', sans-serif" },
  { label: "Plus Jakarta", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Playfair", value: "'Playfair Display', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Monospace", value: "ui-monospace, monospace" },
];

export const FONT_SIZE_OPTIONS = [
  { label: "Auto Size", value: "" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
  { label: "40px", value: "40px" },
  { label: "48px", value: "48px" },
  { label: "56px", value: "56px" },
  { label: "64px", value: "64px" },
  { label: "72px", value: "72px" },
];

export function SingleRowTextColorPanel({
  currentColor,
  onSelectColor,
  onFormat,
  isEditingText = false,
  currentFont = "",
  onSelectFont,
  currentFontSize = "",
  onSelectFontSize,
  currentAlign = "left",
  onSelectAlign,
}: SingleRowTextColorPanelProps) {
  const [hexDraft, setHexDraft] = useState<string>(currentColor || "#ffffff");
  const colorPickerId = useId();

  useEffect(() => {
    if (currentColor) {
      setHexDraft(currentColor);
    }
  }, [currentColor]);

  const activeHex = hexFromValue(hexDraft, "#ffffff").toLowerCase();

  const handleApply = (color: string) => {
    setHexDraft(color);
    onSelectColor(color);
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1 px-1 flex-nowrap w-full no-scrollbar">
      {/* 1. Quick Palette Swatches */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
          Palettes
        </span>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
          {TEXT_PALETTES.map((p) => {
            const isWhite = p.hex.toLowerCase() === "#ffffff";
            const isSelected = activeHex === p.hex.toLowerCase();
            return (
              <button
                key={p.hex}
                type="button"
                title={p.name}
                onMouseDown={(e) => {
                  // Crucial: prevent loss of focus / selection in contenteditable
                  e.preventDefault();
                }}
                onClick={() => handleApply(p.hex)}
                className={`w-4 h-4 rounded-[4px] transition-all cursor-pointer ${
                  isWhite ? "border border-slate-300" : "border border-black/10"
                } ${
                  isSelected
                    ? "ring-2 ring-slate-900 ring-offset-1 scale-110 shadow-sm"
                    : "hover:scale-105 opacity-90 hover:opacity-100"
                }`}
                style={{ backgroundColor: p.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* 2. Current Color Picker + Hex Input */}
      <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
        <span className="text-[10.5px] font-bold text-slate-500">The colour</span>
        <label
          htmlFor={colorPickerId}
          className="relative w-[22px] h-[22px] rounded-[6px] border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0 block"
        >
          <input
            id={colorPickerId}
            type="color"
            value={activeHex}
            onChange={(e) => handleApply(e.target.value)}
            className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
          />
          <div className="w-full h-full" style={{ backgroundColor: hexDraft || "#ffffff" }} />
        </label>
        <input
          type="text"
          value={hexDraft}
          onChange={(e) => {
            const val = e.target.value;
            setHexDraft(val);
            if (/^#[0-9a-f]{3,8}$/i.test(val)) {
              onSelectColor(val);
            }
          }}
          onBlur={() => {
            if (/^#[0-9a-f]{3,8}$/i.test(hexDraft)) {
              onSelectColor(hexDraft);
            }
          }}
          className="w-16 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
          placeholder="#ffffff"
        />
      </div>

      {/* 3. Inline Text Formatting (Bold, Italic, Underline, Clear) */}
      {onFormat && (
        <div className="flex items-center gap-1 shrink-0 bg-slate-50/80 px-2 py-1 rounded-xl border border-slate-200/60">
          <button
            type="button"
            title="Bold"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFormat("bold")}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Italic"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFormat("italic")}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Underline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFormat("underline")}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
          <button
            type="button"
            title="Reset formatting"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFormat("removeFormat")}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* 4. Font Family Selector */}
      {onSelectFont && (
        <div className="flex items-center gap-1 shrink-0 bg-slate-50/80 px-2 py-1 rounded-xl border border-slate-200/60">
          <Type className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={currentFont}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => onSelectFont(e.target.value)}
            className="text-[11px] font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-1 py-0.5"
            title="Font family"
          >
            {FONT_FAMILY_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 5. Font Size Selector */}
      {onSelectFontSize && (
        <div className="flex items-center gap-1 shrink-0 bg-slate-50/80 px-2 py-1 rounded-xl border border-slate-200/60">
          <span className="text-[10.5px] font-bold text-slate-400">Size</span>
          <select
            value={currentFontSize}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => onSelectFontSize(e.target.value)}
            className="text-[11px] font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-1 py-0.5"
            title="Font size"
          >
            {FONT_SIZE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 6. Text Alignment Controls */}
      {onSelectAlign && (
        <div className="flex items-center gap-0.5 shrink-0 bg-slate-50/80 px-1.5 py-1 rounded-xl border border-slate-200/60">
          <button
            type="button"
            title="Align Left"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelectAlign("left")}
            className={`p-1 rounded transition cursor-pointer ${
              currentAlign === "left"
                ? "bg-slate-200/90 text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Align Center"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelectAlign("center")}
            className={`p-1 rounded transition cursor-pointer ${
              currentAlign === "center"
                ? "bg-slate-200/90 text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Align Right"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelectAlign("right")}
            className={`p-1 rounded transition cursor-pointer ${
              currentAlign === "right"
                ? "bg-slate-200/90 text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Context Guidance Badge */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto hidden sm:flex text-[10px] font-semibold text-slate-400">
        <Sparkles className="w-3 h-3 text-cyan-500" />
        <span>
          {isEditingText
            ? "Highlight text or type anywhere in this color"
            : "Click any text on the page to edit and type in this color"}
        </span>
      </div>
    </div>
  );
}