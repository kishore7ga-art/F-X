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
  Trash2,
  FileText,
} from "lucide-react";

interface DrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPageSelect?: (pageName: string, pageSlug: string) => void;
  onPaletteSelect?: (paletteId: string) => void;
  onFontSelect?: (fontId: string) => void;
}

interface PageItem {
  id: string;
  name: string;
  slug: string;
  icon: any;
}

const INITIAL_PAGES: PageItem[] = [
  { id: "1", name: "Home", slug: "/home", icon: Home },
  { id: "2", name: "About Us", slug: "/about", icon: Info },
  { id: "3", name: "Academics", slug: "/academics", icon: GraduationCap },
  { id: "4", name: "Events & News", slug: "/events", icon: Calendar },
  { id: "5", name: "Faculty", slug: "/faculty", icon: Users },
  { id: "6", name: "Admissions", slug: "/admissions", icon: Briefcase },
  { id: "7", name: "Contact Us", slug: "/contact", icon: Mail },
  { id: "8", name: "Programs", slug: "/programs", icon: BookOpen },
  { id: "9", name: "Schools/Department", slug: "/departments", icon: Building },
  { id: "10", name: "Placement & Careers", slug: "/placements", icon: Briefcase },
  { id: "11", name: "Scholarships & Grants", slug: "/scholarships", icon: Award },
];

const PALETTES = [
  { id: "academic-blue", name: "Academic Navy", primary: "#0f172a", accent: "#2563eb" },
  { id: "emerald-gold", name: "Emerald & Gold", primary: "#064e3b", accent: "#f59e0b" },
  { id: "crimson-slate", name: "Crimson Maroon", primary: "#881337", accent: "#e11d48" },
  { id: "midnight-purple", name: "Midnight Obsidian", primary: "#180828", accent: "#a855f7" },
  { id: "light-minimal", name: "Minimal Light", primary: "#ffffff", accent: "#0f172a" },
];

const FONTS = [
  { id: "inter", name: "Inter", detail: "Clean modern sans-serif for high readability", font: "font-sans" },
  { id: "serif", name: "Playfair Display", detail: "Classic academic serif typography", font: "font-serif" },
  { id: "outfit", name: "Outfit & Roboto", detail: "Bold tech & modern geometric font pairing", font: "font-mono" },
];

export function DrawerPanel({
  isOpen,
  onClose,
  onPageSelect,
  onPaletteSelect,
  onFontSelect,
}: DrawerPanelProps) {
  const [activeTab, setActiveTab] = useState<"pages" | "colors" | "fonts">("pages");
  const [pages, setPages] = useState<PageItem[]>(INITIAL_PAGES);
  const [selectedPageSlug, setSelectedPageSlug] = useState("/home");
  const [selectedPalette, setSelectedPalette] = useState("academic-blue");
  const [selectedFont, setSelectedFont] = useState("inter");

  // New Page Modal State
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectPage = (page: PageItem) => {
    setSelectedPageSlug(page.slug);
    if (onPageSelect) onPageSelect(page.name, page.slug);
    showNotification(`Switched to page: ${page.name} (${page.slug})`);
  };

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    const slug = `/${newPageName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const newPage: PageItem = {
      id: `custom-${Date.now()}`,
      name: newPageName.trim(),
      slug,
      icon: FileText,
    };

    setPages((prev) => [...prev, newPage]);
    setSelectedPageSlug(slug);
    setNewPageName("");
    setShowNewPageModal(false);
    showNotification(`Created new page: "${newPage.name}"`);
  };

  const handleDeletePage = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (pages.length <= 1) {
      showNotification("Cannot delete the last remaining page.");
      return;
    }
    setPages((prev) => prev.filter((p) => p.id !== pageId));
    showNotification("Page deleted successfully.");
  };

  const handleSelectPalette = (paletteId: string, paletteName: string) => {
    setSelectedPalette(paletteId);
    if (onPaletteSelect) onPaletteSelect(paletteId);
    showNotification(`Applied color theme: ${paletteName}`);
  };

  const handleSelectFont = (fontId: string, fontName: string) => {
    setSelectedFont(fontId);
    if (onFontSelect) onFontSelect(fontId);
    showNotification(`Applied font family: ${fontName}`);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-80 bg-white border-r border-slate-200 shadow-2xl flex flex-col text-slate-800 font-sans cursor-default"
      >
        
        {/* Notification Toast */}
        {toastMessage && (
          <div className="absolute top-2 left-3 right-3 z-50 p-2.5 bg-slate-900 text-white text-[11px] font-extrabold rounded-xl shadow-xl flex items-center justify-between animate-fade-in border border-slate-700">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header & Segmented Control Switcher */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/90 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 tracking-wide uppercase">
              Pages, Colors & Fonts
            </span>
          </div>

        {/* Segmented Switcher Control */}
        <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
          <button
            onClick={() => setActiveTab("pages")}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "pages" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Pages</span>
          </button>

          <button
            onClick={() => setActiveTab("colors")}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "colors" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Colors</span>
          </button>

          <button
            onClick={() => setActiveTab("fonts")}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "fonts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Fonts</span>
          </button>
        </div>
      </div>

      {/* Drawer Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        
        {/* PAGES TAB */}
        {activeTab === "pages" && (
          <div className="space-y-1.5">
            {pages.map((page) => {
              const Icon = page.icon;
              const isSelected = selectedPageSlug === page.slug;
              return (
                <div
                  key={page.id}
                  onClick={() => handleSelectPage(page)}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-100/90 border-slate-300 shadow-sm text-slate-900 font-extrabold"
                      : "bg-white border-transparent hover:bg-slate-50 text-slate-700 font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isSelected ? "bg-slate-900 text-white" : "text-slate-500"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs">{page.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{page.slug}</span>
                    </div>
                  </div>

                  {/* Optional delete button for custom pages */}
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => handleDeletePage(e, page.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* COLORS TAB */}
        {activeTab === "colors" && (
          <div className="space-y-2">
            {PALETTES.map((palette) => (
              <div
                key={palette.id}
                onClick={() => handleSelectPalette(palette.id, palette.name)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedPalette === palette.id
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 border border-slate-200 p-0.5 rounded-full">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: palette.primary }} />
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: palette.accent }} />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{palette.name}</span>
                </div>
                {selectedPalette === palette.id && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            ))}
          </div>
        )}

        {/* FONTS TAB */}
        {activeTab === "fonts" && (
          <div className="space-y-2">
            {FONTS.map((font) => (
              <div
                key={font.id}
                onClick={() => handleSelectFont(font.id, font.name)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedFont === font.id
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-xs font-bold text-slate-900 ${font.font}`}>{font.name}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{font.detail}</span>
                </div>
                {selectedFont === font.id && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add New Page Bottom Button */}
      {activeTab === "pages" && (
        <div className="p-3 border-t border-slate-200 bg-white">
          <button
            onClick={() => setShowNewPageModal(true)}
            className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Page</span>
          </button>
        </div>
      )}

      {/* Add New Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-900">Create New Page</h3>
            <form onSubmit={handleAddPage} className="space-y-3">
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Page Name (e.g. Research)"
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-slate-900"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewPageModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-2 rounded-xl text-xs cursor-pointer"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
