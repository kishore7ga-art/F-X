"use client";

import React, { useRef, useState } from "react";
import { hexFromValue } from "@/lib/sections/section-edit";
import { Image as ImageIcon, Palette, Upload, X } from "lucide-react";

export interface SingleRowBackgroundPanelProps {
  // Color
  colorValue: string;
  onDraftColor: (value: string) => void;
  onCommitColor: (value: string) => void;
  // Designs / Gradient
  designValue: string;
  onCommitDesign: (value: string) => void;
  // Image
  imageValue: string;
  onDraftImage: (value: string) => void;
  onCommitImage: (value: string) => void;
  // Image Shadow
  shadowValue: string;
  onCommitShadow: (value: string) => void;
  // Image Density
  densityValue: string;
  onCommitDensity: (value: string) => void;
  // Image Blur
  blurValue: string;
  onCommitBlur: (value: string) => void;
}

// Curated popular modern color palettes for one-click styling
const COLOR_PALETTES = [
  { name: "White", hex: "#ffffff" },
  { name: "Light Gray", hex: "#f8fafc" },
  { name: "Dark Slate", hex: "#0f172a" },
  { name: "Navy", hex: "#1e293b" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Emerald", hex: "#059669" },
  { name: "Sunset Amber", hex: "#d97706" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Violet", hex: "#7c3aed" },
];

// Designs / Background Gradients & Patterns
export const BACKGROUND_DESIGNS = [
  { label: "Solid (No design)", value: "" },
  {
    label: "Fade to Dark",
    value: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)",
  },
  {
    label: "Fade to Light",
    value: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 100%)",
  },
  {
    label: "Blue to Violet",
    value: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
  },
  {
    label: "Slate Depth",
    value: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
  },
  {
    label: "Amber to Red",
    value: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  },
  {
    label: "Radial Spotlight",
    value: "radial-gradient(circle at 50% 25%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.4) 100%)",
  },
  {
    label: "Soft Glow",
    value: "radial-gradient(ellipse at top, rgba(99,102,241,0.25) 0%, rgba(0,0,0,0) 70%)",
  },
  {
    label: "Dark Vignette",
    value: "radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 100%)",
  },
];

// Image Shadow presets
const IMAGE_SHADOW_PRESETS = [
  { label: "None", value: "" },
  { label: "Soft", value: "0 8px 24px -4px rgba(0, 0, 0, 0.18)" },
  { label: "Medium", value: "0 16px 40px -6px rgba(0, 0, 0, 0.32)" },
  { label: "Deep", value: "0 24px 60px -8px rgba(0, 0, 0, 0.55)" },
];

// Image Density (background-size) presets
const DENSITY_PRESETS = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Auto", value: "auto" },
  { label: "100%", value: "100% 100%" },
];

// Image Blur presets
const BLUR_PRESETS = [
  { label: "0px", value: "" },
  { label: "4px", value: "4px" },
  { label: "8px", value: "8px" },
  { label: "16px", value: "16px" },
];

export function SingleRowBackgroundPanel({
  colorValue,
  onDraftColor,
  onCommitColor,
  designValue,
  onCommitDesign,
  imageValue,
  onDraftImage,
  onCommitImage,
  shadowValue,
  onCommitShadow,
  densityValue,
  onCommitDensity,
  blurValue,
  onCommitBlur,
}: SingleRowBackgroundPanelProps) {
  // Mode selection: "color" or "image"
  const [mode, setMode] = useState<"color" | "image">(() => (imageValue ? "image" : "color"));
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const safeColor = String(colorValue || "");
  const colorHex = hexFromValue(safeColor, "#ffffff");
  const safeImage = String(imageValue || "").trim();
  const safeShadow = String(shadowValue || "");
  const safeDensity = String(densityValue || "cover");
  const safeBlur = String(blurValue || "");

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onCommitImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value so re-picking the same file triggers onChange
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto py-1 px-1 flex-nowrap w-full">
      {/* ── 1. The 2 Choices: Mode Switcher (Colour | Image) ── */}
      <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setMode("color")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
            mode === "color"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Background colour</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("image")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
            mode === "image"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image</span>
        </button>
      </div>

      {/* ── 2. Background Colour Mode Controls ── */}
      {mode === "color" && (
        <>
          {/* A. Colour Palettes */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Palettes</span>
            <div className="flex items-center gap-1">
              {COLOR_PALETTES.map((pal) => {
                const isActive = safeColor.toLowerCase() === pal.hex.toLowerCase();
                return (
                  <button
                    key={pal.hex}
                    type="button"
                    title={pal.name}
                    onClick={() => {
                      onCommitColor(pal.hex);
                    }}
                    style={{ backgroundColor: pal.hex }}
                    className={`w-5 h-5 rounded-full border transition-all shrink-0 ${
                      isActive
                        ? "border-slate-900 ring-2 ring-slate-900 ring-offset-1 scale-110"
                        : "border-slate-300 hover:scale-105"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* B. The Colour (Picker & Hex Input) */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Colour</span>
            <div className="relative w-6 h-6 rounded-full border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => onDraftColor(e.target.value)}
                onBlur={(e) => onCommitColor(e.target.value)}
                className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
              />
              <div className="w-full h-full" style={{ backgroundColor: safeColor || "#ffffff" }} />
            </div>
            <input
              type="text"
              value={safeColor}
              onChange={(e) => onDraftColor(e.target.value)}
              onBlur={(e) => onCommitColor(e.target.value)}
              placeholder="#ffffff"
              className="w-20 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* C. The Designs (Patterns & Gradients) */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Designs</span>
            <select
              value={designValue || ""}
              onChange={(e) => onCommitDesign(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {BACKGROUND_DESIGNS.map((d) => (
                <option key={d.label} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* ── 3. Image Mode Controls ── */}
      {mode === "image" && (
        <>
          {/* A. File and URL */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            {/* Image Thumbnail Preview */}
            <div className="w-6 h-6 rounded-md border border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
              {safeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={safeImage} alt="Background preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>

            {/* Choose File Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10.5px] font-bold text-slate-700 hover:bg-slate-100 transition shrink-0 shadow-2xs"
            >
              <Upload className="w-3 h-3" />
              <span>Choose File</span>
            </button>

            {/* URL Input */}
            <input
              type="text"
              value={safeImage}
              onChange={(e) => onDraftImage(e.target.value)}
              onBlur={(e) => onCommitImage(e.target.value)}
              placeholder="https://... or choose file"
              className="w-48 sm:w-56 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />

            {/* Clear Image Button */}
            {safeImage && (
              <button
                type="button"
                onClick={() => onCommitImage("")}
                title="Remove image"
                className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* B. Image Shadow */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Image shadow</span>
            <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
              {IMAGE_SHADOW_PRESETS.map((preset) => {
                const active =
                  (preset.label === "None" && (!safeShadow || safeShadow === "none")) ||
                  (preset.label === "Soft" && safeShadow.includes("24px")) ||
                  (preset.label === "Medium" && safeShadow.includes("40px")) ||
                  (preset.label === "Deep" && safeShadow.includes("60px"));
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

          {/* C. Image Density */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Image density</span>
            <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
              {DENSITY_PRESETS.map((preset) => {
                const active =
                  safeDensity === preset.value ||
                  (preset.value === "cover" && !safeDensity);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onCommitDensity(preset.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
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

          {/* D. Image Blurriness */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Image blur</span>
            <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
              {BLUR_PRESETS.map((preset) => {
                const active =
                  (preset.label === "0px" && (!safeBlur || safeBlur === "0px")) ||
                  safeBlur === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onCommitBlur(preset.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
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
        </>
      )}
    </div>
  );
}
