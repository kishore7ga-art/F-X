"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye, Sparkles, Layers, Layout, HelpCircle } from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { DrawerPanel } from "./DrawerPanel";
import { DomainSettingsModal } from "./DomainSettingsModal";
import { UserProfileMenu } from "./UserProfileMenu";

type ViewportMode = "desktop" | "tablet" | "mobile";

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
  const [sections, setSections] = useState<Array<{ id: string; title: string }>>([]);

  const handleAddSection = () => {
    const newId = `sec-${sections.length + 1}`;
    setSections([...sections, { id: newId, title: `Hero Banner Variant #${sections.length + 1}` }]);
  };

  const viewportWidthClass =
    viewport === "desktop"
      ? "max-w-6xl"
      : viewport === "tablet"
      ? "max-w-2xl"
      : "max-w-sm";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* Top Navbar Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/xite-logo.png" alt="XITE Logo" className="h-7 w-7 object-contain rounded-md" />
            <span className="text-base font-extrabold tracking-tight text-white">XITE</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visual Live Editor Studio</span>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Site ↗</span>
          </a>
          <UserProfileMenu collegeName={collegeName} />
        </div>
      </header>

      {/* Main Canvas Workspace */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start pb-32">
        <div
          className={`w-full ${viewportWidthClass} transition-all duration-300 min-h-[70vh] bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center relative`}
        >
          {sections.length === 0 ? (
            /* Empty Canvas State */
            <div className="text-center space-y-4 max-w-md p-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                <Layout className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Empty Canvas Workspace</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                No sections have been added by admin yet. Start building your page by adding sections or configuring theme options.
              </p>
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Section</span>
              </button>
            </div>
          ) : (
            /* Rendered Sections */
            <div className="w-full space-y-6">
              {sections.map((sec, idx) => (
                <div key={sec.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">{sec.title}</h3>
                      <p className="text-xs text-slate-400">Section #{idx + 1} • Interactive Live Block</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">LIVE PREVIEW</span>
                </div>
              ))}
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
        activeSectionTitle={sections.length > 0 ? sections[0].title : undefined}
        hasSections={sections.length > 0}
        onAddSection={handleAddSection}
      />

    </div>
  );
}
