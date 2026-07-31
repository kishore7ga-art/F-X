"use client";

import { useState } from "react";
import { Check, Sparkles, Palette, Type, RefreshCw, X, Search, Sliders } from "lucide-react";
import type { PaletteColors, FontPack } from "@/lib/theme/theme";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export const PALETTE_PRESETS: {
  id: string;
  name: string;
  category: string;
  colors: PaletteColors;
}[] = [
  {
    id: "academic-blue",
    name: "Academic Blue",
    category: "Classic",
    colors: {
      primary: "#1E3A8A",
      secondary: "#3B82F6",
      accent: "#F59E0B",
      dark: "#0F172A",
      light: "#F8FAFC",
    },
  },
  {
    id: "midnight-indigo",
    name: "Midnight Indigo",
    category: "Modern SaaS",
    colors: {
      primary: "#312E81",
      secondary: "#6366F1",
      accent: "#10B981",
      dark: "#0F172A",
      light: "#F8FAFC",
    },
  },
  {
    id: "campus-emerald",
    name: "Campus Emerald",
    category: "Nature",
    colors: {
      primary: "#065F46",
      secondary: "#10B981",
      accent: "#FBBF24",
      dark: "#022C22",
      light: "#F0FDF4",
    },
  },
  {
    id: "heritage-maroon",
    name: "Heritage Maroon",
    category: "Prestige",
    colors: {
      primary: "#7F1D1D",
      secondary: "#DC2626",
      accent: "#D4A017",
      dark: "#1C1917",
      light: "#FEF7ED",
    },
  },
  {
    id: "cyber-violet",
    name: "Cyber Violet",
    category: "Vibrant",
    colors: {
      primary: "#581C87",
      secondary: "#A855F7",
      accent: "#EC4899",
      dark: "#19072B",
      light: "#FAF5FF",
    },
  },
];

export const FONT_PRESETS: {
  id: string;
  name: string;
  category: string;
  fonts: FontPack;
  sampleHeading: string;
  sampleBody: string;
}[] = [
  {
    id: "inter-roboto",
    name: "Modern Academic",
    category: "Sans-Serif",
    fonts: {
      headingFont: "Inter",
      bodyFont: "Roboto",
    },
    sampleHeading: "Excellence in Research & Higher Learning",
    sampleBody: "Fostering global innovators with multidisciplinary engineering & humanities curricula.",
  },
  {
    id: "playfair-lato",
    name: "Heritage Scholar",
    category: "Editorial Serif",
    fonts: {
      headingFont: "Playfair Display",
      bodyFont: "Lato",
    },
    sampleHeading: "A Century of Academic Leadership",
    sampleBody: "Inspiring future generations through rigorous research, ethics, and community leadership.",
  },
  {
    id: "merriweather-opensans",
    name: "Prestige University",
    category: "Classic Serif",
    fonts: {
      headingFont: "Merriweather",
      bodyFont: "Open Sans",
    },
    sampleHeading: "World-Class Faculty & Campus Life",
    sampleBody: "Join our vibrant academic community with state-of-the-art laboratories and global partnerships.",
  },
  {
    id: "outfit-inter",
    name: "Tech Innovation",
    category: "Modern Display",
    fonts: {
      headingFont: "Outfit",
      bodyFont: "Inter",
    },
    sampleHeading: "Empowering Next-Gen Technologists",
    sampleBody: "Cutting-edge AI research, incubator centers, and hands-on industry apprenticeships.",
  },
];

export function DesignThemePanel({
  activePalette,
  activeFonts,
  onSelectPalette,
  onSelectFonts,
  onClose,
  embed = false,
  initialTab = "colors",
}: {
  activePalette: PaletteColors;
  activeFonts: FontPack;
  onSelectPalette: (palette: PaletteColors) => void;
  onSelectFonts: (fonts: FontPack) => void;
  onClose: () => void;
  embed?: boolean;
  initialTab?: "colors" | "fonts";
}) {
  const [activeTab, setActiveTab] = useState<"colors" | "fonts">(initialTab);
  const [colorSearchQuery, setColorSearchQuery] = useState("");

  const filteredPalettes = PALETTE_PRESETS.filter((preset) => {
    if (!colorSearchQuery.trim()) return true;
    const query = colorSearchQuery.toLowerCase().trim();
    const nameMatch = preset.name.toLowerCase().includes(query);
    const categoryMatch = preset.category.toLowerCase().includes(query);
    const colorHexMatch = Object.values(preset.colors).some((hex) =>
      hex.toLowerCase().includes(query)
    );
    return nameMatch || categoryMatch || colorHexMatch;
  });

  const content = (
    <div className="flex flex-col gap-4 overflow-hidden h-full">
      {/* Header bar */}
      {!embed && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white font-bold">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">Theme &amp; Styling</h2>
              <p className="text-[10px] text-slate-400 font-mono">Live appearance editor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition"
            title="Close Panel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Segmented Control Tabs */}
      {!embed && (
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("colors")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition",
              activeTab === "colors"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-900"
            )}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Color Palettes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fonts")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition",
              activeTab === "fonts"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-900"
            )}
          >
            <Type className="h-3.5 w-3.5" />
            <span>Typography</span>
          </button>
        </div>
      )}

      {/* Tab 1: Color Palettes List */}
      {activeTab === "colors" && (
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 pt-1">
          {/* Color Search Input Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search color name or hex (e.g., Emerald, #1E3A8A)..."
              value={colorSearchQuery}
              onChange={(e) => setColorSearchQuery(e.target.value)}
              className="h-[40px] w-full rounded-2xl border border-slate-200 bg-slate-100/80 pl-9 pr-8 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white shadow-2xs"
            />
            {colorSearchQuery && (
              <button
                type="button"
                onClick={() => setColorSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Curated Color Schemes ({filteredPalettes.length})
            </span>
          </div>

          {filteredPalettes.length > 0 ? (
            filteredPalettes.map((preset) => {
              const isSelected =
                activePalette.primary === preset.colors.primary &&
                activePalette.secondary === preset.colors.secondary;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPalette(preset.colors)}
                  className={cn(
                    "group w-full rounded-2xl border p-3.5 text-left transition-all duration-200 relative overflow-hidden",
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                      : "bg-slate-50/90 border-slate-200/70 hover:border-slate-300 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={cn(
                        "text-xs font-bold transition-colors tracking-tight",
                        isSelected ? "text-white" : "text-slate-900"
                      )}
                    >
                      {preset.name}
                    </span>
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-500 uppercase tracking-wider">
                        {preset.category}
                      </span>
                    )}
                  </div>

                  {/* 5-Color Swatch Preview Bar */}
                  <div className="flex h-7 w-full overflow-hidden rounded-xl border border-slate-300/60 shadow-2xs">
                    <div
                      className="flex-1 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: preset.colors.primary }}
                      title={`Primary: ${preset.colors.primary}`}
                    />
                    <div
                      className="flex-1 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: preset.colors.secondary }}
                      title={`Secondary: ${preset.colors.secondary}`}
                    />
                    <div
                      className="flex-1 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: preset.colors.accent }}
                      title={`Accent: ${preset.colors.accent}`}
                    />
                    <div
                      className="flex-1 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: preset.colors.dark }}
                      title={`Dark: ${preset.colors.dark}`}
                    />
                    <div
                      className="flex-1 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: preset.colors.light }}
                      title={`Light: ${preset.colors.light}`}
                    />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs font-medium text-slate-400">
              No color schemes found for &quot;{colorSearchQuery}&quot;
            </div>
          )}

          {/* Custom Color Palette Tuner / Picker (At Bottom) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 mt-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-slate-700" />
                Custom Color Picker
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Live Studio
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: "Primary", key: "primary" },
                { label: "Secondary", key: "secondary" },
                { label: "Accent", key: "accent" },
                { label: "Dark", key: "dark" },
                { label: "Light", key: "light" },
              ].map((item) => {
                const colorVal = activePalette[item.key as keyof PaletteColors];
                return (
                  <div key={item.key} className="flex flex-col items-center gap-1">
                    <div className="relative flex h-9 w-full items-center justify-center rounded-xl border border-slate-300/80 shadow-2xs overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                      <input
                        type="color"
                        value={colorVal}
                        onChange={(e) =>
                          onSelectPalette({
                            ...activePalette,
                            [item.key]: e.target.value,
                          })
                        }
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        title={`Pick ${item.label} Color (${colorVal})`}
                      />
                      <div
                        className="h-full w-full"
                        style={{ backgroundColor: colorVal }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 truncate max-w-full">
                      {item.label}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">
                      {colorVal.slice(0, 7)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Font Packs List */}
      {activeTab === "fonts" && (
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Curated Font Pairings ({FONT_PRESETS.length})
            </span>
          </div>

          {FONT_PRESETS.map((preset) => {
            const isSelected =
              activeFonts.headingFont === preset.fonts.headingFont &&
              activeFonts.bodyFont === preset.fonts.bodyFont;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectFonts(preset.fonts)}
                className={cn(
                  "group w-full rounded-2xl border p-3.5 text-left transition-all duration-200 relative overflow-hidden",
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                    : "bg-slate-50/90 border-slate-200/70 hover:border-slate-300 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={cn(
                      "text-xs font-bold tracking-tight",
                      isSelected ? "text-white" : "text-slate-900"
                    )}
                  >
                    {preset.name}
                  </span>
                  {isSelected ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-500 uppercase tracking-wider">
                      {preset.category}
                    </span>
                  )}
                </div>

                <p
                  className={cn(
                    "text-[10px] font-mono mb-2.5",
                    isSelected ? "text-slate-300" : "text-slate-400"
                  )}
                >
                  {preset.fonts.headingFont} + {preset.fonts.bodyFont}
                </p>

                {/* Typography Live Preview Card */}
                <div
                  className={cn(
                    "rounded-xl p-3 border space-y-1 transition-colors",
                    isSelected
                      ? "bg-slate-800/80 border-slate-700 text-white"
                      : "bg-white border-slate-200/90 text-slate-900"
                  )}
                >
                  <p
                    className="text-xs font-extrabold leading-tight truncate"
                    style={{ fontFamily: `'${preset.fonts.headingFont}', Georgia, serif` }}
                  >
                    {preset.sampleHeading}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] leading-snug line-clamp-2",
                      isSelected ? "text-slate-300" : "text-slate-500"
                    )}
                    style={{ fontFamily: `'${preset.fonts.bodyFont}', sans-serif` }}
                  >
                    {preset.sampleBody}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (embed) {
    return content;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="absolute left-0 top-0 bottom-0 z-40 flex w-[280px] flex-col justify-between bg-white p-4 shadow-2xl border-r border-slate-200/90 overflow-hidden select-none"
    >
      {content}
    </motion.aside>
  );
}
