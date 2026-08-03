"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  Save,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  Undo2,
  RefreshCw,
  Redo2,
  ArrowUp,
  ArrowDown,
  Trash2,
  X,
  Monitor,
  Tablet,
  Smartphone,
  Check,
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
  activeSectionTitle = "Hero",
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw] select-none">
      {/* Outer Dock Container (Light slate rounded pill container matching image 2) */}
      <div className="bg-[#f8fafc]/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-2 flex items-center gap-2 text-slate-700 text-xs font-sans">
        
        {/* 1. Dark Navy Close/Menu Square Button */}
        <button
          onClick={onToggleDrawer}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#0f172a] text-white hover:bg-[#1e293b] font-black transition-all cursor-pointer shadow-md"
          title="Toggle Drawer (Pages, Colors, Fonts)"
        >
          <span className="text-sm font-extrabold">✕</span>
        </button>

        <div className="h-5 w-px bg-slate-300 mx-0.5" />

        {/* 2. System Tools Pill */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl px-2 py-1 flex items-center gap-1.5">
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            title="Domain & Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 relative" title="Save Status">
            <Save className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            title="Copy Tenant Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            title="Visit Live Site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="h-5 w-px bg-slate-300 mx-0.5" />

        {/* 3. Section Controls Pill */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl px-3 py-1 flex items-center gap-2">
          <span className="font-extrabold text-slate-900 text-xs px-2.5 py-0.5 rounded-lg bg-slate-100">
            {hasSections ? activeSectionTitle : "Hero"}
          </span>

          <button className="p-1 rounded hover:bg-slate-100 text-slate-600" title="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-600" title="Undo">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-600" title="Swap Variant">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-600" title="Redo">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-600" title="Move Up">
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-600" title="Move Down">
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-red-50 text-red-500" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-400" title="Clear">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-300 mx-0.5" />

        {/* 4. Viewport Switcher Pill */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewport("desktop")}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all ${
              viewport === "desktop"
                ? "bg-[#0f172a] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>1200px</span>
          </button>

          <button
            onClick={() => setViewport("tablet")}
            className={`p-1.5 rounded-xl transition-all ${
              viewport === "tablet"
                ? "bg-[#0f172a] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewport("mobile")}
            className={`p-1.5 rounded-xl transition-all ${
              viewport === "mobile"
                ? "bg-[#0f172a] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
            title="Mobile (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
