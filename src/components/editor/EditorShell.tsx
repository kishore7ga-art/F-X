"use client";

import Link from "next/link";
import { useState, useTransition, useMemo, type ReactNode } from "react";
import {
  Home,
  Info,
  Layers,
  Calendar,
  Mail,
  Image as ImageIcon,
  FileText,
  Shield,
  Sliders,
  ExternalLink,
  Search,
  Plus,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  BookOpen,
  Briefcase,
  Building2,
  Microscope,
  GraduationCap,
  Users,
  MoreVertical,
  Edit2,
  Copy,
  EyeOff,
  Trash2,
  RefreshCw,
  Palette,
  FolderOpen,
  Settings,
  X,
  LogOut,
} from "lucide-react";

import { logout } from "@/app/actions/auth";

import { AddSectionMenu } from "@/components/editor/AddSectionMenu";
import { AssetsMediaPanel } from "@/components/editor/AssetsMediaPanel";
import { DesignThemePanel } from "@/components/editor/DesignThemePanel";
import { EditorContextProvider, type SectionStyleOverride } from "@/components/editor/EditorContext";
import { PublishToggle } from "@/components/editor/PublishToggle";
import { SectionEditPopup } from "@/components/editor/SectionEditPopup";
import type { EditorPageData } from "@/lib/editor/queries";
import type { PaletteColors, FontPack } from "@/lib/theme/theme";
import { buildThemeStyle, googleFontsHref } from "@/lib/theme/theme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const PAGE_ICONS: Record<string, ReactNode> = {
  home: <Home className="h-3.5 w-3.5" />,
  about: <Info className="h-3.5 w-3.5" />,
  academics: <GraduationCap className="h-3.5 w-3.5" />,
  courses: <BookOpen className="h-3.5 w-3.5" />,
  admissions: <FileText className="h-3.5 w-3.5" />,
  placements: <Briefcase className="h-3.5 w-3.5" />,
  facilities: <Building2 className="h-3.5 w-3.5" />,
  campus: <Building2 className="h-3.5 w-3.5" />,
  research: <Microscope className="h-3.5 w-3.5" />,
  events: <Calendar className="h-3.5 w-3.5" />,
  faculty: <Users className="h-3.5 w-3.5" />,
  alumni: <Users className="h-3.5 w-3.5" />,
  contact: <Mail className="h-3.5 w-3.5" />,
  gallery: <ImageIcon className="h-3.5 w-3.5" />,
  security: <Shield className="h-3.5 w-3.5" />,
};

const DEFAULT_PAGE_ICON = <Layers className="h-3.5 w-3.5" />;

export function EditorShell({
  data,
  children,
  canSignOut = true,
  canCycleTemplate = false,
}: {
  data: EditorPageData;
  children: ReactNode;
  canSignOut?: boolean;
  canCycleTemplate?: boolean;
}) {
  const { college, pages, currentPage, sections, addableSections } = data;

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSectionAnchor, setSelectedSectionAnchor] = useState<{ x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContextMenuPageId, setActiveContextMenuPageId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activePanel, setActivePanel] = useState<"pages" | "design" | "assets" | null>(null);
  
  // Live Palette and Fonts for instant real-time canvas updates
  const [livePalette, setLivePalette] = useState<PaletteColors>(data.theme.colors);
  const [liveFonts, setLiveFonts] = useState<FontPack>(data.theme.fonts);

  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Live state maps for instant canvas updates
  const [liveContentMap, setLiveContentMap] = useState<Record<string, unknown>>({});
  const [liveStylesMap, setLiveStylesMap] = useState<Record<string, SectionStyleOverride>>({});

  // Undo / Redo history stacks
  const [history, setHistory] = useState<{
    content: Record<string, unknown>;
    styles: Record<string, SectionStyleOverride>;
  }[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);

  const selectSection = (id: string | null) => {
    setSelectedSectionId(id);
    setSelectedSectionAnchor(null);
  };

  const openSectionPopup = (id: string, at: { x: number; y: number }) => {
    setSelectedSectionId(id);
    setSelectedSectionAnchor(at);
  };

  const updateSectionContent = (id: string, content: Record<string, unknown>) => {
    setLiveContentMap((prev) => {
      const next = { ...prev, [id]: content };
      setHistory((hPrev) => {
        const sliced = hPrev.slice(0, historyPointer + 1);
        return [...sliced, { content: next, styles: liveStylesMap }];
      });
      setHistoryPointer((p) => p + 1);
      return next;
    });
  };

  const updateSectionStyle = (id: string, style: SectionStyleOverride) => {
    setLiveStylesMap((prev) => {
      const next = { ...prev, [id]: style };
      setHistory((hPrev) => {
        const sliced = hPrev.slice(0, historyPointer + 1);
        return [...sliced, { content: liveContentMap, styles: next }];
      });
      setHistoryPointer((p) => p + 1);
      return next;
    });
  };

  const canUndo = historyPointer >= 0;
  const canRedo = historyPointer < history.length - 1;

  const undo = () => {
    if (!canUndo) return;
    const targetPointer = historyPointer - 1;
    if (targetPointer < 0) {
      setLiveContentMap({});
      setLiveStylesMap({});
    } else {
      const state = history[targetPointer];
      setLiveContentMap(state.content);
      setLiveStylesMap(state.styles);
    }
    setHistoryPointer(targetPointer);
  };

  const redo = () => {
    if (!canRedo) return;
    const targetPointer = historyPointer + 1;
    const state = history[targetPointer];
    setLiveContentMap(state.content);
    setLiveStylesMap(state.styles);
    setHistoryPointer(targetPointer);
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;

  function run(action: () => Promise<void>) {
    setActionError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (cause) {
        setActionError(
          cause instanceof Error ? cause.message : "Something went wrong."
        );
      }
    });
  }

  // Filtered pages for search bar
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    return pages.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  const initialLetter = college.name ? college.name.charAt(0).toUpperCase() : "N";

  return (
    <EditorContextProvider
      value={{
        collegeId: college.id,
        pageId: currentPage.id,
        sections,
        addableSections,
        selectedSectionId,
        liveContentMap,
        liveStylesMap,
        updateSectionContent,
        updateSectionStyle,
        selectSection,
        openSectionPopup,
        canUndo,
        canRedo,
        undo,
        redo,
        isPending,
        run,
      }}
    >
      {/* Dynamic Google Fonts Loader */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={googleFontsHref(liveFonts)} />

      <div
        className="relative flex h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans select-none"
        onClick={() => setActiveContextMenuPageId(null)}
      >
        {/* ─── 1. LEFT ICON RAIL WITH ALL EDITOR CONTROLS & RIGHT-SIDE TOOLTIPS ─── */}
        <aside className="z-50 flex w-[56px] shrink-0 flex-col items-center justify-between border-r border-slate-200 bg-white py-3.5 overflow-y-auto">
          {/* Top Group: Brand & Primary Panels */}
          <div className="flex flex-col items-center gap-2.5">
            {/* Logo / Brand Indicator */}
            <div className="group relative flex items-center">
              <Link
                href="/"
                className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-colors"
              >
                <span className="font-extrabold text-sm">X</span>
              </Link>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Dashboard
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>

            <div className="h-px w-6 bg-slate-200" />

            {/* Icon 1: Pages */}
            <div className="group relative flex items-center">
              <button
                type="button"
                onClick={() => setActivePanel((prev) => (prev === "pages" ? null : "pages"))}
                aria-label="Website Pages"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                  activePanel === "pages"
                    ? "bg-slate-900 text-white shadow-md font-bold"
                    : "text-slate-800 hover:bg-slate-100 hover:text-black"
                )}
              >
                <Layers className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Website Pages
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>

            {/* Icon 2: Design (Palette / Theme styling) */}
            <div className="group relative flex items-center">
              <button
                type="button"
                onClick={() => setActivePanel((prev) => (prev === "design" ? null : "design"))}
                aria-label="Color Palettes & Fonts"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                  activePanel === "design"
                    ? "bg-slate-900 text-white shadow-md font-bold"
                    : "text-slate-800 hover:bg-slate-100 hover:text-black"
                )}
              >
                <Palette className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Color Palettes &amp; Fonts
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>

            {/* Icon 3: Assets */}
            <div className="group relative flex items-center">
              <button
                type="button"
                onClick={() => setActivePanel((prev) => (prev === "assets" ? null : "assets"))}
                aria-label="Assets & Media"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                  activePanel === "assets"
                    ? "bg-slate-900 text-white shadow-md font-bold"
                    : "text-slate-800 hover:bg-slate-100 hover:text-black"
                )}
              >
                <FolderOpen className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Assets &amp; Media
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>

            <div className="h-px w-6 bg-slate-200" />

            {/* Undo */}
            <div className="group relative flex items-center">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100 hover:text-black transition"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Undo
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>

            {/* Redo */}
            <div className="group relative flex items-center">
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100 hover:text-black transition"
              >
                <Redo2 className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Redo
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>

            <div className="h-px w-6 bg-slate-200" />

            {/* Viewports: Desktop */}
            <div className="group relative flex items-center">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                aria-label="Desktop View"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                  deviceMode === "desktop"
                    ? "bg-slate-900 text-white shadow-md font-bold"
                    : "text-slate-800 hover:bg-slate-100 hover:text-black"
                )}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Desktop View
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>

            {/* Viewports: Tablet */}
            <div className="group relative flex items-center">
              <button
                type="button"
                onClick={() => setDeviceMode("tablet")}
                aria-label="Tablet View"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                  deviceMode === "tablet"
                    ? "bg-slate-900 text-white shadow-md font-bold"
                    : "text-slate-800 hover:bg-slate-100 hover:text-black"
                )}
              >
                <Tablet className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Tablet View
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>

            {/* Viewports: Mobile */}
            <div className="group relative flex items-center">
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                aria-label="Mobile View"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                  deviceMode === "mobile"
                    ? "bg-slate-900 text-white shadow-md font-bold"
                    : "text-slate-800 hover:bg-slate-100 hover:text-black"
                )}
              >
                <Smartphone className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Mobile View
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>
          </div>

          {/* Bottom Group: Preview, Publish, Sign Out, Avatar */}
          <div className="flex flex-col items-center gap-2.5 pt-2">
            {/* Preview */}
            <div className="group relative flex items-center">
              <Link
                href={`/site/${college.subdomain}`}
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                Preview Site
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>

            {/* Publish Toggle */}
            <PublishToggle collegeId={college.id} status={college.status} compact={true} />

            {/* Sign Out */}
            {canSignOut && (
              <div className="group relative flex items-center">
                <form action={logout}>
                  <button
                    type="submit"
                    aria-label="Sign Out"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
                <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                  Sign Out
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-red-600" />
                </div>
              </div>
            )}

            {/* Avatar -> Profile Page */}
            <div className="group relative flex items-center">
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 border border-slate-300 text-xs font-bold text-slate-900 shadow-inner hover:ring-2 hover:ring-slate-900 transition"
              >
                {initialLetter}
              </Link>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
                User Profile ({college.name || "Active Session"})
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>
          </div>
        </aside>

        {/* ─── 2. TOGGLEABLE OVERLAY SIDE PANELS (Pages & Design Theme) ─── */}
        <AnimatePresence mode="wait">
          {/* Panel 1: Pages Panel */}
          {activePanel === "pages" && (
            <motion.aside
              key="pages-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute left-[56px] top-0 bottom-0 z-40 flex w-[260px] flex-col justify-between border-r border-slate-200 bg-white p-3.5 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col gap-3.5 overflow-hidden">
                {/* Header: Website Name & Page Count Badge */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-xs font-bold text-slate-900 tracking-tight truncate max-w-[130px]">
                    {college.name || "Kaveri Institute"}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="shrink-0 rounded-full bg-slate-200 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-500">
                      {pages.length} Pages
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition"
                      title="Close panel"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Compact Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-[40px] w-full rounded-[12px] border border-slate-200 bg-slate-100 pl-8 pr-2 text-xs font-medium text-slate-900 placeholder-neutral-500 outline-none transition focus:border-white focus:ring-1 focus:ring-white"
                  />
                </div>

                {/* Page Cards */}
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
                            "relative flex h-[48px] w-full items-center justify-between rounded-[12px] px-3 text-xs font-medium transition-colors duration-150",
                            isActive
                              ? "bg-slate-900 text-white font-bold shadow-md shadow-slate-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60"
                          )}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-black" />
                          )}

                          <div className="flex items-center gap-2.5 truncate">
                            <span className={isActive ? "text-black" : "text-slate-400"}>
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
                              isActive ? "text-slate-400 hover:bg-slate-200" : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </button>
                        </Link>

                        {/* Context Menu */}
                        {activeContextMenuPageId === page.id && (
                          <div
                            className="absolute right-1 top-10 z-50 w-40 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-xl text-xs text-slate-900"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const newTitle = prompt("Rename page:", page.title);
                                if (newTitle) alert(`Renamed page to ${newTitle}`);
                                setActiveContextMenuPageId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-200 hover:text-slate-900 transition"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Rename</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Duplicated ${page.title}`);
                                setActiveContextMenuPageId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-200 hover:text-slate-900 transition"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Toggled visibility for ${page.title}`);
                                setActiveContextMenuPageId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-200 hover:text-amber-400 transition"
                            >
                              <EyeOff className="h-3 w-3" />
                              <span>Hide</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete page ${page.title}?`)) alert(`Deleted page ${page.title}`);
                                setActiveContextMenuPageId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-red-400 hover:bg-red-500/10 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Page Button */}
              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt("Enter new page title:");
                    if (name) alert(`Adding page "${name}"`);
                  }}
                  className="flex h-[40px] w-full items-center justify-center gap-1.5 rounded-[10px] border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600 transition-colors hover:border-white hover:bg-white hover:text-black group"
                >
                  <Plus className="h-3.5 w-3.5 text-slate-400 group-hover:text-black transition-colors" />
                  <span>Add Page</span>
                </button>
              </div>
            </motion.aside>
          )}

          {/* Panel 2: Design & Theme Panel (Palettes & Fonts) */}
          {activePanel === "design" && (
            <DesignThemePanel
              key="design-panel"
              activePalette={livePalette}
              activeFonts={liveFonts}
              onSelectPalette={(palette) => setLivePalette(palette)}
              onSelectFonts={(fonts) => setLiveFonts(fonts)}
              onClose={() => setActivePanel(null)}
            />
          )}

          {/* Panel 3: Assets & Media Library Panel (Images, Videos, Logos, Buttons, Docs) */}
          {activePanel === "assets" && (
            <AssetsMediaPanel
              key="assets-panel"
              onClose={() => setActivePanel(null)}
            />
          )}
        </AnimatePresence>

        {/* ─── 3. RIGHT WORKSPACE (WEBSITE CANVAS WITH REAL-TIME THEME) ─── */}
        <main className="relative z-0 flex flex-1 flex-col overflow-hidden bg-white">

          {actionError && (
            <p className="bg-red-500/10 border-b border-red-500/20 px-5 py-2 text-xs font-medium text-red-400">
              {actionError}
            </p>
          )}

          {/* Canvas Live Preview Container (Applies Live Theme Styles & Google Fonts) */}
          <div className="relative flex-1 overflow-y-auto bg-white p-5 flex justify-center items-start">
            <motion.div
              layout
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={buildThemeStyle(livePalette, liveFonts)}
              className={cn(
                "w-full overflow-hidden rounded-2xl border border-slate-200 bg-[var(--site-bg)] text-[var(--site-dark)] font-[family-name:var(--site-body-font)] shadow-2xl transition-all duration-300 min-h-[calc(100vh-7rem)]",
                deviceMode === "desktop" && "max-w-6xl",
                deviceMode === "tablet" && "max-w-[768px]",
                deviceMode === "mobile" && "max-w-[390px] rounded-[36px] border-4 border-slate-300 shadow-2xl overflow-x-hidden"
              )}
            >
              {sections.length > 0 ? (
                children
              ) : (
                <EmptyPage pageTitle={currentPage.title} />
              )}
            </motion.div>
          </div>
        </main>

        {/* Floating Section Edit Popup */}
        <AnimatePresence>
          {selectedSection && selectedSectionAnchor && (
            <SectionEditPopup
              key={selectedSection.id}
              section={selectedSection}
              anchor={selectedSectionAnchor}
              onClose={() => {
                setSelectedSectionId(null);
                setSelectedSectionAnchor(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </EditorContextProvider>
  );
}

function EmptyPage({ pageTitle }: { pageTitle: string }) {
  return (
    <div className="px-6 py-24 text-center text-neutral-800">
      <p className="text-sm font-semibold">
        {pageTitle} has no sections yet
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Add a section below to build this page.
      </p>
      <div className="mt-6 flex justify-center">
        <AddSectionMenu afterOrder={0} />
      </div>
    </div>
  );
}
