"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye, Sparkles, Layers, Layout } from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { DrawerPanel } from "./DrawerPanel";
import { DomainSettingsModal } from "./DomainSettingsModal";
import { UserProfileMenu } from "./UserProfileMenu";

type ViewportMode = "desktop" | "tablet" | "mobile";

interface SectionItem {
  id: string;
  title: string;
  variantIndex: number;
}

const VARIANTS = [
  "Hero Banner Variant #1 (Academic Layout)",
  "Hero Banner Variant #2 (Modern Centered)",
  "Hero Banner Variant #3 (Split Media & Text)",
];

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

  const handleAddSection = () => {
    const newId = `sec-${sections.length + 1}`;
    setSections([
      ...sections,
      { id: newId, title: VARIANTS[0], variantIndex: 0 },
    ]);
    setActiveSectionIndex(sections.length);
  };

  const handleSwapVariant = () => {
    if (sections.length === 0) return;
    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== activeSectionIndex) return sec;
        const nextVariant = (sec.variantIndex + 1) % VARIANTS.length;
        return { ...sec, title: VARIANTS[nextVariant], variantIndex: nextVariant };
      })
    );
  };

  const handleDuplicateSection = () => {
    if (sections.length === 0) return;
    const current = sections[activeSectionIndex];
    const duplicated = {
      id: `sec-${Date.now()}`,
      title: `${current.title} (Copy)`,
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
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer"
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
          className={`w-full ${viewportWidthClass} transition-all duration-300 min-h-[70vh] bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center relative`}
        >
          {sections.length === 0 ? (
            /* Empty Canvas State */
            <div className="text-center space-y-4 max-w-md p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
                <Layout className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Empty Canvas Workspace</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                No sections have been added by admin yet. Start building your page by adding sections or configuring theme options.
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
            /* Rendered Sections */
            <div className="w-full space-y-6">
              {sections.map((sec, idx) => {
                const isActive = idx === activeSectionIndex;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setActiveSectionIndex(idx)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? "bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
                        <p className="text-xs text-slate-500">
                          Section #{idx + 1} • Interactive Live Block {isActive ? "(Selected)" : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-mono font-bold">LIVE PREVIEW</span>
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
