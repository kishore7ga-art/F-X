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
              {sections.map((sec, idx) => (
                <div key={sec.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
                      <p className="text-xs text-slate-500">Section #{idx + 1} • Interactive Live Block</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-600 font-mono font-bold">LIVE PREVIEW</span>
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

      {/* Floating Bottom Toolbar Dock matching Image 2 */}
      <EditorToolbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        viewport={viewport}
        setViewport={setViewport}
        activeSectionTitle={sections.length > 0 ? sections[0].title : "Hero"}
        hasSections={sections.length > 0}
        onAddSection={handleAddSection}
      />

    </div>
  );
}
