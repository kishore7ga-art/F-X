"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Layers,
  Palette,
  FolderOpen,
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Copy,
  EyeOff,
  Trash2,
  X,
  Home,
  Info,
  Calendar,
  Mail,
  FileText,
  Building2,
  Briefcase,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { DesignThemePanel } from "@/components/editor/DesignThemePanel";
import { AssetsMediaPanel } from "@/components/editor/AssetsMediaPanel";
import type { PaletteColors, FontPack } from "@/lib/theme/theme";

interface PageData {
  id: string;
  slug: string;
  title: string;
  isPublished?: boolean;
}

const PAGE_ICONS: Record<string, ReactNode> = {
  home: <Home className="h-3.5 w-3.5" />,
  about: <Info className="h-3.5 w-3.5" />,
  academics: <Building2 className="h-3.5 w-3.5" />,
  events: <Calendar className="h-3.5 w-3.5" />,
  faculty: <Users className="h-3.5 w-3.5" />,
  admissions: <Briefcase className="h-3.5 w-3.5" />,
  contact: <Mail className="h-3.5 w-3.5" />,
};

const DEFAULT_PAGE_ICON = <FileText className="h-3.5 w-3.5" />;

interface UnifiedSettingsPanelProps {
  college: {
    id: string;
    name: string;
    subdomain: string;
    status: string;
  };
  pages: PageData[];
  currentPage: PageData;
  filteredPages: PageData[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeContextMenuPageId: string | null;
  setActiveContextMenuPageId: (id: string | null | ((prev: string | null) => string | null)) => void;
  currentPalette: PaletteColors;
  onSelectPalette: (colors: PaletteColors) => void;
  currentFonts: FontPack;
  onSelectFonts: (fonts: FontPack) => void;
  onClose: () => void;
  initialTab?: "pages" | "theme" | "assets";
}

export function UnifiedSettingsPanel({
  college,
  pages,
  currentPage,
  filteredPages,
  searchQuery,
  setSearchQuery,
  activeContextMenuPageId,
  setActiveContextMenuPageId,
  currentPalette,
  onSelectPalette,
  currentFonts,
  onSelectFonts,
  onClose,
  initialTab = "pages",
}: UnifiedSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"pages" | "theme" | "assets">(initialTab);

  return (
    <motion.aside
      key="unified-settings-panel"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="absolute left-0 top-0 bottom-0 z-40 flex w-[320px] sm:w-[360px] flex-col bg-white shadow-2xl border-r border-slate-200/90 overflow-hidden"
    >
      {/* PANEL HEADER WITH TAB SWITCHER */}
      <div className="flex flex-col gap-3 p-4 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white font-extrabold text-xs">
              S
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight truncate max-w-[170px]">
                {college.name || "Kaveri Institute"}
              </h2>
              <p className="text-[10px] font-medium text-slate-400">Design &amp; Site Settings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition"
            title="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* TOP TAB CONTROL SWITCHER */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("pages")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all",
              activeTab === "pages"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Pages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("theme")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all",
              activeTab === "theme"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
            )}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("assets")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all",
              activeTab === "assets"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
            )}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Assets</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT DISPLAY */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: PAGES & LAYERS */}
        {activeTab === "pages" && (
          <div className="flex flex-col gap-3.5 h-full justify-between">
            <div className="flex flex-col gap-3 overflow-hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-[40px] w-full rounded-xl border border-slate-200 bg-slate-100/80 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5">
                {filteredPages.map((page) => {
                  const isActive = page.slug === currentPage.slug;
                  const icon = PAGE_ICONS[page.slug.toLowerCase()] ?? DEFAULT_PAGE_ICON;

                  return (
                    <div key={page.id} className="relative group">
                      <Link
                        href={`/editor/${college.subdomain}?page=${page.slug}`}
                        prefetch={true}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setActiveContextMenuPageId(page.id);
                        }}
                        className={cn(
                          "relative flex h-[48px] w-full items-center justify-between rounded-xl px-3 text-xs font-medium transition-all duration-150",
                          isActive
                            ? "bg-slate-900 text-white font-bold shadow-md shadow-slate-200"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-blue-500" />
                        )}

                        <div className="flex items-center gap-2.5 truncate">
                          <span className={isActive ? "text-blue-400" : "text-slate-400"}>
                            {icon}
                          </span>
                          <span className="truncate capitalize">{page.title}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveContextMenuPageId((prev) => (prev === page.id ? null : page.id));
                          }}
                          className={cn(
                            "rounded-md p-1 opacity-0 group-hover:opacity-100 transition",
                            isActive
                              ? "text-slate-300 hover:bg-slate-800"
                              : "text-slate-400 hover:bg-slate-200 hover:text-slate-900"
                          )}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </Link>

                      {activeContextMenuPageId === page.id && (
                        <div
                          className="absolute right-1 top-10 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl text-xs text-slate-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const newTitle = prompt("Rename page:", page.title);
                              if (newTitle) alert(`Renamed page to ${newTitle}`);
                              setActiveContextMenuPageId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-100 transition font-medium"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Duplicated ${page.title}`);
                              setActiveContextMenuPageId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-100 transition font-medium"
                          >
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Toggled visibility for ${page.title}`);
                              setActiveContextMenuPageId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-100 transition font-medium"
                          >
                            <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                            <span>Hide</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete page ${page.title}?`)) alert(`Deleted page ${page.title}`);
                              setActiveContextMenuPageId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-red-600 hover:bg-red-50 transition font-medium"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const name = prompt("Enter new page title:");
                  if (name) alert(`Adding page "${name}"`);
                }}
                className="flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Page</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: COLOR & FONT THEME */}
        {activeTab === "theme" && (
          <DesignThemePanel
            activePalette={currentPalette}
            onSelectPalette={onSelectPalette}
            activeFonts={currentFonts}
            onSelectFonts={onSelectFonts}
            onClose={() => {}}
            embed={true}
          />
        )}

        {/* TAB 3: ASSETS & MEDIA */}
        {activeTab === "assets" && <AssetsMediaPanel onClose={() => {}} embed={true} />}
      </div>
    </motion.aside>
  );
}
