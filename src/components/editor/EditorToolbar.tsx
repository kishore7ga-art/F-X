"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  Share2,
  ExternalLink,
  Copy,
  Undo2,
  Redo2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Trash2,
  Monitor,
  Tablet,
  Smartphone,
  X,
  Plus,
} from "lucide-react";

type ViewportMode = "desktop" | "tablet" | "mobile";

interface EditorToolbarProps {
  onOpenSettings: () => void;
  onToggleDrawer: () => void;
  viewport: ViewportMode;
  setViewport: (v: ViewportMode) => void;
  activeSectionTitle?: string;
  hasSections: boolean;
  onAddSection: () => void;
}

export function EditorToolbar({
  onOpenSettings,
  onToggleDrawer,
  viewport,
  setViewport,
  activeSectionTitle = "No Active Section",
  hasSections,
  onAddSection,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl shadow-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-200 text-xs select-none">
        
        {/* Left Group: Brand & Drawer Toggle & Settings */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleDrawer}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-extrabold border border-blue-500/30 transition-all cursor-pointer"
          >
            <span>Drawer (Pages/Theme)</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl hover:bg-slate-800/80 text-slate-300 transition-all cursor-pointer"
            title="Custom Domain & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <Save className="w-3.5 h-3.5" />
            <span className="font-semibold">Saved</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl hover:bg-slate-800/80 text-slate-300 transition-all cursor-pointer"
            title="Copy Tenant Share Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {copied && <span className="text-[10px] text-blue-400 font-medium">Link Copied!</span>}
        </div>

        {/* Center Group: Active Section Controls / Add Section */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {hasSections ? (
            <>
              <span className="px-2.5 py-1 text-xs font-bold text-slate-300 bg-slate-800 rounded-lg">
                {activeSectionTitle}
              </span>

              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white" title="Duplicate Section">
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white" title="Undo">
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white" title="Swap Variant">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white" title="Redo">
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white" title="Move Up">
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white" title="Move Down">
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400" title="Delete Section">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onAddSection}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          )}
        </div>

        {/* Right Group: Viewport Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewport("desktop")}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === "desktop" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
            title="Desktop View (1200px)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === "tablet" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === "mobile" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
