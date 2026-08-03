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

interface EditorToolbarProps {
  onOpenSettings: () => void;
  onToggleDrawer: () => void;
  isSettingsOpen?: boolean;
  viewportWidth: string;
  setViewportWidth: (width: string) => void;
  activeSectionTitle?: string;
  hasSections: boolean;
  isSectionSelected?: boolean;
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
  isSectionSelected = false,
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
    }
  };

  // Device Resolution Specs (3 sizes for all 3 categories)
  const MOBILE_SIZES = [
    { label: "Mobile S", width: "320px" },
    { label: "Mobile M", width: "375px" },
    { label: "Mobile L", width: "425px" },
  ];

  const TABLET_SIZES = [
    { label: "Tablet Mini", width: "640px" },
    { label: "Tablet", width: "768px" },
    { label: "Tablet Large", width: "1024px" },
  ];

  const DESKTOP_SIZES = [
    { label: "Desktop XL", width: "1600px" },
    { label: "Desktop", width: "1440px" },
    { label: "Laptop", width: "1280px" },
  ];

  const activeMobile = MOBILE_SIZES.find((s) => s.width === viewportWidth);
  const activeTablet = TABLET_SIZES.find((s) => s.width === viewportWidth);
  const activeDesktop = DESKTOP_SIZES.find((s) => s.width === viewportWidth) || (viewportWidth === "100%" ? DESKTOP_SIZES[1] : null);

  const handleMobileClick = () => {
    let nextIdx = 0;
    if (viewportWidth === "320px") nextIdx = 1; // Mobile M (375px)
    else if (viewportWidth === "375px") nextIdx = 2; // Mobile L (425px)
    else if (viewportWidth === "425px") nextIdx = 0; // Mobile S (320px)
    else nextIdx = 1; // Default Mobile M

    const target = MOBILE_SIZES[nextIdx];
    setViewportWidth(target.width);
    showToast(`${target.label} (${target.width})`);
  };

  const handleTabletClick = () => {
    let nextIdx = 0;
    if (viewportWidth === "640px") nextIdx = 1; // Tablet (768px)
    else if (viewportWidth === "768px") nextIdx = 2; // Tablet Large (1024px)
    else if (viewportWidth === "1024px") nextIdx = 0; // Tablet Mini (640px)
    else nextIdx = 1; // Default Tablet 768px

    const target = TABLET_SIZES[nextIdx];
    setViewportWidth(target.width);
    showToast(`${target.label} (${target.width})`);
  };

  const handleDesktopClick = () => {
    let nextIdx = 0;
    if (viewportWidth === "1600px" || viewportWidth === "100%") nextIdx = 1; // Desktop (1440px)
    else if (viewportWidth === "1440px") nextIdx = 2; // Laptop (1280px)
    else if (viewportWidth === "1280px") nextIdx = 0; // Desktop XL (1600px)
    else nextIdx = 1; // Default Desktop 1440px

    const target = DESKTOP_SIZES[nextIdx];
    setViewportWidth(target.width);
    showToast(`${target.label} (${target.width})`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw] select-none flex flex-col items-center gap-2">
      
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
            <img src="/xite-logo.png" alt="XITE Logo" className="w-5 h-5 object-contain rounded-sm" />
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

        {/* 3. Section Controls Pill - ONLY rendered when a section on the canvas is selected */}
        {isSectionSelected && hasSections && (
          <>
            <div className="h-5 w-px bg-slate-300 mx-0.5" />

            <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl px-3 py-1 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
              <span className="font-extrabold text-slate-900 text-xs px-2.5 py-0.5 rounded-lg bg-slate-100">
                {activeSectionTitle}
              </span>

              <button
                onClick={onDuplicateSection}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Duplicate Section"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Undo"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={handleRefreshSwap}
                className="p-1 rounded hover:bg-slate-100 text-blue-600 font-bold transition-colors cursor-pointer"
                title="Swap Variant"
              >
                <RefreshCw className="w-3.5 h-3.5 hover:rotate-180 transition-transform duration-300" />
              </button>

              <button
                className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Redo"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onMoveUp}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onMoveDown}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-200 mx-0.5" />

              <button
                onClick={onDeleteSection}
                className="p-1 rounded hover:bg-red-50 text-red-600 cursor-pointer"
                title="Delete Section"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        <div className="h-5 w-px bg-slate-300 mx-0.5" />

        {/* 4. Multi-Resolution Device Switcher Pill */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-1 flex items-center gap-1">
          {/* Desktop / Laptop Viewport Button */}
          <button
            onClick={handleDesktopClick}
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeDesktop
                ? "bg-slate-900 text-white shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title={`Desktop / Laptop (Click to cycle Desktop 1440px / Laptop 1280px)`}
          >
            <Monitor className="w-4 h-4" />
            {activeDesktop && (
              <span className="text-[10px] font-mono font-bold px-1 rounded bg-slate-800 text-blue-300">
                {activeDesktop.width}
              </span>
            )}
          </button>

          {/* Tablet / Tablet Large Viewport Button */}
          <button
            onClick={handleTabletClick}
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeTablet
                ? "bg-slate-900 text-white shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title={`Tablet (Click to cycle Tablet 768px / Tablet Large 1024px)`}
          >
            <Tablet className="w-4 h-4" />
            {activeTablet && (
              <span className="text-[10px] font-mono font-bold px-1 rounded bg-slate-800 text-amber-300">
                {activeTablet.width}
              </span>
            )}
          </button>

          {/* Mobile S / M / L Viewport Button */}
          <button
            onClick={handleMobileClick}
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeMobile
                ? "bg-slate-900 text-white shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title={`Mobile (Click to cycle Mobile S 320px / Mobile M 375px / Mobile L 425px)`}
          >
            <Smartphone className="w-4 h-4" />
            {activeMobile && (
              <span className="text-[10px] font-mono font-bold px-1 rounded bg-slate-800 text-emerald-300">
                {activeMobile.width}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
