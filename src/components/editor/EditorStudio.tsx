"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Sparkles, Layers, Layout, RefreshCw } from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { DrawerPanel } from "./DrawerPanel";
import { DomainSettingsModal } from "./DomainSettingsModal";
import { UserProfileMenu } from "./UserProfileMenu";

type ViewportMode = "desktop" | "tablet" | "mobile";

interface SectionItem {
  id: string;
  title: string;
  code: string;
  variantIndex: number;
}

const DEFAULT_STARTER_CODE = `<!-- Default Hero Section -->
<section style="background: #0f172a; color: #fff; padding: 70px 24px; text-align: center; font-family: system-ui, sans-serif; border-radius: 16px;">
  <div style="max-width: 800px; margin: 0 auto;">
    <span style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; color: #60a5fa; letter-spacing: 0.08em; text-transform: uppercase;">
      Official Campus Portal
    </span>
    <h1 style="font-size: 42px; font-weight: 900; margin-top: 20px; line-height: 1.15; color: #fff;">
      Excellence in Higher Education & Global Research
    </h1>
    <p style="font-size: 15px; color: #94a3b8; margin-top: 14px; line-height: 1.6;">
      Empowering future leaders with world-class faculty, modern laboratories, and vibrant campus life.
    </p>
    <div style="margin-top: 28px; display: flex; justify-content: center; gap: 14px;">
      <a href="#explore" style="background: #2563eb; color: #fff; padding: 12px 26px; border-radius: 12px; font-size: 13px; font-weight: 800; text-decoration: none;">Explore Programs</a>
      <a href="#contact" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 12px 26px; border-radius: 12px; font-size: 13px; font-weight: 800; text-decoration: none;">Contact Admissions</a>
    </div>
  </div>
</section>`;

interface EditorStudioProps {
  subdomain?: string;
  collegeName?: string;
}

export function EditorStudio({
  subdomain = "greenfield",
  collegeName = "Greenfield University",
}: EditorStudioProps) {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [loadingDb, setLoadingDb] = useState(true);

  // Fetch sections/templates added by Admin in the Database
  const fetchDbSections = async () => {
    try {
      setLoadingDb(true);
      const res = await fetch("/api/v1/admin/templates", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.templates && data.templates.length > 0) {
          const dbSections: SectionItem[] = data.templates.map((tpl: any, idx: number) => ({
            id: tpl.id || `db-${idx}`,
            title: tpl.name || `Admin Section #${idx + 1}`,
            code: tpl.code || DEFAULT_STARTER_CODE,
            variantIndex: 0,
          }));
          setSections(dbSections);
          setActiveSectionIndex(0);
        }
      }
    } catch {
      // Backend not reached or empty DB
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    void fetchDbSections();
  }, []);

  const handleAddSection = () => {
    const newId = `sec-${sections.length + 1}`;
    setSections([
      ...sections,
      { id: newId, title: `Hero Banner Variant #${sections.length + 1}`, code: DEFAULT_STARTER_CODE, variantIndex: 0 },
    ]);
    setActiveSectionIndex(sections.length);
  };

  const handleSwapVariant = () => {
    if (sections.length === 0) return;
    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== activeSectionIndex) return sec;
        return { ...sec };
      })
    );
  };

  const handleDuplicateSection = () => {
    if (sections.length === 0) return;
    const current = sections[activeSectionIndex];
    const duplicated: SectionItem = {
      id: `sec-${Date.now()}`,
      title: `${current.title} (Copy)`,
      code: current.code,
      variantIndex: current.variantIndex,
    };
    setSections((prev) => [
      ...prev.slice(0, activeSectionIndex + 1),
      duplicated,
      ...prev.slice(activeSectionIndex + 1),
    ]);
    setActiveSectionIndex(activeSectionIndex + 1);
  };

  const handleDeleteSection = () => {
    if (sections.length === 0) return;
    setSections((prev) => prev.filter((_, idx) => idx !== activeSectionIndex));
    setActiveSectionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleMoveUp = () => {
    if (activeSectionIndex <= 0) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[activeSectionIndex];
      copy[activeSectionIndex] = copy[activeSectionIndex - 1];
      copy[activeSectionIndex - 1] = temp;
      return copy;
    });
    setActiveSectionIndex((prev) => prev - 1);
  };

  const handleMoveDown = () => {
    if (activeSectionIndex >= sections.length - 1) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[activeSectionIndex];
      copy[activeSectionIndex] = copy[activeSectionIndex + 1];
      copy[activeSectionIndex + 1] = temp;
      return copy;
    });
    setActiveSectionIndex((prev) => prev + 1);
  };

  const viewportWidthClass =
    viewport === "desktop"
      ? "max-w-6xl"
      : viewport === "tablet"
      ? "max-w-2xl"
      : "max-w-sm";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* Top Navbar Header */}
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/xite-logo.png" alt="XITE Logo" className="h-7 w-7 object-contain rounded-md" />
            <span className="text-base font-black tracking-tight text-slate-900">XITE</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-extrabold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visual Live Editor Studio</span>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDbSections}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="Sync with Admin DB"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDb ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visit Live Site ↗</span>
          </button>
          <UserProfileMenu collegeName={collegeName} />
        </div>
      </header>

      {/* Main Canvas Workspace */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start pb-32">
        <div
          className={`w-full ${viewportWidthClass} transition-all duration-300 min-h-[70vh] bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center relative`}
        >
          {sections.length === 0 ? (
            /* Empty Canvas State */
            <div className="text-center space-y-4 max-w-md p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
                <Layout className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Empty Canvas Workspace</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                No sections have been added by admin yet. Add sections in the Admin Control Room or click below to build your canvas.
              </p>
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Section</span>
              </button>
            </div>
          ) : (
            /* Live Rendered HTML Sections */
            <div className="w-full space-y-8">
              {sections.map((sec, idx) => {
                const isActive = idx === activeSectionIndex;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setActiveSectionIndex(idx)}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden relative ${
                      isActive
                        ? "border-blue-500 ring-4 ring-blue-500/20 shadow-xl"
                        : "border-slate-200 hover:border-slate-300 shadow"
                    }`}
                  >
                    {/* Section Header Bar */}
                    <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-extrabold border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span>{sec.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        {isActive ? "ACTIVE EDITING" : "LIVE PREVIEW"}
                      </span>
                    </div>

                    {/* Live HTML/CSS Section Render Frame */}
                    <div className="w-full min-h-[250px] bg-slate-950 p-2 overflow-hidden">
                      <iframe
                        title={sec.title}
                        srcDoc={sec.code}
                        className="w-full min-h-[300px] border-0 rounded-xl bg-slate-950 pointer-events-none"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Side Drawer Panel */}
      <DrawerPanel isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Domain Settings Modal */}
      <DomainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        subdomain={subdomain}
      />

      {/* Floating Bottom Toolbar Dock */}
      <EditorToolbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        viewport={viewport}
        setViewport={setViewport}
        activeSectionTitle={sections.length > 0 ? sections[activeSectionIndex]?.title : "Hero"}
        hasSections={sections.length > 0}
        onAddSection={handleAddSection}
        onDuplicateSection={handleDuplicateSection}
        onSwapVariant={handleSwapVariant}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDeleteSection={handleDeleteSection}
      />

    </div>
  );
}
