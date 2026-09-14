"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Palette, Sliders, Check } from "lucide-react";
import {
  normalizeHex,
  isValidHex,
  generateTokensFromSeed,
  deriveSectionThemes,
  type ColorTokenMap,
  type SectionThemeDerived,
} from "@/lib/editor-themes";

interface PaletteEditorDrawerProps {
  isOpen: boolean;
  tokens: ColorTokenMap;
  onChange: (tokens: ColorTokenMap) => void;
  className?: string;
}

const CURATED_SEED_PRESETS = [
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Indigo Velvet", hex: "#4F46E5" },
  { name: "Emerald Forest", hex: "#059669" },
  { name: "Amber Sunset", hex: "#D97706" },
  { name: "Rose Crimson", hex: "#E11D48" },
  { name: "Teal Ocean", hex: "#0D9488" },
  { name: "Violet Orchid", hex: "#7C3AED" },
  { name: "Neutral Slate", hex: "#475569" },
];

const CURATED_COMBINATIONS: { name: string; category: string; tokens: ColorTokenMap }[] = [
  {
    name: "Modern Ocean",
    category: "Cool & Crisp",
    tokens: {
      light1: "#FFFFFF",
      light2: "#F0F9FF",
      accent: "#0284C7",
      dark1: "#334155",
      dark2: "#0F172A",
    },
  },
  {
    name: "Emerald & Cream",
    category: "Organic Elegance",
    tokens: {
      light1: "#FAFAF9",
      light2: "#F5F5F4",
      accent: "#059669",
      dark1: "#44403C",
      dark2: "#1C1917",
    },
  },
  {
    name: "Sunset Ember",
    category: "Warm & Bold",
    tokens: {
      light1: "#FFFBEB",
      light2: "#FEF3C7",
      accent: "#D97706",
      dark1: "#78350F",
      dark2: "#451A03",
    },
  },
  {
    name: "Midnight Indigo",
    category: "Deep Contrast",
    tokens: {
      light1: "#FFFFFF",
      light2: "#EEF2FF",
      accent: "#4F46E5",
      dark1: "#312E81",
      dark2: "#1E1B4B",
    },
  },
  {
    name: "Crimson Velvet",
    category: "Vibrant & Dynamic",
    tokens: {
      light1: "#FFFFFF",
      light2: "#FFF1F2",
      accent: "#E11D48",
      dark1: "#4C0519",
      dark2: "#1F0208",
    },
  },
  {
    name: "Nordic Minimal",
    category: "Clean Neutral",
    tokens: {
      light1: "#FFFFFF",
      light2: "#F1F5F9",
      accent: "#2563EB",
      dark1: "#64748B",
      dark2: "#0F172A",
    },
  },
];

interface ColorInputRowProps {
  label: string;
  roleDescription: string;
  value: string;
  tokenKey: keyof ColorTokenMap;
  onChange: (key: keyof ColorTokenMap, hex: string) => void;
}

function ColorInputRow({
  label,
  roleDescription,
  value,
  tokenKey,
  onChange,
}: ColorInputRowProps) {
  const norm = normalizeHex(value);
  const [typed, setTyped] = useState(norm);

  useEffect(() => {
    setTyped(norm);
  }, [norm]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim().toUpperCase();
    if (!val.startsWith("#") && val.length > 0) val = "#" + val;
    setTyped(val);
    if (isValidHex(val)) {
      onChange(tokenKey, normalizeHex(val));
    }
  };

  const handleBlur = () => {
    setTyped(norm);
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = normalizeHex(e.target.value);
    setTyped(val);
    onChange(tokenKey, val);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="flex flex-col min-w-0 pr-2">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </span>
        <span className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate">
          {roleDescription}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Swatch Button Picker */}
        <label
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 shadow-inner overflow-hidden transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: norm }}
          title={`Click to pick color for ${label}`}
        >
          <input
            type="color"
            value={norm}
            onChange={handleNativeColorChange}
            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
            aria-label={`Pick color for ${label}`}
          />
        </label>

        {/* Hex Text Field */}
        <div className="relative">
          <input
            type="text"
            value={typed}
            onChange={handleTextChange}
            onBlur={handleBlur}
            maxLength={7}
            aria-label={`${label} Hex Code`}
            className={`h-7 w-20 rounded-md border px-1.5 text-center font-mono text-xs font-medium uppercase transition-colors outline-none ${
              isValidHex(typed)
                ? "border-slate-300 bg-white text-slate-800 focus:border-slate-950 focus:ring-1 focus:ring-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-white dark:focus:ring-white"
                : "border-red-400 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export function PaletteEditorDrawer({
  isOpen,
  tokens,
  onChange,
  className = "",
}: PaletteEditorDrawerProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "fromColor" | "custom">("custom");
  const [seedColor, setSeedColor] = useState(tokens.accent);
  const [autoGenerateWcag, setAutoGenerateWcag] = useState(true);

  // Synchronize seed color when external accent token changes
  useEffect(() => {
    setSeedColor(tokens.accent);
  }, [tokens.accent]);

  const handleTokenChange = useCallback(
    (key: keyof ColorTokenMap, hex: string) => {
      const next = { ...tokens, [key]: hex };
      onChange(next);
    },
    [tokens, onChange]
  );

  const handleSeedSelect = (hex: string) => {
    const norm = normalizeHex(hex);
    setSeedColor(norm);
    const derived = generateTokensFromSeed(norm);
    onChange(derived);
  };

  const handlePresetSelect = (presetTokens: ColorTokenMap) => {
    onChange(presetTokens);
  };

  // Section theme previews
  const derivedThemes: SectionThemeDerived = deriveSectionThemes(tokens, autoGenerateWcag);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/80 p-4 shadow-sm ${className}`}
          data-testid="palette-editor-drawer"
        >
          {/* Generation Model Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg mb-4 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-all ${
                activeTab === "presets"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fromColor")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-all ${
                activeTab === "fromColor"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>From Color</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-all ${
                activeTab === "custom"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Swatches</span>
            </button>
          </div>

          {/* TAB 1: PRESETS / PALETTE SWATCHES */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <div className="text-[11.5px] text-slate-500 dark:text-slate-400">
                Quick curated color combinations inspired by modern web design.
              </div>
              <div className="grid grid-cols-1 gap-2">
                {CURATED_COMBINATIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(preset.tokens)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 transition-colors text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {preset.category}
                      </span>
                    </div>

                    {/* 5-chip preview */}
                    <div className="flex h-5 w-20 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
                      <span className="flex-1" style={{ backgroundColor: preset.tokens.light1 }} />
                      <span className="flex-1" style={{ backgroundColor: preset.tokens.light2 }} />
                      <span className="flex-1" style={{ backgroundColor: preset.tokens.accent }} />
                      <span className="flex-1" style={{ backgroundColor: preset.tokens.dark1 }} />
                      <span className="flex-1" style={{ backgroundColor: preset.tokens.dark2 }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FROM 1 SEED COLOR */}
          {activeTab === "fromColor" && (
            <div className="space-y-3">
              <div className="text-[11.5px] text-slate-500 dark:text-slate-400">
                Pick your primary brand accent. The algorithm automatically calculates accessible neutral tints and high-contrast dark tones.
              </div>

              {/* Seed Color Selector */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2.5">
                  <label
                    className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 shadow-sm overflow-hidden"
                    style={{ backgroundColor: seedColor }}
                  >
                    <input
                      type="color"
                      value={seedColor}
                      onChange={(e) => handleSeedSelect(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Seed Accent Color"
                    />
                  </label>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Brand Accent Seed
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-400">
                      {seedColor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {CURATED_SEED_PRESETS.slice(0, 4).map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => handleSeedSelect(p.hex)}
                      title={p.name}
                      className="h-6 w-6 rounded-full border border-slate-300 dark:border-slate-600 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                      style={{ backgroundColor: p.hex }}
                    >
                      {seedColor.toLowerCase() === p.hex.toLowerCase() && (
                        <Check className="w-3 h-3 text-white drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick swatch grid */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CURATED_SEED_PRESETS.map((p) => (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => handleSeedSelect(p.hex)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                      seedColor.toLowerCase() === p.hex.toLowerCase()
                        ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT EDIT / CUSTOM SWATCHES */}
          {activeTab === "custom" && (
            <div className="space-y-1 bg-white dark:bg-slate-900/90 rounded-lg p-3 border border-slate-200/80 dark:border-slate-800">
              <ColorInputRow
                label="Primary / Accent"
                roleDescription="Buttons, links & active rings"
                value={tokens.accent}
                tokenKey="accent"
                onChange={handleTokenChange}
              />
              <ColorInputRow
                label="Light Neutral 1"
                roleDescription="Page canvas & primary background"
                value={tokens.light1}
                tokenKey="light1"
                onChange={handleTokenChange}
              />
              <ColorInputRow
                label="Light Neutral 2"
                roleDescription="Card background & secondary layer"
                value={tokens.light2}
                tokenKey="light2"
                onChange={handleTokenChange}
              />
              <ColorInputRow
                label="Dark Neutral 1"
                roleDescription="Secondary text, borders & muted icons"
                value={tokens.dark1}
                tokenKey="dark1"
                onChange={handleTokenChange}
              />
              <ColorInputRow
                label="Dark Neutral 2"
                roleDescription="Primary headings & high contrast text"
                value={tokens.dark2}
                tokenKey="dark2"
                onChange={handleTokenChange}
              />
            </div>
          )}

          {/* Derived Section Themes Preview / WCAG Switch */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Auto-generate derived shades
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  WCAG AAA
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoGenerateWcag}
                onClick={() => setAutoGenerateWcag(!autoGenerateWcag)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoGenerateWcag ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoGenerateWcag ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Derived 5 section color styles mini visualizer */}
            <div className="grid grid-cols-5 gap-1 pt-1 text-[9.5px] text-center font-medium">
              {(
                [
                  { key: "lightest", label: "Lightest", item: derivedThemes.lightest },
                  { key: "light", label: "Light", item: derivedThemes.light },
                  { key: "bright", label: "Bright", item: derivedThemes.bright },
                  { key: "dark", label: "Dark", item: derivedThemes.dark },
                  { key: "darkest", label: "Darkest", item: derivedThemes.darkest },
                ] as const
              ).map((sec) => (
                <div
                  key={sec.key}
                  className="flex flex-col items-center justify-center p-1.5 rounded border border-slate-200/80 dark:border-slate-700 shadow-xs"
                  style={{ backgroundColor: sec.item.bg, color: sec.item.text }}
                  title={`${sec.label}: bg ${sec.item.bg}, text ${sec.item.text}`}
                >
                  <span className="truncate w-full">{sec.label}</span>
                  <span
                    className="w-2 h-2 rounded-full mt-0.5"
                    style={{ backgroundColor: sec.item.accent }}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
