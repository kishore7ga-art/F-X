"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Layers,
  Palette,
  Type,
  Plus,
  MoreVertical,
  Edit2,
  Copy,
  EyeOff,
  Trash2,
  Home,
  Info,
  Calendar,
  Mail,
  FileText,
  Building2,
  Briefcase,
  Users,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { DesignThemePanel } from "@/components/editor/DesignThemePanel";
import type { PaletteColors, FontPack } from "@/lib/theme/theme";

interface PageData {
  id: string;
  slug: string;
  title: string;
  isPublished?: boolean;
}

const PAGE_ICONS: Record<string, ReactNode> = {
  home: <Home className="h-4 w-4" />,
  about: <Info className="h-4 w-4" />,
  academics: <Building2 className="h-4 w-4" />,
  events: <Calendar className="h-4 w-4" />,
  faculty: <Users className="h-4 w-4" />,
  admissions: <Briefcase className="h-4 w-4" />,
  contact: <Mail className="h-4 w-4" />,
};

const DEFAULT_PAGE_ICON = <FileText className="h-4 w-4" />;

const PAGE_ICON_STYLES: Record<string, { bg: string; text: string }> = {
  home: { bg: "bg-blue-500/10", text: "text-blue-600" },
  about: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  academics: { bg: "bg-amber-500/10", text: "text-amber-600" },
  events: { bg: "bg-purple-500/10", text: "text-purple-600" },
  faculty: { bg: "bg-indigo-500/10", text: "text-indigo-600" },
  admissions: { bg: "bg-cyan-500/10", text: "text-cyan-600" },
  contact: { bg: "bg-rose-500/10", text: "text-rose-600" },
};

const DEFAULT_ICON_STYLE = { bg: "bg-slate-100", text: "text-slate-500" };

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
  initialTab?: "pages" | "colors" | "fonts";
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
  const [activeTab, setActiveTab] = useState<"pages" | "colors" | "fonts">(initialTab);

  return (
    <motion.aside
      key="unified-settings-panel"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-0 top-0 bottom-0 z-40 flex w-[330px] sm:w-[370px] flex-col bg-slate-50/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border-l border-slate-200/90 overflow-hidden select-none"
    >
      {/* APPLE-STYLE FLOATING SEGMENTED CONTROL HEADER */}
      <div className="p-3 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="relative flex items-center gap-1 rounded-2xl bg-slate-200/60 p-1 border border-slate-300/40">
          {[
            { id: "pages", label: "Pages", icon: Layers },
            { id: "colors", label: "Colors", icon: Palette },
            { id: "fonts", label: "Fonts", icon: Type },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "pages" | "colors" | "fonts")}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-extrabold transition-colors z-10",
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabSegment"
                    className="absolute inset-0 rounded-xl bg-white shadow-xs border border-slate-200/80 z-[-1]"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-slate-900" : "text-slate-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT DISPLAY */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: PAGES & LAYERS */}
        {activeTab === "pages" && (
          <div className="flex flex-col gap-4 h-full justify-between">
            <div className="flex flex-col gap-3 overflow-hidden">
              {/* PAGES LIST HEADER */}
              <div className="flex items-center justify-between px-1 pt-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Site Pages ({pages.length})
                </span>
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <GripVertical className="h-3 w-3 text-slate-400" />
                  Drag to reorder
                </span>
              </div>

              {/* PAGES LIST ITEM CARDS */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 pt-0.5">
                {pages.map((page) => {
                  const isActive = page.slug === currentPage.slug;
                  const icon = PAGE_ICONS[page.slug.toLowerCase()] ?? DEFAULT_PAGE_ICON;
                  const iconStyle = PAGE_ICON_STYLES[page.slug.toLowerCase()] ?? DEFAULT_ICON_STYLE;

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
                          "relative flex h-[50px] w-full items-center justify-between rounded-2xl px-3.5 text-xs transition-all duration-200 border",
                          isActive
                            ? "bg-slate-900 text-white font-extrabold border-slate-900 shadow-md shadow-slate-900/15"
                            : "bg-white text-slate-700 font-bold hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 border-slate-200/80 shadow-2xs"
                        )}
                      >
                        {/* ACTIVE GLOWING LEFT BAR */}
                        {isActive && (
                          <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        )}

                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                              isActive
                                ? "bg-blue-500/20 text-blue-400"
                                : `${iconStyle.bg} ${iconStyle.text}`
                            )}
                          >
                            {icon}
                          </div>
                          <span className="truncate capitalize text-xs tracking-tight">{page.title}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2.5 py-0.5 rounded-full transition-colors border",
                              isActive
                                ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                : "bg-slate-100 text-slate-500 border-slate-200/80"
                            )}
                          >
                            {page.slug === "home" ? "Main" : "Page"}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveContextMenuPageId((prev) => (prev === page.id ? null : page.id));
                            }}
                            className={cn(
                              "rounded-xl p-1 transition",
                              isActive
                                ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </Link>

                      {/* CONTEXT MENU */}
                      {activeContextMenuPageId === page.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-2 top-12 z-50 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl text-xs text-slate-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const newTitle = prompt("Rename page:", page.title);
                              if (newTitle) alert(`Renamed page to ${newTitle}`);
                              setActiveContextMenuPageId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 transition font-medium"
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
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 transition font-medium"
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
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 transition font-medium"
                          >
                            <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                            <span>Hide</span>
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete page ${page.title}?`)) alert(`Deleted page ${page.title}`);
                              setActiveContextMenuPageId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 transition font-medium"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM ADD NEW PAGE BUTTON */}
            <div className="pt-3 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  const name = prompt("Enter new page title:");
                  if (name) alert(`Adding page "${name}"`);
                }}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-900 bg-slate-900 text-xs font-extrabold text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Add New Page</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: COLOR PALETTES */}
        {activeTab === "colors" && (
          <DesignThemePanel
            activePalette={currentPalette}
            onSelectPalette={onSelectPalette}
            activeFonts={currentFonts}
            onSelectFonts={onSelectFonts}
            onClose={() => {}}
            embed={true}
            initialTab="colors"
          />
        )}

        {/* TAB 3: TYPOGRAPHY FONTS */}
        {activeTab === "fonts" && (
          <DesignThemePanel
            activePalette={currentPalette}
            onSelectPalette={onSelectPalette}
            activeFonts={currentFonts}
            onSelectFonts={onSelectFonts}
            onClose={() => {}}
            embed={true}
            initialTab="fonts"
          />
        )}
      </div>
    </motion.aside>
  );
}
