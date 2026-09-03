"use client";

import React, { useState, useRef } from "react";
import {
  Palette,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  X,
  Sparkles,
} from "lucide-react";
import { hexFromValue } from "@/lib/sections/section-edit";
import { uploadImage } from "@/lib/api-client";

export interface SingleRowBackgroundPanelProps {
  // Background Color
  colorValue: string;
  onDraftColor: (value: string) => void;
  onCommitColor: (value: string) => void;

  // Background Designs / Gradient
  designValue: string;
  onCommitDesign: (value: string) => void;

  // Background Image
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

  // Background Video
  videoValue?: string;
  onDraftVideo?: (value: string) => void;
  onCommitVideo?: (value: string) => void;
}

const QUICK_PALETTES = [
  { name: "White", hex: "#ffffff" },
  { name: "Dark Slate", hex: "#0f172a" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Emerald", hex: "#059669" },
  { name: "Sunset Amber", hex: "#d97706" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Violet", hex: "#7c3aed" },
];

const BACKGROUND_DESIGNS = [
  { label: "Solid / Clean", value: "" },
  { label: "Fade to Dark", value: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)" },
  { label: "Fade to Light", value: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 100%)" },
  { label: "Blue to Violet", value: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" },
  { label: "Dark Vignette", value: "radial-gradient(circle at center, rgba(15,23,42,0.4) 0%, #0f172a 100%)" },
  { label: "Soft Glow", value: "radial-gradient(ellipse at top, rgba(59,130,246,0.2) 0%, transparent 70%)" },
  { label: "Midnight Slate", value: "linear-gradient(135deg, #0f172a 0%, #334155 100%)" },
];

const IMAGE_SHADOW_PRESETS = [
  { label: "None", value: "" },
  { label: "Soft", value: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" },
  { label: "Medium", value: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)" },
  { label: "Deep", value: "0 25px 50px -12px rgba(0, 0, 0, 0.35)" },
];

const DENSITY_PRESETS = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Auto", value: "auto" },
  { label: "100%", value: "100% 100%" },
];

const BLUR_PRESETS = [
  { label: "0px", value: "" },
  { label: "4px", value: "4px" },
  { label: "8px", value: "8px" },
  { label: "16px", value: "16px" },
];

/** Resizes image client-side to max 1400px so uploaded image updates immediately with zero lag and no 413 error. */
function compressImage(file: File, maxDim = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(reader.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

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
  videoValue,
  onDraftVideo,
  onCommitVideo,
}: SingleRowBackgroundPanelProps) {
  const safeImage = String(imageValue || "").trim();
  const safeVideo = String(videoValue || "").trim();

  // Mode: "color" | "image" | "video"
  const [mode, setMode] = useState<"color" | "image" | "video">(() => {
    if (safeVideo) return "video";
    if (safeImage) return "image";
    return "color";
  });

  const [isUploading, setIsUploading] = useState(false);
  const colorHex = hexFromValue(colorValue || "#ffffff", "#ffffff");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // 1. Immediately compress and commit so canvas updates live in <50ms!
      const compressedDataUrl = await compressImage(file, 1400);
      onDraftImage(compressedDataUrl);
      onCommitImage(compressedDataUrl);

      // 2. Upload to server asynchronously for permanent URL
      uploadImage(file)
        .then(({ url }) => {
          if (url) {
            onDraftImage(url);
            onCommitImage(url);
          }
        })
        .catch(() => {});
    } catch {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const res = evt.target?.result as string;
        if (res) {
          onDraftImage(res);
          onCommitImage(res);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url } = await uploadImage(file);
      if (url) {
        onDraftVideo?.(url);
        onCommitVideo?.(url);
      }
    } catch {
      const localUrl = URL.createObjectURL(file);
      onDraftVideo?.(localUrl);
      onCommitVideo?.(localUrl);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1 px-1 flex-nowrap w-full">
      {/* ── 1. The 3 Choices: Colour vs Image vs Video ──────────────── */}
      <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => {
            setMode("color");
            if (safeVideo) onCommitVideo?.("");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            mode === "color"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Background colour</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("image");
            if (safeVideo) onCommitVideo?.("");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            mode === "image"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("video");
            if (safeImage) onCommitImage("");
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            mode === "video"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <VideoIcon className="w-3.5 h-3.5" />
          <span>Video</span>
        </button>
      </div>

      {/* ── 2. Background Colour Mode ────────────────────────────────────────── */}
      {mode === "color" && (
        <>
          {/* Quick Palettes */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
              Palettes
            </span>
            <div className="flex items-center gap-1">
              {QUICK_PALETTES.map((p) => {
                const isSelected = colorHex.toLowerCase() === p.hex.toLowerCase();
                return (
                  <button
                    key={p.hex}
                    type="button"
                    title={p.name}
                    onClick={() => {
                      onDraftColor(p.hex);
                      onCommitColor(p.hex);
                    }}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      isSelected
                        ? "scale-110 ring-2 ring-slate-900 border-white shadow-xs"
                        : "border-slate-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: p.hex }}
                  />
                );
              })}
            </div>
          </div>

          {/* Native Colour Picker + Hex Input */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500">The colour</span>
            <div className="relative w-6 h-6 rounded-full border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => {
                  onDraftColor(e.target.value);
                  onCommitColor(e.target.value);
                }}
                className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
              />
              <div className="w-full h-full" style={{ backgroundColor: colorValue || "#ffffff" }} />
            </div>
            <input
              type="text"
              value={colorValue || "#ffffff"}
              onChange={(e) => {
                onDraftColor(e.target.value);
                onCommitColor(e.target.value);
              }}
              className="w-16 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Designs / Gradients Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10.5px] font-bold text-slate-500">Designs</span>
            <select
              value={designValue || ""}
              onChange={(e) => onCommitDesign(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
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

      {/* ── 3. Image Mode ────────────────────────────────────────────────────── */}
      {mode === "image" && (
        <>
          {/* File Upload & URL Input */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            {/* Thumbnail Preview */}
            {safeImage ? (
              <div className="relative w-6 h-6 rounded-md overflow-hidden border border-slate-300 shrink-0 bg-slate-100">
                <img src={safeImage} alt="bg" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-md border border-dashed border-slate-300 flex items-center justify-center shrink-0 text-slate-400">
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Choose File Button */}
            <label className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs transition shrink-0">
              <Upload className="w-3 h-3 text-slate-500" />
              <span>{isUploading ? "Uploading…" : "Choose File"}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>

            {/* URL Input: commits immediately on change or paste */}
            <input
              type="text"
              value={safeImage}
              onChange={(e) => {
                const val = e.target.value;
                onDraftImage(val);
                onCommitImage(val);
              }}
              placeholder="https://... or choose file"
              className="w-48 sm:w-56 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />

            {/* Clear Image Button */}
            {safeImage && (
              <button
                type="button"
                onClick={() => {
                  onDraftImage("");
                  onCommitImage("");
                }}
                title="Remove image"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Image Shadow */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Image shadow</span>
            <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
              {IMAGE_SHADOW_PRESETS.map((p) => {
                const active = (shadowValue || "") === p.value;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onCommitShadow(p.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      active
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Density */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Image density</span>
            <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
              {DENSITY_PRESETS.map((d) => {
                const active = (densityValue || "cover") === d.value;
                return (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => onCommitDensity(d.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      active
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Blur */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">Image blur</span>
            <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
              {BLUR_PRESETS.map((b) => {
                const active = (blurValue || "") === b.value;
                return (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => onCommitBlur(b.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      active
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── 4. Video Mode ────────────────────────────────────────────────────── */}
      {mode === "video" && (
        <>
          <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <div className="w-6 h-6 rounded-md border border-slate-300 flex items-center justify-center shrink-0 bg-slate-900 text-white">
              <VideoIcon className="w-3.5 h-3.5" />
            </div>

            {/* Choose Video File Button */}
            <label className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs transition shrink-0">
              <Upload className="w-3 h-3 text-slate-500" />
              <span>{isUploading ? "Uploading…" : "Choose Video"}</span>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />
            </label>

            {/* Video URL Input: commits immediately on change or paste */}
            <input
              type="text"
              value={safeVideo}
              onChange={(e) => {
                const val = e.target.value;
                onDraftVideo?.(val);
                onCommitVideo?.(val);
              }}
              placeholder="https://...mp4 or direct video URL"
              className="w-56 sm:w-64 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />

            {/* Clear Video Button */}
            {safeVideo && (
              <button
                type="button"
                onClick={() => {
                  onDraftVideo?.("");
                  onCommitVideo?.("");
                }}
                title="Remove video"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Video Badges / Info */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60 text-[10px] font-bold text-slate-600">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Autoplay & Loop
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              Muted
            </span>
          </div>
        </>
      )}
    </div>
  );
}
