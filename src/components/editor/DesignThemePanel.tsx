"use client";

import { useState } from "react";
import { Check, Sparkles, Palette, Type, RefreshCw, X } from "lucide-react";
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
  {
    id: "monochrome-mono",
    name: "Monochrome Dark",
    category: "Minimalist",
    colors: {
      primary: "#18181B",
      secondary: "#52525B",
      accent: "#71717A",
      dark: "#09090B",
      light: "#FFFFFF",
    },
  },
  {
    id: "sunset-gold",
    name: "Sunset Slate",
    category: "Warm",
    colors: {
      primary: "#7C2D12",
      secondary: "#EA580C",
      accent: "#EAB308",
      dark: "#18181B",
      light: "#FFFBEB",
    },
  },
  {
    id: "nordic-cyan",
    name: "Nordic Cyan",
    category: "Fresh",
    colors: {
      primary: "#164E63",
      secondary: "#06B6D4",
      accent: "#F43F5E",
      dark: "#083344",
      light: "#ECFEFF",
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
    id: "modern-saas",
    name: "Modern Sans",
    category: "Clean & Crisp",
    fonts: { headingFont: "Poppins", bodyFont: "Inter" },
    sampleHeading: "Engineering Tomorrow, Today",
    sampleBody: "NAAC A+ Accredited Institute offering world-class technical education.",
  },
  {
    id: "editorial-serif",
    name: "Editorial Serif",
    category: "Classic Prestige",
    fonts: { headingFont: "Playfair Display", bodyFont: "Source Sans 3" },
    sampleHeading: "Excellence in Higher Learning",
    sampleBody: "Fostering leadership, research and academic distinction since 1984.",
  },
  {
    id: "tech-jakarta",
    name: "Tech & Jakarta",
    category: "Futuristic",
    fonts: { headingFont: "Outfit", bodyFont: "Plus Jakarta Sans" },
    sampleHeading: "Innovate, Research & Lead",
    sampleBody: "Cutting-edge artificial intelligence, robotics, and cloud laboratories.",
  },
  {
    id: "prestige-cinzel",
    name: "Prestige Cinzel",
    category: "Heritage",
    fonts: { headingFont: "Cinzel", bodyFont: "EB Garamond" },
    sampleHeading: "Veritas, Honor & Tradition",
    sampleBody: "Empowering generations of global leaders through timeless scholarship.",
  },
  {
    id: "sleek-grotesk",
    name: "Sleek Grotesk",
    category: "Contemporary",
    fonts: { headingFont: "Space Grotesk", bodyFont: "Roboto" },
    sampleHeading: "Next-Gen Campus Network",
    sampleBody: "Integrated smart learning management and global research initiatives.",
  },
  {
    id: "modern-montserrat",
    name: "Modern Montserrat",
    category: "Bold & Clear",
    fonts: { headingFont: "Montserrat", bodyFont: "Open Sans" },
    sampleHeading: "Empowering Tomorrow's Pioneers",
    sampleBody: "Comprehensive undergraduate, postgraduate, and doctoral degree paths.",
  },
];

export function DesignThemePanel({
  activePalette,
  activeFonts,
  onSelectPalette,
  onSelectFonts,
  onClose,
}: {
  activePalette: PaletteColors;
  activeFonts: FontPack;
  onSelectPalette: (palette: PaletteColors) => void;
  onSelectFonts: (fonts: FontPack) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"colors" | "fonts">("colors");

  return (
    <motion.aside
      initial={{ opacity: 0, x: -10, width: 0 }}
      animate={{ opacity: 1, x: 0, width: 280 }}
      exit={{ opacity: 0, x: -10, width: 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      className="z-30 flex w-[280px] shrink-0 flex-col justify-between border-r border-[#1F1F23] bg-[#0B0B0C] p-4 overflow-hidden select-none"
    >
      <div className="flex flex-col gap-4 overflow-hidden h-full">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-black font-bold">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight">Theme & Styling</h2>
              <p className="text-[10px] text-neutral-400 font-mono">Live appearance editor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-[#17171A] hover:text-white transition"
            title="Close Panel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-[#111113] p-1 border border-[#26272B] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("colors")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition",
              activeTab === "colors"
                ? "bg-white text-black shadow-xs"
                : "text-neutral-400 hover:text-white"
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
                ? "bg-white text-black shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Type className="h-3.5 w-3.5" />
            <span>Typography</span>
          </button>
        </div>

        {/* Tab 1: Color Palettes List */}
        {activeTab === "colors" && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Curated Color Schemes ({PALETTE_PRESETS.length})
            </p>
            {PALETTE_PRESETS.map((preset) => {
              const isSelected =
                activePalette.primary === preset.colors.primary &&
                activePalette.secondary === preset.colors.secondary;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPalette(preset.colors)}
                  className={cn(
                    "group w-full rounded-2xl border p-3 text-left transition-all duration-200 relative overflow-hidden",
                    isSelected
                      ? "bg-[#17171A] border-white ring-1 ring-white/20 shadow-lg"
                      : "bg-[#111113] border-[#26272B] hover:border-neutral-500 hover:bg-[#17171A]"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-white transition-colors">
                      {preset.name}
                    </span>
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-500">{preset.category}</span>
                    )}
                  </div>

                  {/* 5-Color Swatch Preview Bar */}
                  <div className="flex h-6 w-full overflow-hidden rounded-lg border border-neutral-700/60 shadow-xs">
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
            })}
          </div>
        )}

        {/* Tab 2: Font Packs List */}
        {activeTab === "fonts" && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Curated Font Pairings ({FONT_PRESETS.length})
            </p>
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
                    "group w-full rounded-2xl border p-3 text-left transition-all duration-200 relative overflow-hidden",
                    isSelected
                      ? "bg-[#17171A] border-white ring-1 ring-white/20 shadow-lg"
                      : "bg-[#111113] border-[#26272B] hover:border-neutral-500 hover:bg-[#17171A]"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-white">
                      {preset.name}
                    </span>
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-500">{preset.category}</span>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-400 font-mono mb-2">
                    {preset.fonts.headingFont} + {preset.fonts.bodyFont}
                  </p>

                  {/* Typography Live Preview Card */}
                  <div className="rounded-xl bg-[#09090B] p-2.5 border border-[#26272B] space-y-1">
                    <p
                      className="text-xs font-extrabold text-white leading-tight truncate"
                      style={{ fontFamily: `'${preset.fonts.headingFont}', Georgia, serif` }}
                    >
                      {preset.sampleHeading}
                    </p>
                    <p
                      className="text-[10px] text-neutral-300 leading-snug line-clamp-2"
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
    </motion.aside>
  );
}
