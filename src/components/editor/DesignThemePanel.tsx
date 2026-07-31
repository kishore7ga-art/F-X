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
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">Theme & Styling</h2>
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
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 pt-1">
            {/* Color Search Input Bar */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search color name or hex (e.g., Emerald, #1E3A8A)..."
                value={colorSearchQuery}
                onChange={(e) => setColorSearchQuery(e.target.value)}
                className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-100/80 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            {/* Custom Color Palette Tuner / Picker */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 mb-3 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-slate-700" />
                  Custom Color Picker
                </span>
                <span className="text-[9px] font-mono font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">Live Tuner</span>
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
                      <div className="relative flex h-8 w-full items-center justify-center rounded-lg border border-slate-300/80 shadow-2xs overflow-hidden cursor-pointer hover:scale-105 transition-transform">
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

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Curated Color Schemes ({filteredPalettes.length})
            </p>
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
                      "group w-full rounded-2xl border p-3 text-left transition-all duration-200 relative overflow-hidden",
                      isSelected
                        ? "bg-slate-200 border-white ring-1 ring-white/20 shadow-lg"
                        : "bg-slate-100 border-slate-200 hover:border-neutral-500 hover:bg-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                        {preset.name}
                      </span>
                      {isSelected ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">{preset.category}</span>
                      )}
                    </div>

                    {/* 5-Color Swatch Preview Bar */}
                    <div className="flex h-6 w-full overflow-hidden rounded-lg border border-slate-300/60 shadow-xs">
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
          </div>
        )}

        {/* Tab 2: Font Packs List */}
        {activeTab === "fonts" && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                      ? "bg-slate-200 border-white ring-1 ring-white/20 shadow-lg"
                      : "bg-slate-100 border-slate-200 hover:border-neutral-500 hover:bg-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-slate-900">
                      {preset.name}
                    </span>
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">{preset.category}</span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono mb-2">
                    {preset.fonts.headingFont} + {preset.fonts.bodyFont}
                  </p>

                  {/* Typography Live Preview Card */}
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 space-y-1">
                    <p
                      className="text-xs font-extrabold text-slate-900 leading-tight truncate"
                      style={{ fontFamily: `'${preset.fonts.headingFont}', Georgia, serif` }}
                    >
                      {preset.sampleHeading}
                    </p>
                    <p
                      className="text-[10px] text-slate-500 leading-snug line-clamp-2"
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
