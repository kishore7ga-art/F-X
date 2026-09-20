"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Sparkles,
  ExternalLink,
  Globe,
  AlertCircle,
  Loader2,
  ChevronDown,
  Check,
  FileText,
  Search,
} from "lucide-react";
import { useViewport } from "@/hooks/useViewport";
import { ResponsiveCanvas } from "@/components/preview/ResponsiveCanvas";
import { sectionCanvasHtml } from "@/lib/section-runtime";
import { useSectionRuntime } from "@/hooks/useSectionRuntime";
import { canApplyHeaderOverlay } from "@/lib/sections/section-edit";
import { resolveCategory } from "@/lib/sections/categories";
import { attachInteractiveSectionListeners } from "@/lib/interactive-section-runtime";
import { ViewportControl } from "./ViewportControl";
import {
  themeFontsHref,
  tokenizeSectionHtml,
} from "@/lib/editor-themes";
import {
  fetchWebsite,
  fetchDefaultWebsite,
  fetchTheme,
  requestSwapSection,
  pollJobStatus,
  type EditorPage,
  type EditorSection,
} from "@/lib/editor-api";
import { DomainSettingsModal } from "./DomainSettingsModal";
import { UserProfileMenu } from "./UserProfileMenu";

interface EditorStudioProps {
  subdomain?: string;
  collegeName?: string;
}

interface SectionJobState {
  status: "idle" | "generating" | "error";
  jobId?: string;
  errorMessage?: string;
  isBudgetExceeded?: boolean;
  startTime?: number;
  highlight?: boolean;
}

function formatPageTitle(title?: string, slug?: string): string {
  const raw = (title || slug || "Page").trim();
  return raw
    .replace(/[-_]/g, " ")
    .replace(/\band\b/gi, "&")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function EditorStudio({
  subdomain = "greenfield",
  collegeName = "Greenfield University",
}: EditorStudioProps) {
  const [viewport, setViewport, catalogue] = useViewport();
  const [canvasScale, setCanvasScale] = useState<number>(1);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [showPageMenu, setShowPageMenu] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState("");
  const pageMenuRef = useRef<HTMLDivElement>(null);
  const [themeSelection, setThemeSelection] = useState<{ themeId: string | null; fontId: string | null }>({
    themeId: null,
    fontId: null,
  });
  const [loading, setLoading] = useState(true);
  const [showDomainSettings, setShowDomainSettings] = useState(false);

  // Close page menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pageMenuRef.current && !pageMenuRef.current.contains(event.target as Node)) {
        setShowPageMenu(false);
      }
    }
    if (showPageMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPageMenu]);

  // Per-section swap generation state (supports concurrent jobs across sections)
  const [sectionStates, setSectionStates] = useState<Record<string, SectionJobState>>({});

  // Active poll intervals per sectionId to allow cleanup on unmount or cancellation
  const activePollTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Cleanup all polling timers when EditorStudio unmounts
  useEffect(() => {
    return () => {
      activePollTimers.current.forEach((timer) => clearInterval(timer));
      activePollTimers.current.clear();
    };
  }, []);

  // Active timers for rotating status messages on generating sections
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load Google Fonts once
  useEffect(() => {
    const id = "xite-editor-theme-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = themeFontsHref();
  }, []);

  // Initial load: fetch website configuration and theme, falling back to default website template
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let [websitePages, theme] = await Promise.all([
        fetchWebsite().catch(() => []),
        fetchTheme().catch(() => ({ themeId: null, fontId: null })),
      ]);

      // Fallback: If this tenant has no saved sections yet, fetch default template so sections always appear
      if (!websitePages || websitePages.length === 0 || !websitePages[0]?.sections?.length) {
        const defaultPages = await fetchDefaultWebsite().catch(() => []);
        if (defaultPages && defaultPages.length > 0) {
          websitePages = defaultPages;
        }
      }

      setPages(websitePages);
      setThemeSelection(theme);
    } catch (err) {
      console.error("Failed to load website config:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activePage = pages[activePageIndex] || pages[0] || null;
  const sections = activePage?.sections || [];

  // ─── Section Runtime CSS injection (ensures container queries and styles render correctly) ───
  useSectionRuntime({
    sections,
    scope: ".xite-site-canvas",
    simulatedWidth: `${viewport.width}px`,
    fillViewport: false,
  });

  // ─── Continuous Section Interactive Listeners (Track dragging, accordions, tabs, etc.) ───
  useEffect(() => {
    return attachInteractiveSectionListeners();
  }, []);

  // ─── Section Video Autoplay ─────────────────────────────────────────────
  useEffect(() => {
    const playVideos = () => {
      document.querySelectorAll<HTMLVideoElement>(".xite-site-canvas video").forEach((v) => {
        v.muted = true;
        v.defaultMuted = true;
        v.playsInline = true;
        v.setAttribute("muted", "");
        v.setAttribute("autoplay", "");
        v.setAttribute("loop", "");
        v.setAttribute("playsinline", "");
        v.setAttribute("webkit-playsinline", "");
        if (v.paused) {
          v.play().catch(() => {});
        }
      });
    };
    playVideos();
    const timer = setTimeout(playVideos, 200);
    return () => clearTimeout(timer);
  }, [sections]);

  // ─── Hamburger Drawer Toggles for Mobile/Tablet ──────────────────────────
  useEffect(() => {
    const attachHamburger = () => {
      document.querySelectorAll<HTMLElement>(".hamburger-toggle-btn").forEach((btn) => {
        if (btn.dataset.xiteHamburgerBound) return;
        btn.dataset.xiteHamburgerBound = "1";
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const header = btn.closest("header");
          const menu = header?.querySelector(".mobile-drawer-menu");
          if (menu) {
            menu.classList.toggle("active");
          }
        });
      });
    };
    attachHamburger();
    const timer = setTimeout(attachHamburger, 300);
    return () => clearTimeout(timer);
  }, [sections]);

  // ─── Swap Trigger Handler (Live AI Generation) ───────────────────────────
  const handleSwapSection = useCallback(async (sectionId: string) => {
    const existingTimer = activePollTimers.current.get(sectionId);
    if (existingTimer) {
      clearInterval(existingTimer);
      activePollTimers.current.delete(sectionId);
    }

    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: {
        status: "generating",
        startTime: Date.now(),
      },
    }));

    try {
      const { jobId } = await requestSwapSection(sectionId);

      setSectionStates((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          jobId,
        },
      }));

      let attempts = 0;
      let consecutiveErrors = 0;
      const MAX_ATTEMPTS = 90; // 180 seconds max
      const MAX_CONSECUTIVE_ERRORS = 10;

      const pollInterval = setInterval(async () => {
        attempts += 1;
        if (attempts > MAX_ATTEMPTS) {
          clearInterval(pollInterval);
          activePollTimers.current.delete(sectionId);
          setSectionStates((prev) => ({
            ...prev,
            [sectionId]: {
              status: "error",
              errorMessage: "Section regeneration timed out. Please try again.",
            },
          }));
          return;
        }

        try {
          const statusResp = await pollJobStatus(jobId);
          consecutiveErrors = 0;

          if (statusResp.status === "complete") {
            clearInterval(pollInterval);
            activePollTimers.current.delete(sectionId);

            if (statusResp.result && statusResp.result.code) {
              setPages((prevPages) =>
                prevPages.map((page, pIdx) => {
                  if (pIdx !== activePageIndex) return page;
                  return {
                    ...page,
                    sections: page.sections.map((sec) =>
                      sec.id === sectionId
                        ? {
                            ...sec,
                            title: statusResp.result.title || sec.title,
                            category: statusResp.result.category || sec.category,
                            code: statusResp.result.code,
                            variantIndex: (sec.variantIndex || 0) + 1,
                          }
                        : sec
                    ),
                  };
                })
              );
            } else {
              void loadData();
            }

            setSectionStates((prev) => ({
              ...prev,
              [sectionId]: {
                status: "idle",
                highlight: true,
              },
            }));

            setTimeout(() => {
              setSectionStates((prev) => ({
                ...prev,
                [sectionId]: {
                  ...prev[sectionId],
                  highlight: false,
                },
              }));
            }, 600);
          } else if (statusResp.status === "failed") {
            clearInterval(pollInterval);
            activePollTimers.current.delete(sectionId);
            const isBudget = statusResp.error?.code === "BUDGET_EXCEEDED";
            setSectionStates((prev) => ({
              ...prev,
              [sectionId]: {
                status: "error",
                isBudgetExceeded: isBudget,
                errorMessage: isBudget
                  ? "Generation limit reached — contact your administrator"
                  : statusResp.error?.message || "Something went wrong — try again",
              },
            }));
          }
        } catch (err: any) {
          consecutiveErrors += 1;
          console.warn(`Polling error for swap job ${jobId} (attempt ${attempts}):`, err);
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            clearInterval(pollInterval);
            activePollTimers.current.delete(sectionId);
            setSectionStates((prev) => ({
              ...prev,
              [sectionId]: {
                status: "error",
                errorMessage: "Lost connection while checking regeneration status. Please refresh.",
              },
            }));
          }
        }
      }, 2000);

      activePollTimers.current.set(sectionId, pollInterval);
    } catch (err: any) {
      const isBudget = err?.status === 402 || err?.message?.includes("BUDGET_EXCEEDED");
      setSectionStates((prev) => ({
        ...prev,
        [sectionId]: {
          status: "error",
          isBudgetExceeded: isBudget,
          errorMessage: isBudget
            ? "Generation limit reached — contact your administrator"
            : err?.message || "Failed to start section regeneration. Try again.",
        },
      }));
    }
  }, [activePageIndex, loadData]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* ─── Top Studio Header Bar ─────────────────────────────────────── */}
      <header className="h-14 shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-40">
        {/* Left: Branding & Subdomain */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/25 ring-1 ring-white/20">
            X
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{collegeName}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                <span>AI Studio</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Smart Responsive Page Switcher */}
        {pages.length > 1 && (
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shadow-inner max-w-full">
            {(() => {
              const MAX_VISIBLE = 4;
              const isLongList = pages.length > MAX_VISIBLE;
              const visiblePages = isLongList
                ? activePageIndex >= MAX_VISIBLE
                  ? [pages[0], pages[activePageIndex]]
                  : pages.slice(0, 3)
                : pages;

              const filteredPages = pages.filter((p) =>
                formatPageTitle(p.title, p.slug).toLowerCase().includes(pageSearchQuery.toLowerCase())
              );

              return (
                <>
                  {visiblePages.map((p) => {
                    const originalIdx = pages.findIndex((item) => item.id === p.id);
                    const isActive = activePageIndex === originalIdx;
                    return (
                      <button
                        key={p.id || originalIdx}
                        type="button"
                        onClick={() => setActivePageIndex(originalIdx)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                        }`}
                      >
                        {formatPageTitle(p.title, p.slug)}
                      </button>
                    );
                  })}

                  {isLongList && (
                    <div ref={pageMenuRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPageMenu(!showPageMenu)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          activePageIndex >= MAX_VISIBLE
                            ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                        }`}
                      >
                        <span>+{pages.length - visiblePages.length} more</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showPageMenu ? "rotate-180" : ""}`} />
                      </button>

                      {showPageMenu && (
                        <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-64 max-h-80 overflow-hidden flex flex-col rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl p-1.5 z-50 text-slate-200 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                          <div className="p-2 border-b border-slate-800/80">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Website Pages ({pages.length})
                            </div>
                            {pages.length > 6 && (
                              <div className="relative">
                                <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={pageSearchQuery}
                                  onChange={(e) => setPageSearchQuery(e.target.value)}
                                  placeholder="Search pages..."
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                            )}
                          </div>

                          <div className="overflow-y-auto py-1 max-h-56 space-y-0.5">
                            {filteredPages.map((p) => {
                              const originalIdx = pages.findIndex((item) => item.id === p.id);
                              const isActive = activePageIndex === originalIdx;
                              return (
                                <button
                                  key={p.id || originalIdx}
                                  type="button"
                                  onClick={() => {
                                    setActivePageIndex(originalIdx);
                                    setShowPageMenu(false);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                                    isActive
                                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                    <span className="truncate">{formatPageTitle(p.title, p.slug)}</span>
                                  </div>
                                  {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Right: Domain Settings & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowDomainSettings(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
            title="Custom Domain Settings"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <a
            href={`/site/${encodeURIComponent(subdomain)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition cursor-pointer"
            title="Open Live Website in New Tab"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <UserProfileMenu collegeName={collegeName} />
        </div>
      </header>

      {/* ─── Studio Workbench Canvas Area ──────────────────────────────── */}
      <main className="flex-1 w-full min-h-0 relative overflow-y-auto bg-slate-100 py-8 px-4 sm:px-8 pb-32 flex flex-col items-center justify-start [background-image:radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:24px_24px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500 my-auto">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Loading website canvas...</span>
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center max-w-md mx-auto p-6 bg-white rounded-2xl border border-slate-200 shadow-sm my-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No Website Generated Yet</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your college does not have an AI-generated website yet. Complete onboarding to generate your site.
            </p>
            <a
              href="/onboarding"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
            >
              Start AI Generation
            </a>
          </div>
        ) : (
          <ResponsiveCanvas
            viewport={viewport}
            themeId={themeSelection.themeId}
            fontId={themeSelection.fontId}
            onScaleChange={setCanvasScale}
            chromeClassName="shadow-[0_25px_70px_rgba(15,23,42,0.14),0_10px_25px_rgba(15,23,42,0.06),0_0_0_1px_rgba(15,23,42,0.06)] bg-white rounded-2xl overflow-hidden"
            canvasClassName="xite-site-canvas min-h-[75vh] bg-white text-slate-900"
          >
            <div className="w-full flex flex-col relative bg-white">
              {sections.map((sec, idx) => {
                const isHeader =
                  (sec as any).category === "navbar" ||
                  resolveCategory({
                    category: (sec as any).category,
                    title: sec.title,
                    code: sec.code,
                  }) === "navbar";
                const isOverlaid = isHeader && canApplyHeaderOverlay(sections, idx);

                const secState = sectionStates[sec.id] || { status: "idle" };
                const isGenerating = secState.status === "generating";
                const isError = secState.status === "error";
                const isHighlighted = Boolean(secState.highlight);

                const elapsedSec = secState.startTime ? Math.floor((now - secState.startTime) / 1000) : 0;
                const statusMessage =
                  elapsedSec < 15
                    ? "Generating a new version…"
                    : "Still working — this can take up to a couple of minutes…";

                const htmlMarkup = tokenizeSectionHtml(sectionCanvasHtml(sec.code, sec.id));

                return (
                  <div
                    key={sec.id}
                    data-xite-section-id={sec.id}
                    style={{
                      ...(isOverlaid
                        ? {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            width: "100%",
                            zIndex: 100,
                            backgroundColor: "transparent",
                            overflow: "visible",
                          }
                        : isHeader
                        ? {
                            zIndex: 90,
                            position: "relative",
                            overflow: "visible",
                          }
                        : {
                            position: "relative",
                            zIndex: 10,
                          }),
                    }}
                    className={`w-full relative transition-all group section-wrapper-container hover:ring-1 hover:ring-blue-500/30 ${
                      isOverlaid
                        ? "[&_.section-canvas-box]:!bg-transparent [&_.section-canvas-box>header]:!bg-transparent [&_.section-canvas-box>nav]:!bg-transparent [&_.section-canvas-box>div]:!bg-transparent"
                        : ""
                    } ${isHighlighted ? "ring-4 ring-blue-500 ring-offset-2 z-20" : ""}`}
                  >
                    {/* Hover Floating AI Swap Action Button */}
                    <div className="absolute top-4 right-4 z-30 transition-all opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-events-auto">
                      <button
                        type="button"
                        disabled={isGenerating}
                        onClick={() => void handleSwapSection(sec.id)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xl transition-all transform hover:scale-105 active:scale-95 border backdrop-blur-md cursor-pointer ${
                          isGenerating
                            ? "bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed"
                            : "bg-slate-900/90 hover:bg-slate-900 text-white border-slate-700/80 hover:border-blue-500/60 shadow-black/20"
                        }`}
                        title="AI Regenerate Section"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                        )}
                        <span>Swap Section</span>
                      </button>
                    </div>

                    {/* Inline Section Error Banner */}
                    {isError && (
                      <div className="absolute top-3 left-3 right-20 z-30 flex items-center justify-between p-3 rounded-xl bg-rose-950/90 border border-rose-700/80 text-rose-100 shadow-xl backdrop-blur-md animate-in fade-in">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{secState.errorMessage || "Generation failed."}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleSwapSection(sec.id)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-700 hover:bg-rose-600 text-white transition ml-2 shrink-0"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Section HTML Rendered with DOM Parity Guarantee */}
                    <div
                      dangerouslySetInnerHTML={{ __html: htmlMarkup }}
                      style={{ display: "contents" }}
                    />

                    {/* Section Loading Shimmer Overlay */}
                    {isGenerating && (
                      <div className="absolute inset-0 z-25 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl text-white max-w-sm">
                          <div className="relative flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                            <Sparkles className="w-4 h-4 text-blue-400 absolute animate-pulse" />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-bold block text-white">{statusMessage}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              {elapsedSec}s elapsed • Regenerating university layout
                            </span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-pulse w-full" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ResponsiveCanvas>
        )}
      </main>

      {/* ─── Centered Floating Responsive Dock (Dynamic Island Style) ─── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white backdrop-blur-2xl border border-slate-700/60 p-1.5 px-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.08)] flex items-center justify-center gap-2 select-none transition-all duration-200">
        <ViewportControl
          viewport={viewport}
          catalogue={catalogue}
          onChange={setViewport}
          scale={canvasScale}
          orientation="horizontal"
          variant="dark"
        />

        <div className="h-4 w-px bg-slate-700/80 shrink-0 mx-1" />

        <a
          href={`/site/${encodeURIComponent(subdomain)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 h-7 px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-full shadow-md shadow-blue-500/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer no-underline shrink-0"
          title="Open Live Website in New Tab"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span>Live Site</span>
        </a>
      </div>

      {/* Domain Settings Modal */}
      <DomainSettingsModal
        isOpen={showDomainSettings}
        onClose={() => setShowDomainSettings(false)}
        subdomain={subdomain}
      />
    </div>
  );
}
