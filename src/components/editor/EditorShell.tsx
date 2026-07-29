"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
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
  Menu,
  X,
  RefreshCw,
  LogOut,
  Settings,
  Sparkles,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { logout } from "@/app/actions/auth";
import { cycleTemplate } from "@/app/actions/design";
import { AddSectionMenu } from "@/components/editor/AddSectionMenu";
import { EditorContextProvider, type SectionStyleOverride } from "@/components/editor/EditorContext";
import { PageToolsPanel } from "@/components/editor/PageToolsPanel";
import { PublishToggle } from "@/components/editor/PublishToggle";
import { RightPropertyPanel } from "@/components/editor/RightPropertyPanel";
import type { EditorPageData, EditorSection } from "@/lib/editor/queries";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const PAGE_ICONS: Record<string, ReactNode> = {
  home: <Home className="h-[18px] w-[18px]" />,
  about: <Info className="h-[18px] w-[18px]" />,
  academics: <Layers className="h-[18px] w-[18px]" />,
  events: <Calendar className="h-[18px] w-[18px]" />,
  contact: <Mail className="h-[18px] w-[18px]" />,
  gallery: <ImageIcon className="h-[18px] w-[18px]" />,
  admissions: <FileText className="h-[18px] w-[18px]" />,
  security: <Shield className="h-[18px] w-[18px]" />,
  settings: <Sliders className="h-[18px] w-[18px]" />,
};

const FALLBACK_ICONS = [
  <Home key="1" className="h-[18px] w-[18px]" />,
  <Info key="2" className="h-[18px] w-[18px]" />,
  <Layers key="3" className="h-[18px] w-[18px]" />,
  <Calendar key="4" className="h-[18px] w-[18px]" />,
  <Mail key="5" className="h-[18px] w-[18px]" />,
  <ImageIcon key="6" className="h-[18px] w-[18px]" />,
  <FileText key="7" className="h-[18px] w-[18px]" />,
];

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
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageToolsOpen, setPageToolsOpen] = useState(false);
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

  const updateSectionContent = (id: string, content: Record<string, unknown>) => {
    setLiveContentMap((prev) => {
      const next = { ...prev, [id]: content };
      // Push state snapshot to history stack
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
        selectSection: (id) => setSelectedSectionId(id),
        canUndo,
        canRedo,
        undo,
        redo,
        isPending,
        run,
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
        {/* ─── 1. LEFT VERTICAL NAVIGATION RAIL (PAGES SWITCHER) ─── */}
        <aside className="z-40 flex w-16 flex-col items-center justify-between border-r border-neutral-800 bg-black py-4">
          <nav className="flex flex-col items-center gap-4" aria-label="Pages Navigation">
            {pages.map((page, index) => {
              const isActive = page.slug === currentPage.slug;
              const icon =
                PAGE_ICONS[page.slug.toLowerCase()] ??
                FALLBACK_ICONS[index % FALLBACK_ICONS.length];

              return (
                <Link
                  key={page.id}
                  href={`/editor/${college.subdomain}?page=${page.slug}`}
                  aria-current={isActive ? "page" : undefined}
                  title={page.title}
                  className={cn(
                    "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200",
                    isActive
                      ? "bg-neutral-800 text-white shadow-lg border border-neutral-700"
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                  )}
                >
                  {isActive && (
                    <span className="absolute -left-1.5 top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-r-md bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}

                  {icon}

                  <span className="absolute left-16 z-50 whitespace-nowrap rounded-md bg-black px-2.5 py-1 text-xs font-semibold text-white shadow-xl opacity-0 transition-opacity pointer-events-none group-hover:opacity-100 border border-neutral-800">
                    {page.title}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              title={`${college.name} Settings`}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-red-400 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {initialLetter}
            </button>
          </div>
        </aside>

        {/* ─── 2. MAIN WORKSPACE AREA ─── */}
        <div className="flex flex-1 flex-col overflow-hidden bg-neutral-900/60">
          {/* TOP TOOLBAR BAR */}
          <header className="z-30 flex h-14 items-center justify-between border-b border-neutral-800 bg-black/80 px-6 backdrop-blur-md">
            {/* Left: Branding & Subdomain */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
                  menuOpen
                    ? "border-blue-500 bg-blue-500/20 text-blue-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800"
                )}
              >
                <Menu className="h-3.5 w-3.5" />
                <span>Menu</span>
              </button>

              <div className="hidden sm:block">
                <h1 className="text-xs font-bold text-white leading-tight">
                  {college.name}
                </h1>
                <p className="text-[10px] text-neutral-400 font-mono">
                  /site/{college.subdomain}
                </p>
              </div>
            </div>

            {/* Center: Undo/Redo & Responsive Device Modes */}
            <div className="flex items-center gap-4">
              {/* Undo / Redo buttons */}
              <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/90 p-1">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  className="rounded-md p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 transition"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                  className="rounded-md p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 transition"
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Responsive Device Viewport Switcher */}
              <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/90 p-1">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  title="Desktop View (Full Width)"
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition",
                    deviceMode === "desktop"
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setDeviceMode("tablet")}
                  title="Tablet View (768px)"
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition",
                    deviceMode === "tablet"
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  <Tablet className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Tablet</span>
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  title="Mobile Phone View (390px)"
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition",
                    deviceMode === "mobile"
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {isPending && (
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                  <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
                  Saving…
                </span>
              )}

              <PublishToggle collegeId={college.id} status={college.status} />

              <Link
                href={`/site/${college.subdomain}`}
                target="_blank"
                className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-black transition hover:bg-neutral-200 shadow-md"
              >
                <span>View site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </header>

          {actionError && (
            <p className="bg-red-500/10 border-b border-red-500/20 px-6 py-2 text-xs font-medium text-red-400">
              {actionError}
            </p>
          )}

          {/* TOP MENU SLIDE-DOWN DRAWER */}
          {menuOpen && (
            <div className="z-30 border-b border-neutral-800 bg-neutral-950 p-5 shadow-2xl backdrop-blur-xl">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPageToolsOpen((open) => !open);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800 hover:text-white"
                  >
                    <Settings className="h-4 w-4 text-neutral-400" />
                    <span>SEO & Page Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => run(() => cycleTemplate())}
                    disabled={!canCycleTemplate || isPending}
                    className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800 hover:text-white disabled:opacity-40"
                  >
                    <RefreshCw className="h-4 w-4 text-blue-400" />
                    <span>Try another template</span>
                  </button>

                  <Link
                    href="/templates"
                    className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800 hover:text-white"
                  >
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Change design</span>
                  </Link>
                </div>

                {canSignOut && (
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* CANVAS CONTAINER */}
          <div className="relative flex-1 overflow-y-auto bg-neutral-900/60 p-6 flex justify-center items-start">
            <motion.div
              layout
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "w-full overflow-hidden rounded-2xl border border-neutral-800 bg-white shadow-2xl transition-all duration-300 min-h-[calc(100vh-8rem)]",
                deviceMode === "desktop" && "max-w-5xl",
                deviceMode === "tablet" && "max-w-[768px]",
                deviceMode === "mobile" && "max-w-[390px] rounded-[40px] border-4 border-neutral-700 shadow-[0_0_60px_rgba(0,0,0,0.9)]"
              )}
            >
              {sections.length > 0 ? (
                children
              ) : (
                <EmptyPage pageTitle={currentPage.title} />
              )}
            </motion.div>
          </div>
        </div>

        {/* ─── 3. RIGHT-SIDE SLIDING PROPERTIES PANEL (440PX) ─── */}
        <AnimatePresence>
          {selectedSection && (
            <RightPropertyPanel
              key={selectedSection.id}
              section={selectedSection}
              onClose={() => setSelectedSectionId(null)}
            />
          )}
        </AnimatePresence>

        {/* Page SEO Panel */}
        {pageToolsOpen && (
          <PageToolsPanel
            key={currentPage.id}
            page={currentPage}
            onClose={() => setPageToolsOpen(false)}
          />
        )}
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
      <p className="mt-1 text-xs text-neutral-500">
        Use the + button on another page, or add one below.
      </p>
      <div className="mt-6 flex justify-center">
        <AddSectionMenu afterOrder={0} />
      </div>
    </div>
  );
}
