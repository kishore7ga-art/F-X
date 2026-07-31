"use client";

import Link from "next/link";
import { useState, useTransition, useMemo, useRef, type ReactNode } from "react";
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
  ArrowLeftRight,
  Palette,
  FolderOpen,
  Settings,
  X,
  LogOut,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { SaveStatusButton } from "@/components/editor/SaveStatusButton";
import { BrandSystemModal } from "@/components/editor/BrandSystemModal";

import { AddSectionMenu } from "@/components/editor/AddSectionMenu";

const DESKTOP_RESOLUTIONS = [1200, 1440, 1920] as const;
const TABLET_RESOLUTIONS = [768, 834, 1024] as const;
const MOBILE_RESOLUTIONS = [390, 414, 360] as const;
import { UnifiedSettingsPanel } from "@/components/editor/UnifiedSettingsPanel";
import { AssetsMediaPanel } from "@/components/editor/AssetsMediaPanel";
import { DesignThemePanel } from "@/components/editor/DesignThemePanel";
import { EditorContextProvider, type SectionStyleOverride } from "@/components/editor/EditorContext";
import { PublishToggle } from "@/components/editor/PublishToggle";
import { SectionEditPopup } from "@/components/editor/SectionEditPopup";
import type { EditorPageData } from "@/lib/editor/queries";
import type { PaletteColors, FontPack } from "@/lib/theme/theme";
import { buildThemeStyle, googleFontsHref } from "@/lib/theme/theme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useMotionValue } from "motion/react";

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

import {
  cycleSectionVariant,
  deleteSection,
  duplicateSection,
  moveSection,
} from "@/app/actions/sections";

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
  const [desktopResIdx, setDesktopResIdx] = useState(0);
  const [tabletResIdx, setTabletResIdx] = useState(0);
  const [mobileResIdx, setMobileResIdx] = useState(0);

  const canvasScrollRef = useRef<HTMLDivElement>(null);

  const currentDesktopRes = DESKTOP_RESOLUTIONS[desktopResIdx];
  const currentTabletRes = TABLET_RESOLUTIONS[tabletResIdx];
  const currentMobileRes = MOBILE_RESOLUTIONS[mobileResIdx];
  const [dockPosition, setDockPosition] = useState<"bottom" | "top" | "left" | "right">("bottom");
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const handleDockDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } }
  ) => {
    dragX.set(0);
    dragY.set(0);

    const { x, y } = info.point;
    const screenW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

    const leftThreshold = screenW * 0.18;
    const rightThreshold = screenW * 0.82;
    const topThreshold = screenH * 0.18;

    if (x < leftThreshold) {
      setDockPosition("left");
    } else if (x > rightThreshold) {
      setDockPosition("right");
    } else if (y < topThreshold) {
      setDockPosition("top");
    } else {
      setDockPosition("bottom");
    }
  };

  const isVerticalDock = dockPosition === "left" || dockPosition === "right";

  const dockPosClass =
    dockPosition === "top"
      ? "fixed top-6 left-1/2 -translate-x-1/2 flex flex-row items-center w-max max-w-[95vw] whitespace-nowrap gap-2"
      : dockPosition === "left"
      ? "fixed left-6 top-1/2 -translate-y-1/2 flex flex-col items-center h-max max-h-[90vh] gap-2"
      : dockPosition === "right"
      ? "fixed right-6 top-1/2 -translate-y-1/2 flex flex-col items-center h-max max-h-[90vh] gap-2"
      : "fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-row items-center w-max max-w-[95vw] whitespace-nowrap gap-2";

  const tooltipPosClass =
    dockPosition === "top"
      ? "top-full mt-3 left-1/2 -translate-x-1/2"
      : dockPosition === "left"
      ? "left-full ml-3 top-1/2 -translate-y-1/2"
      : dockPosition === "right"
      ? "right-full mr-3 top-1/2 -translate-y-1/2"
      : "bottom-full mb-3 left-1/2 -translate-x-1/2";

  const tooltipArrowClass =
    dockPosition === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900"
      : dockPosition === "left"
      ? "right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"
      : dockPosition === "right"
      ? "left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900"
      : "top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900";

  const pipeClass = isVerticalDock
    ? "w-4 h-[1.5px] bg-slate-400/90 mx-auto my-1 shrink-0 rounded-full"
    : "h-5 w-[1.5px] bg-slate-400/90 my-auto mx-1 shrink-0 rounded-full";

  const segmentClass = isVerticalDock
    ? "flex flex-col items-center gap-0.5 rounded-full bg-slate-100/70 p-0.5"
    : "flex items-center gap-0.5 rounded-full bg-slate-100/70 p-0.5";

  const [activePanel, setActivePanel] = useState<"settings" | "pages" | "design" | "assets" | null>(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

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
        <AnimatePresence>
          {activePanel && (
            <UnifiedSettingsPanel
              key="unified-settings-panel"
              college={college}
              pages={pages}
              currentPage={currentPage}
              filteredPages={filteredPages}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeContextMenuPageId={activeContextMenuPageId}
              setActiveContextMenuPageId={setActiveContextMenuPageId}
              currentPalette={livePalette}
              onSelectPalette={setLivePalette}
              currentFonts={liveFonts}
              onSelectFonts={setLiveFonts}
              onClose={() => setActivePanel(null)}
              initialTab={activePanel === "design" ? "colors" : "pages"}
            />
          )}

          {activePanel !== null && (
            <motion.div
              key="black-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActivePanel(null)}
              className="absolute inset-0 z-30 bg-black/70 cursor-pointer"
            />
          )}
        </AnimatePresence>

        <main className="relative z-0 flex flex-1 flex-col overflow-hidden bg-white">

          {actionError && (
            <p className="bg-red-500/10 border-b border-red-500/20 px-5 py-2 text-xs font-medium text-red-400">
              {actionError}
            </p>
          )}

          <div
            ref={canvasScrollRef}
            className="flex-1 overflow-y-auto overscroll-contain bg-white text-slate-900 transition-colors duration-300"
          >
            <motion.div
              layout
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                ...buildThemeStyle(livePalette, liveFonts),
                maxWidth:
                  deviceMode === "desktop"
                    ? `${currentDesktopRes}px`
                    : deviceMode === "tablet"
                    ? `${currentTabletRes}px`
                    : `${currentMobileRes}px`,
                margin: "0 auto",
              }}
              className="w-full rounded-none border-0 shadow-none bg-[var(--site-bg)] text-[var(--site-dark)] font-[family-name:var(--site-body-font)] transition-all duration-300 min-h-screen"
            >
              {sections.length > 0 ? (
                children
              ) : (
                <EmptyPage pageTitle={currentPage.title} />
              )}
            </motion.div>
          </div>

          {/* Floating Edge-Snapping Draggable Viewport, History, Panels & Section Controls Toast Dock */}
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0}
            style={{ x: dragX, y: dragY }}
            onDragEnd={handleDockDragEnd}
            className={cn(
              "z-40 border border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-[0_20px_45px_-8px_rgba(0,0,0,0.18),0_8px_16px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/5 hover:shadow-[0_25px_55px_-8px_rgba(0,0,0,0.24)] select-none transition-all duration-100 ease-out",
              isVerticalDock ? "rounded-full px-2 py-3" : "rounded-full px-3 py-1.5",
              dockPosClass
            )}
          >

            {/* SEGMENT 1: BRAND / SYSTEM MENU TRIGGER */}
            <div className="group relative flex items-center">
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span>X</span>
              </button>
              <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                System &amp; Brand Settings (Domains, Team, Subscription)
                <span className={cn("absolute", tooltipArrowClass)} />
              </div>
            </div>

            <div className={pipeClass} />

            {/* SEGMENT 2: CORE ACTIONS (1. SITE SETTINGS & DESIGN, 2. SAVE, 3. PUBLISH, 4. PREVIEW) */}
            <div className={segmentClass}>
              {/* 1. SITE SETTINGS & DESIGN (Pages, Layers, Theme, Fonts, Assets) */}
              <div className="group relative flex items-center">
                <button
                  type="button"
                  onClick={() => setActivePanel((prev) => (prev ? null : "settings"))}
                  aria-label="Site Settings & Design"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 cursor-pointer",
                    activePanel !== null
                      ? "bg-slate-900 text-white shadow-xs font-bold"
                      : "text-slate-700 hover:bg-slate-200/80 hover:text-black"
                  )}
                >
                  <Sliders className="h-4 w-4" strokeWidth={2.2} />
                </button>
                <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                  Site Settings &amp; Design (Pages, Layers, Theme, Fonts)
                  <span className={cn("absolute", tooltipArrowClass)} />
                </div>
              </div>

              {/* 3. SAVE */}
              <SaveStatusButton />

              {/* 4. PUBLISH */}
              <PublishToggle collegeId={college.id} subdomain={college.subdomain} status={college.status} compact={true} />

              {/* 5. PREVIEW */}
              <div className="group relative flex items-center">
                <Link
                  href={`/site/${college.subdomain}`}
                  target="_blank"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/80 hover:text-black transition-all cursor-pointer"
                >
                  <Eye className="h-4 w-4" strokeWidth={2.2} />
                </Link>
                <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                  Preview Site
                  <span className={cn("absolute", tooltipArrowClass)} />
                </div>
              </div>
            </div>

            {/* PIPE SEPARATOR AFTER PREVIEW */}
            <div className={pipeClass} />

            {/* SEGMENT 3: ACTIVE SECTION CONTROLS (Conditional) */}
            {selectedSection && (
              <>
                <div className={segmentClass}>
                  {!isVerticalDock && (
                    <div className="flex items-center px-2">
                      <span className="text-xs font-semibold text-slate-800 tracking-tight whitespace-nowrap">
                        {selectedSection.label}
                      </span>
                    </div>
                  )}

                  {/* Duplicate Section */}
                  <div className="group relative flex items-center">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        run(() => duplicateSection({ collegeSectionId: selectedSection.id }));
                      }}
                      aria-label="Duplicate Section"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/80 hover:text-black transition-all cursor-pointer"
                    >
                      <Copy className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                    <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                      Duplicate Section
                      <span className={cn("absolute", tooltipArrowClass)} />
                    </div>
                  </div>

                  {/* Section Contextual Undo */}
                  <div className="group relative flex items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        undo();
                      }}
                      aria-label="Undo Section Change"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/80 hover:text-black transition-all cursor-pointer"
                    >
                      <Undo2 className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                    <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                      Undo Change
                      <span className={cn("absolute", tooltipArrowClass)} />
                    </div>
                  </div>

                  {/* Swap Design Variant (Between Undo & Redo) */}
                  {selectedSection.variants.length > 1 && (
                    <div className="group relative flex items-center">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          run(() => cycleSectionVariant({ collegeSectionId: selectedSection.id }));
                        }}
                        aria-label="Swap Design Variant"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/80 hover:text-black transition-all cursor-pointer"
                      >
                        <RefreshCw className="h-4 w-4" strokeWidth={2.2} />
                      </button>
                      <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                        Swap Design Layout
                        <span className={cn("absolute", tooltipArrowClass)} />
                      </div>
                    </div>
                  )}

                  {/* Section Contextual Redo */}
                  <div className="group relative flex items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        redo();
                      }}
                      aria-label="Redo Section Change"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/80 hover:text-black transition-all cursor-pointer"
                    >
                      <Redo2 className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                    <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                      Redo Change
                      <span className={cn("absolute", tooltipArrowClass)} />
                    </div>
                  </div>

                  {/* Move Section Up */}
                  <div className="group relative flex items-center">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        run(() => moveSection({ collegeSectionId: selectedSection.id, direction: "up" }));
                      }}
                      aria-label="Move Section Up"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/80 hover:text-black transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                    <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                      Move Up
                      <span className={cn("absolute", tooltipArrowClass)} />
                    </div>
                  </div>

                  {/* Move Section Down */}
                  <div className="group relative flex items-center">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        run(() => moveSection({ collegeSectionId: selectedSection.id, direction: "down" }));
                      }}
                      aria-label="Move Section Down"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/80 hover:text-black transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ArrowDown className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                    <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                      Move Down
                      <span className={cn("absolute", tooltipArrowClass)} />
                    </div>
                  </div>

                  {/* Delete Section */}
                  <div className="group relative flex items-center">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete section "${selectedSection.label}"?`)) {
                          run(() => deleteSection({ collegeSectionId: selectedSection.id }));
                          setSelectedSectionId(null);
                        }
                      }}
                      aria-label="Delete Section"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/80 hover:text-red-600 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                    <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                      Delete Section
                      <span className={cn("absolute", tooltipArrowClass)} />
                    </div>
                  </div>

                  {/* Close Controls */}
                  <div className="group relative flex items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedSectionId(null)}
                      aria-label="Close Controls"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/80 hover:text-black transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                    <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                      Close Controls
                      <span className={cn("absolute", tooltipArrowClass)} />
                    </div>
                  </div>
                </div>

                {/* PIPE SEPARATOR AFTER CLOSE */}
                <div className={pipeClass} />
              </>
            )}

            {/* SEGMENT 4: VIEWPORT RESOLUTIONS */}
            <div className={segmentClass}>
              <div className="group relative flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (deviceMode !== "desktop") {
                      setDeviceMode("desktop");
                    } else {
                      setDesktopResIdx((prev) => (prev + 1) % DESKTOP_RESOLUTIONS.length);
                    }
                  }}
                  aria-label={`Desktop View (${currentDesktopRes}px)`}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium tracking-tight transition-all cursor-pointer",
                    deviceMode === "desktop"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-700 hover:bg-slate-200/80 hover:text-black"
                  )}
                >
                  <Monitor className="h-4 w-4" strokeWidth={2.2} />
                  {deviceMode === "desktop" && !isVerticalDock && <span>{currentDesktopRes}px</span>}
                </button>
                <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                  Desktop View ({currentDesktopRes}px)
                  <span className={cn("absolute", tooltipArrowClass)} />
                </div>
              </div>

              <div className="group relative flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (deviceMode !== "tablet") {
                      setDeviceMode("tablet");
                    } else {
                      setTabletResIdx((prev) => (prev + 1) % TABLET_RESOLUTIONS.length);
                    }
                  }}
                  aria-label={`Tablet View (${currentTabletRes}px)`}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium tracking-tight transition-all cursor-pointer",
                    deviceMode === "tablet"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-700 hover:bg-slate-200/80 hover:text-black"
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M19 12h.01" strokeWidth="3" />
                  </svg>
                  {deviceMode === "tablet" && !isVerticalDock && <span>{currentTabletRes}px</span>}
                </button>
                <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                  Tablet View ({currentTabletRes}px)
                  <span className={cn("absolute", tooltipArrowClass)} />
                </div>
              </div>

              <div className="group relative flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (deviceMode !== "mobile") {
                      setDeviceMode("mobile");
                    } else {
                      setMobileResIdx((prev) => (prev + 1) % MOBILE_RESOLUTIONS.length);
                    }
                  }}
                  aria-label={`Mobile View (${currentMobileRes}px)`}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium tracking-tight transition-all cursor-pointer",
                    deviceMode === "mobile"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-700 hover:bg-slate-200/80 hover:text-black"
                  )}
                >
                  <Smartphone className="h-4 w-4" strokeWidth={2.2} />
                  {deviceMode === "mobile" && !isVerticalDock && <span>{currentMobileRes}px</span>}
                </button>
                <div className={cn("pointer-events-none absolute hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50", tooltipPosClass)}>
                  Mobile View ({currentMobileRes}px)
                  <span className={cn("absolute", tooltipArrowClass)} />
                </div>
              </div>
            </div>

          </motion.div>
        </main>

        <AnimatePresence>
          {isBrandModalOpen && (
            <BrandSystemModal
              college={college}
              canSignOut={canSignOut}
              onClose={() => setIsBrandModalOpen(false)}
            />
          )}

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
