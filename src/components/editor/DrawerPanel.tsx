"use client";

import { useState } from "react";
import {
  X,
  Home,
  Info,
  GraduationCap,
  Calendar,
  Users,
  Briefcase,
  Mail,
  BookOpen,
  Building,
  Award,
  Plus,
  Palette,
  Type,
  Check,
} from "lucide-react";

interface DrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGES_LIST = [
  { name: "Home", slug: "/home", icon: Home, isSelected: true },
  { name: "About Us", slug: "/about", icon: Info, isSelected: false },
  { name: "Academics", slug: "/academics", icon: GraduationCap, isSelected: false },
  { name: "Events & News", slug: "/events", icon: Calendar, isSelected: false },
  { name: "Faculty", slug: "/faculty", icon: Users, isSelected: false },
  { name: "Admissions", slug: "/admissions", icon: Briefcase, isSelected: false },
  { name: "Contact Us", slug: "/contact", icon: Mail, isSelected: false },
  { name: "Programs", slug: "/programs", icon: BookOpen, isSelected: false },
  { name: "Schools/Department", slug: "/departments", icon: Building, isSelected: false },
  { name: "Placement & Career...", slug: "/placements", icon: Briefcase, isSelected: false },
  { name: "Scholarships", slug: "/scholarships", icon: Award, isSelected: false },
];

const PALETTES = [
  { id: "academic-blue", name: "Academic Blue", primary: "#1e3a8a", accent: "#3b82f6" },
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
  const [selectedPage, setSelectedPage] = useState("/home");
  const [selectedPalette, setSelectedPalette] = useState("academic-blue");
  const [selectedFont, setSelectedFont] = useState("inter");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 shadow-2xl flex flex-col text-slate-800 font-sans">
      {/* Header & Segmented Switcher */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-900 tracking-wide uppercase">
            Pages, Colors & Fonts
          </span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/80 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Control Pill matching image 3 */}
        <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
          <button
            onClick={() => setActiveTab("pages")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "pages" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Pages</span>
          </button>

          <button
            onClick={() => setActiveTab("colors")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "colors" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Colors</span>
          </button>

          <button
            onClick={() => setActiveTab("fonts")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "fonts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Fonts</span>
          </button>
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === "pages" && (
          <div className="space-y-1.5">
            {PAGES_LIST.map((page) => {
              const Icon = page.icon;
              const isSelected = selectedPage === page.slug;
              return (
                <div
                  key={page.slug}
                  onClick={() => setSelectedPage(page.slug)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-100/90 border-slate-300 shadow-sm text-slate-900 font-extrabold"
                      : "bg-white border-transparent hover:bg-slate-50 text-slate-700 font-semibold"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? "bg-slate-900 text-white" : "text-slate-500"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs">{page.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{page.slug}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "colors" && (
          <div className="space-y-2">
            {PALETTES.map((palette) => (
              <div
                key={palette.id}
                onClick={() => setSelectedPalette(palette.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedPalette === palette.id
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }} />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{palette.name}</span>
                </div>
                {selectedPalette === palette.id && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            ))}
          </div>
        )}

        {activeTab === "fonts" && (
          <div className="space-y-2">
            {FONTS.map((font) => (
              <div
                key={font.id}
                onClick={() => setSelectedFont(font.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedFont === font.id
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span className={`text-xs font-bold text-slate-900 ${font.font}`}>{font.name}</span>
                {selectedFont === font.id && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Fixed Dark Button matching Image 3 */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <button className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>
    </div>
  );
}
