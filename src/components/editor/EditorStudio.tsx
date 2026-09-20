"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Sparkles,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Globe,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { useViewport } from "@/hooks/useViewport";
import { switchTier, tierById, ZOOM_LEVELS } from "@/lib/viewport-presets";
import { ResponsiveCanvas } from "@/components/preview/ResponsiveCanvas";
import { sectionCanvasHtml } from "@/lib/section-runtime";
import {
  themeFontsHref,
  themeStylesheet,
  customThemeCss,
  tokenizeSectionHtml,
} from "@/lib/editor-themes";
import {
  fetchWebsite,
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

export function EditorStudio({
  subdomain = "greenfield",
  collegeName = "Greenfield University",
}: EditorStudioProps) {
  const [viewport, setViewport, catalogue] = useViewport();
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [themeSelection, setThemeSelection] = useState<{ themeId: string | null; fontId: string | null }>({
    themeId: null,
    fontId: null,
  });
  const [loading, setLoading] = useState(true);
  const [showDomainSettings, setShowDomainSettings] = useState(false);

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

  // Initial load: fetch website configuration and theme
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [websitePages, theme] = await Promise.all([
        fetchWebsite(),
        fetchTheme().catch(() => ({ themeId: null, fontId: null })),
      ]);
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

  // Swap trigger handler for a single section
  const handleSwapSection = useCallback(async (sectionId: string) => {
    // 0. Clean up any already-active polling interval for this section
    const existingTimer = activePollTimers.current.get(sectionId);
    if (existingTimer) {
      clearInterval(existingTimer);
      activePollTimers.current.delete(sectionId);
    }

    // 1. Immediately disable button and show loading state
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

      // Short-poll job status every 2 seconds with timeout & error guards
      let attempts = 0;
      let consecutiveErrors = 0;
      const MAX_ATTEMPTS = 90; // 90 attempts * 2s = 180s (3 minutes max)
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

            // Update section in state
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
              // Fallback: reload entire website to ensure fresh state
              void loadData();
            }

            // Flash 300ms border highlight
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

  // Viewport switcher helpers
  const currentTier = tierById(catalogue, viewport.mode);
  const activeTierId = currentTier?.id || "desktop";

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* ─── Minimal Header Bar ────────────────────────────────────────── */}
      <header className="h-14 shrink-0 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-40">
        {/* Left: Branding & Live Link */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-sm">
            X
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>{collegeName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                AI Site
              </span>
            </div>
          </div>
          <a
            href={`/site/${encodeURIComponent(subdomain)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 ml-3 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>

        {/* Center: Device Viewport Dock & Zoom Switcher (Spec §3.3) */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800 shadow-inner">
          {/* Device switcher */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-slate-800">
            <button
              type="button"
              onClick={() => setViewport(switchTier(viewport, catalogue, "desktop"))}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                activeTierId === "desktop"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport(switchTier(viewport, catalogue, "tablet"))}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                activeTierId === "tablet"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport(switchTier(viewport, catalogue, "mobile"))}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                activeTierId === "mobile"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Zoom switcher */}
          <div className="flex items-center gap-1 pl-1 text-[11px] font-mono text-slate-400">
            <button
              type="button"
              onClick={() => setViewport({ ...viewport, zoom: null })}
              className={`px-1.5 py-0.5 rounded-md transition ${
                viewport.zoom === null ? "bg-slate-800 text-white font-bold" : "hover:text-slate-200"
              }`}
            >
              Fit
            </button>
            {ZOOM_LEVELS.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setViewport({ ...viewport, zoom: z })}
                className={`px-1.5 py-0.5 rounded-md transition ${
                  viewport.zoom === z ? "bg-slate-800 text-white font-bold" : "hover:text-slate-200"
                }`}
              >
                {`${Math.round(z * 100)}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Domain Settings & User Menu */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDomainSettings(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <UserProfileMenu />
        </div>
      </header>

      {/* ─── Main Canvas Area ──────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 relative overflow-hidden bg-slate-900/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Loading live website...</span>
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center max-w-md mx-auto p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">No Website Generated Yet</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your college does not have an AI-generated website yet. Complete onboarding to generate your site.
            </p>
            <a
              href="/onboarding"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition"
            >
              Start AI Generation
            </a>
          </div>
        ) : (
          <ResponsiveCanvas
            viewport={viewport}
            themeId={themeSelection.themeId}
            fontId={themeSelection.fontId}
            canvasClassName="xite-site-canvas"
            paneClassName="h-full overflow-y-auto"
          >
            <div className="w-full flex flex-col min-h-full">
              {sections.map((sec, idx) => {
                const secState = sectionStates[sec.id] || { status: "idle" };
                const isGenerating = secState.status === "generating";
                const isError = secState.status === "error";
                const isHighlighted = Boolean(secState.highlight);

                // Rotating status message for generating state
                const elapsedSec = secState.startTime ? Math.floor((now - secState.startTime) / 1000) : 0;
                const statusMessage =
                  elapsedSec < 15
                    ? "Generating a new version…"
                    : "Still working — this can take up to a couple of minutes…";

                // Render section markup with DOM parity guarantee
                const htmlMarkup = tokenizeSectionHtml(sectionCanvasHtml(sec.code, sec.id));

                return (
                  <div
                    key={sec.id}
                    data-xite-section-id={sec.id}
                    className={`relative group transition-all duration-300 ${
                      isHighlighted ? "ring-4 ring-blue-500 ring-offset-2 z-20" : ""
                    }`}
                  >
                    {/* Hover Floating Swap Button (Spec §3.2, §4.1) */}
                    <div className="absolute top-3 right-3 z-30 transition-all opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        disabled={isGenerating}
                        onClick={() => void handleSwapSection(sec.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                          isGenerating
                            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-blue-500/20"
                        }`}
                        title="AI Regenerate Section"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Swap</span>
                      </button>
                    </div>

                    {/* Inline Section Error Banner (Spec §4.4) */}
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

                    {/* Section Content */}
                    <div
                      dangerouslySetInnerHTML={{ __html: htmlMarkup }}
                      style={{ display: "contents" }}
                    />

                    {/* Section Loading Shimmer Overlay (Spec §4.2) */}
                    {isGenerating && (
                      <div className="absolute inset-0 z-25 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl text-white">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                          <div className="text-left">
                            <span className="text-xs font-bold block">{statusMessage}</span>
                            <span className="text-[10px] text-slate-400">
                              {elapsedSec}s elapsed • Other sections remain interactable
                            </span>
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

      {/* Domain & Account Settings Modal (unchanged capability) */}
      <DomainSettingsModal
        isOpen={showDomainSettings}
        onClose={() => setShowDomainSettings(false)}
        subdomain={subdomain}
      />
    </div>
  );
}
