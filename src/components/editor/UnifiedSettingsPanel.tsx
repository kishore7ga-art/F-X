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
  BookOpen,
  Award,
  GraduationCap,
  Building,
  Microscope,
  Smile,
  Trophy,
  Rocket,
  Bus,
  Image as ImageIcon,
  Globe,
  Newspaper,
  BookMarked,
  UserCheck,
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
  admissions: <Briefcase className="h-5 w-5 stroke-[1.8]" />,
  programs: <BookOpen className="h-5 w-5 stroke-[1.8]" />,
  departments: <Building2 className="h-5 w-5 stroke-[1.8]" />,
  placements: <Award className="h-5 w-5 stroke-[1.8]" />,
  contact: <Mail className="h-5 w-5 stroke-[1.8]" />,
  faculty: <Users className="h-5 w-5 stroke-[1.8]" />,
  scholarships: <GraduationCap className="h-5 w-5 stroke-[1.8]" />,
  infrastructure: <Building className="h-5 w-5 stroke-[1.8]" />,
  hostel: <Home className="h-5 w-5 stroke-[1.8]" />,
  research: <Microscope className="h-5 w-5 stroke-[1.8]" />,
  "student-life": <Smile className="h-5 w-5 stroke-[1.8]" />,
  "centre-of-excellence": <Trophy className="h-5 w-5 stroke-[1.8]" />,
  "incubation-cell": <Rocket className="h-5 w-5 stroke-[1.8]" />,
  transport: <Bus className="h-5 w-5 stroke-[1.8]" />,
  events: <Calendar className="h-5 w-5 stroke-[1.8]" />,
  gallery: <ImageIcon className="h-5 w-5 stroke-[1.8]" />,
  "international-relations": <Globe className="h-5 w-5 stroke-[1.8]" />,
  news: <Newspaper className="h-5 w-5 stroke-[1.8]" />,
  blog: <FileText className="h-5 w-5 stroke-[1.8]" />,
  "blog-article": <BookMarked className="h-5 w-5 stroke-[1.8]" />,
  careers: <UserCheck className="h-5 w-5 stroke-[1.8]" />,
};

const DEFAULT_PAGE_ICON = <FileText className="h-5 w-5 stroke-[1.8]" />;

export const FULL_23_PAGES_LIST: PageData[] = [
  { id: "p-home", slug: "home", title: "Home", isPublished: true },
  { id: "p-about", slug: "about", title: "About", isPublished: true },
  { id: "p-admissions", slug: "admissions", title: "Admissions", isPublished: true },
  { id: "p-programs", slug: "programs", title: "Programs", isPublished: true },
  { id: "p-departments", slug: "departments", title: "Schools/Department", isPublished: true },
  { id: "p-placements", slug: "placements", title: "Placement & Career Services", isPublished: true },
  { id: "p-contact", slug: "contact", title: "Contact Us", isPublished: true },
  { id: "p-faculty", slug: "faculty", title: "Leadership & Faculty Team", isPublished: true },
  { id: "p-scholarships", slug: "scholarships", title: "Scholarships", isPublished: true },
  { id: "p-infrastructure", slug: "infrastructure", title: "Infrastructure", isPublished: true },
  { id: "p-hostel", slug: "hostel", title: "Hostel", isPublished: true },
  { id: "p-research", slug: "research", title: "Research & Innovation", isPublished: true },
  { id: "p-student-life", slug: "student-life", title: "Student Life", isPublished: true },
  { id: "p-coe", slug: "centre-of-excellence", title: "Centre for Excellence", isPublished: true },
  { id: "p-incubation", slug: "incubation-cell", title: "Startup Cell / Incubation Centre", isPublished: true },
  { id: "p-transport", slug: "transport", title: "Transport", isPublished: true },
  { id: "p-events", slug: "events", title: "Events", isPublished: true },
  { id: "p-gallery", slug: "gallery", title: "Gallery", isPublished: true },
  { id: "p-ir", slug: "international-relations", title: "International Relations", isPublished: true },
  { id: "p-news", slug: "news", title: "News", isPublished: true },
  { id: "p-blog", slug: "blog", title: "Blog Home Page", isPublished: true },
  { id: "p-blog-article", slug: "blog-article", title: "Blog Article Page", isPublished: true },
  { id: "p-careers", slug: "careers", title: "Careers", isPublished: true },
];

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

  // Combine passed pages with full 23 pages list to ensure every requested page is available
  const existingSlugs = new Set(pages.map((p) => p.slug.toLowerCase()));
  const missingPages = FULL_23_PAGES_LIST.filter((p) => !existingSlugs.has(p.slug.toLowerCase()));
  const displayPages = [...pages, ...missingPages];

  return (
    <motion.aside
      key="unified-settings-panel"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-0 top-0 bottom-0 z-40 flex w-[330px] sm:w-[370px] flex-col bg-white text-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-l border-slate-200/90 overflow-hidden select-none"
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
              <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 pt-0.5">
                {displayPages.map((page) => {
                  const isActive = page.slug.toLowerCase() === currentPage.slug.toLowerCase();
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
                          "relative flex h-[52px] w-full items-center justify-between rounded-xl px-3.5 text-[14px] font-semibold transition-all duration-150 border",
                          isActive
                            ? "bg-slate-100/90 text-slate-900 font-extrabold border-slate-200/90 shadow-2xs"
                            : "bg-white text-slate-800 font-medium hover:bg-slate-50 hover:text-slate-900 border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 truncate">
                          <span className={cn("shrink-0 transition-colors flex h-5 w-5 items-center justify-center", isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900")}>
                            {icon}
                          </span>
                          <div className="flex flex-col min-w-0 flex-1 justify-center leading-tight">
                            <span className="truncate capitalize text-[13.5px] font-semibold tracking-tight text-slate-900 leading-snug">{page.title}</span>
                            <span className="text-[10px] font-mono font-medium text-slate-400 leading-none">/{page.slug}</span>
                          </div>
                        </div>

                        <div className="flex items-center shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveContextMenuPageId((prev) => (prev === page.id ? null : page.id));
                            }}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                              activeContextMenuPageId === page.id
                                ? "opacity-100 bg-slate-200 text-slate-900"
                                : "opacity-0 group-hover:opacity-100 text-slate-400 hover:bg-slate-200/70 hover:text-slate-900"
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
