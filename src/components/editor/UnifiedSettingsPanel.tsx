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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { DesignThemePanel, PALETTE_PRESETS, FONT_PRESETS } from "@/components/editor/DesignThemePanel";
import type { PaletteColors, FontPack } from "@/lib/theme/theme";

interface PageData {
  id: string;
  slug: string;
  title: string;
  isPublished?: boolean;
}

const PAGE_ICONS: Record<string, ReactNode> = {
  home: <Home className="h-5 w-5 stroke-[1.8]" />,
  about: <Info className="h-5 w-5 stroke-[1.8]" />,
  academics: <Building2 className="h-5 w-5 stroke-[1.8]" />,
  events: <Calendar className="h-5 w-5 stroke-[1.8]" />,
  faculty: <Users className="h-5 w-5 stroke-[1.8]" />,
  admissions: <Briefcase className="h-5 w-5 stroke-[1.8]" />,
  contact: <Mail className="h-5 w-5 stroke-[1.8]" />,
};

const DEFAULT_PAGE_ICON = <FileText className="h-5 w-5 stroke-[1.8]" />;

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
      className="absolute right-0 top-0 bottom-0 z-40 flex w-[330px] sm:w-[370px] flex-col bg-white text-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border-l border-slate-200/90 overflow-hidden select-none"
    >
      {/* FLOATING SEGMENTED CONTROL HEADER */}
      <div className="p-3.5 border-b border-slate-200/80 bg-white">
        <div className="relative flex items-center gap-1 rounded-2xl bg-slate-100 p-1 border border-slate-200/80">
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
                  "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold transition-colors z-10",
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabSegment"
                    className="absolute inset-0 rounded-xl bg-white shadow-xs border border-slate-200/90 z-[-1]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
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
      <div className="flex-1 overflow-y-auto p-3.5">
        {/* TAB 1: PAGES & LAYERS */}
        {activeTab === "pages" && (
          <div className="flex flex-col gap-4 h-full justify-between">
            <div className="flex flex-col gap-1 overflow-hidden">
              {/* PAGES LIST ITEM ROWS */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 pt-0.5">
                {pages.map((page) => {
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
                          "relative flex h-[48px] w-full items-center justify-between rounded-xl px-4 text-[14px] font-semibold transition-all duration-150 border",
                          isActive
                            ? "bg-slate-100/90 text-slate-900 font-extrabold border-slate-200/90 shadow-2xs"
                            : "bg-white text-slate-800 font-medium hover:bg-slate-50 hover:text-slate-900 border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3.5 truncate">
                          <span className={cn("shrink-0 transition-colors", isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900")}>
                            {icon}
                          </span>
                          <span className="truncate capitalize text-[14px] font-semibold tracking-tight text-slate-900">{page.title}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveContextMenuPageId((prev) => (prev === page.id ? null : page.id));
                            }}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-900 transition"
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
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 text-xs font-extrabold text-white shadow-md shadow-slate-900/15 hover:bg-slate-800 transition-all active:scale-[0.99] cursor-pointer"
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
