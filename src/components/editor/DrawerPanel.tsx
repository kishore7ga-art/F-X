"use client";

import { useState } from "react";
import { X, Layers, Palette, Type, Plus, Check } from "lucide-react";

interface DrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PAGES = [
  { name: "Home", slug: "/", isMain: true },
  { name: "About Us", slug: "/about", isMain: false },
  { name: "Academics", slug: "/academics", isMain: false },
  { name: "Events & News", slug: "/events", isMain: false },
  { name: "Faculty", slug: "/faculty", isMain: false },
  { name: "Admissions", slug: "/admissions", isMain: false },
  { name: "Contact Us", slug: "/contact", isMain: false },
];

const PALETTES = [
  { id: "academic-blue", name: "Academic Blue", primary: "#1e40af", accent: "#3b82f6" },
  { id: "emerald-slate", name: "Emerald Slate", primary: "#065f46", accent: "#10b981" },
  { id: "crimson-gold", name: "Crimson & Gold", primary: "#9f1239", accent: "#f59e0b" },
  { id: "midnight-purple", name: "Midnight Purple", primary: "#581c87", accent: "#a855f7" },
];

const FONTS = [
  { id: "inter", name: "Inter (Modern Sans)", font: "font-sans" },
  { id: "serif", name: "Playfair Display (Academic Serif)", font: "font-serif" },
  { id: "mono", name: "JetBrains Mono (Technical)", font: "font-mono" },
];

export function DrawerPanel({ isOpen, onClose }: DrawerPanelProps) {
  const [activeTab, setActiveTab] = useState<"pages" | "colors" | "fonts">("pages");
  const [selectedPalette, setSelectedPalette] = useState("academic-blue");
  const [selectedFont, setSelectedFont] = useState("inter");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800 shadow-2xl flex flex-col text-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
          Studio Navigation & Design
        </h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50">
        <button
          onClick={() => setActiveTab("pages")}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === "pages" ? "border-blue-500 text-blue-400 bg-slate-900" : "border-transparent text-slate-400"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Pages</span>
        </button>
        <button
          onClick={() => setActiveTab("colors")}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === "colors" ? "border-blue-500 text-blue-400 bg-slate-900" : "border-transparent text-slate-400"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Colors</span>
        </button>
        <button
          onClick={() => setActiveTab("fonts")}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === "fonts" ? "border-blue-500 text-blue-400 bg-slate-900" : "border-transparent text-slate-400"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Fonts</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "pages" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>SITE PAGES ({DEFAULT_PAGES.length})</span>
              <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold">
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {DEFAULT_PAGES.map((page) => (
                <div
                  key={page.slug}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs font-medium cursor-pointer"
                >
                  <span className="text-white">{page.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{page.slug}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "colors" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-medium">Select a color palette for your institution website:</p>
            <div className="space-y-2">
              {PALETTES.map((palette) => (
                <div
                  key={palette.id}
                  onClick={() => setSelectedPalette(palette.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedPalette === palette.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.primary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }} />
                    </div>
                    <span className="text-xs font-bold text-white">{palette.name}</span>
                  </div>
                  {selectedPalette === palette.id && <Check className="w-4 h-4 text-blue-400" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "fonts" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-medium">Select typography styling preset:</p>
            <div className="space-y-2">
              {FONTS.map((font) => (
                <div
                  key={font.id}
                  onClick={() => setSelectedFont(font.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedFont === font.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <span className={`text-xs font-bold text-white ${font.font}`}>{font.name}</span>
                  {selectedFont === font.id && <Check className="w-4 h-4 text-blue-400" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-[11px] text-slate-500 text-center font-medium">
        Changes autosave dynamically
      </div>
    </div>
  );
}
