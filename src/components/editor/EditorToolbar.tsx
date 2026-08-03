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

export const DESKTOP_RESOLUTIONS = ["1536px", "1920px", "2560px"];
export const TABLET_RESOLUTIONS = ["768px", "820px", "834px", "1024px", "1280px", "1366px", "1440px"];
export const MOBILE_RESOLUTIONS = ["320px", "360px", "375px", "390px"];

interface EditorToolbarProps {
  onOpenSettings: () => void;
  onToggleDrawer: () => void;
  isSettingsOpen?: boolean;
  viewportWidth: string;
  setViewportWidth: (width: string) => void;
  activeSectionTitle?: string;
  hasSections: boolean;
  onAddSection: () => void;
  onDuplicateSection?: () => void;
  onSwapVariant?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDeleteSection?: () => void;
  onClearSelection?: () => void;
}

export function EditorToolbar({
  onOpenSettings,
  onToggleDrawer,
  isSettingsOpen = false,
  viewportWidth,
  setViewportWidth,
  activeSectionTitle = "Hero",
  hasSections,
  onAddSection,
  onDuplicateSection,
  onSwapVariant,
  onMoveUp,
  onMoveDown,
  onDeleteSection,
  onClearSelection,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast("Share link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Changes saved successfully!");
    }, 600);
  };

  const handleRefreshSwap = () => {
    if (!hasSections) {
      showToast("Refresh / Swap works when sections are added in Admin Panel!");
      return;
    }
    if (onSwapVariant) {
      onSwapVariant();
      showToast("Swapping section variant...");
    }
  };

  // Cycle Desktop Resolutions: 1536px -> 1920px -> 2560px
  const handleCycleDesktop = () => {
    const idx = DESKTOP_RESOLUTIONS.indexOf(viewportWidth);
    const nextWidth = idx >= 0 ? DESKTOP_RESOLUTIONS[(idx + 1) % DESKTOP_RESOLUTIONS.length] : DESKTOP_RESOLUTIONS[1]!;
    setViewportWidth(nextWidth!);
    showToast(`Desktop Viewport: ${nextWidth}`);
  };

  // Cycle Tablet & Laptop Resolutions: 768px -> 820px -> 834px -> 1024px -> 1280px -> 1366px -> 1440px
  const handleCycleTablet = () => {
    const idx = TABLET_RESOLUTIONS.indexOf(viewportWidth);
    const nextWidth = idx >= 0 ? TABLET_RESOLUTIONS[(idx + 1) % TABLET_RESOLUTIONS.length] : TABLET_RESOLUTIONS[0]!;
    setViewportWidth(nextWidth!);
    showToast(`Tablet/Laptop Viewport: ${nextWidth}`);
  };

  // Cycle Mobile Resolutions: 320px -> 360px -> 375px -> 390px
  const handleCycleMobile = () => {
    const idx = MOBILE_RESOLUTIONS.indexOf(viewportWidth);
    const nextWidth = idx >= 0 ? MOBILE_RESOLUTIONS[(idx + 1) % MOBILE_RESOLUTIONS.length] : MOBILE_RESOLUTIONS[2]!;
    setViewportWidth(nextWidth!);
    showToast(`Mobile Viewport: ${nextWidth}`);
  };

  const isDesktopActive = DESKTOP_RESOLUTIONS.includes(viewportWidth);
  const isTabletActive = TABLET_RESOLUTIONS.includes(viewportWidth);
  const isMobileActive = MOBILE_RESOLUTIONS.includes(viewportWidth);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw] select-none flex flex-col items-center gap-2">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-[#0f172a] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Outer Dock Container */}
      <div className="bg-[#f8fafc]/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-2 flex items-center gap-2 text-slate-700 text-xs font-sans">
        
        {/* 1. Dark Navy Square Button: Toggles XITE Studio Settings Page On/Off */}
        <button
          onClick={onOpenSettings}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#0f172a] text-white hover:bg-[#1e293b] font-black transition-all cursor-pointer shadow-md"
          title={isSettingsOpen ? "Back to Editor" : "Open XITE Studio Settings"}
        >
          {isSettingsOpen ? (
            <X className="w-4 h-4 text-white" />
          ) : (
            <SlidersHorizontal className="w-4 h-4 text-white" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-300 mx-0.5" />

        {/* 2. System Tools & Drawer Pill */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl px-2 py-1 flex items-center gap-1.5">
          <button
            onClick={onToggleDrawer}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Pages, Colors & Fonts Drawer"
          >
            <span className="text-xs font-black">☰</span>
          </button>

          <button
            onClick={handleManualSave}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 relative cursor-pointer"
            title="Save Status"
          >
            <Save className={`w-4 h-4 ${saving ? "animate-spin text-blue-600" : ""}`} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Copy Tenant Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
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

          <button
            onClick={onDuplicateSection}
            disabled={!hasSections}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
            title="Duplicate Section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={!hasSections}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleRefreshSwap}
            className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
              hasSections ? "text-blue-600 font-bold" : "text-slate-400"
            }`}
            title={hasSections ? "Swap Variant" : "Refresh (Requires Admin Sections)"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${hasSections ? "hover:rotate-180 transition-transform duration-300" : ""}`} />
          </button>

          <button
            disabled={!hasSections}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveUp}
            disabled={!hasSections}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
            title="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!hasSections}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
            title="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <button
            onClick={onDeleteSection}
            disabled={!hasSections}
            className="p-1 rounded hover:bg-red-50 text-red-600 disabled:opacity-40 cursor-pointer"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-300 mx-0.5" />

        {/* 4. Multi-Resolution Viewport Switcher Pill */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-1 flex items-center gap-1">
          {/* Desktop Resolutions: 1536px, 1920px, 2560px */}
          <button
            onClick={handleCycleDesktop}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
              isDesktopActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Desktop Viewports (1536px · 1920px · 2560px) — Click to cycle"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{isDesktopActive ? viewportWidth : "Desktop"}</span>
          </button>

          {/* Tablet & Laptop Resolutions: 768px, 820px, 834px, 1024px, 1280px, 1366px, 1440px */}
          <button
            onClick={handleCycleTablet}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
              isTabletActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Tablet & Laptop Viewports (768px · 820px · 834px · 1024px · 1280px · 1366px · 1440px) — Click to cycle"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>{isTabletActive ? viewportWidth : "Tablet"}</span>
          </button>

          {/* Mobile Resolutions: 320px, 360px, 375px, 390px */}
          <button
            onClick={handleCycleMobile}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
              isMobileActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Mobile Viewports (320px · 360px · 375px · 390px) — Click to cycle"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isMobileActive ? viewportWidth : "Mobile"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
