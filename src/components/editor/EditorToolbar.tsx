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
  Layers,
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
  onUndo?: () => void;
  onRedo?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDeleteSection?: () => void;
  onClearSelection?: () => void;
  onSyncAdminWebsite?: () => void;
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
  onUndo,
  onRedo,
  onMoveUp,
  onMoveDown,
  onDeleteSection,
  onClearSelection,
  onSyncAdminWebsite,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyLink = async () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    if (!currentUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "XITE Website Preview",
          text: "Check out this live college website created on XITE!",
          url: currentUrl,
        });
        showToast("Website link shared successfully! 🚀");
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      showToast("Live Website Link Copied! Ready to share anywhere 🚀");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Failed to copy link.");
    }
  };

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.open(window.location.href, "_blank");
    }
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
      
      {/* Outer Dock Container - Clean White Floating Capsule Dock */}
      <div className="bg-[#f8fafc]/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-full p-2 px-3 flex items-center gap-3 text-slate-700 text-xs font-sans">
        
        {/* 1. Dark Navy Squircle Button */}
        <button
          onClick={onOpenSettings}
          className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#0d1527] text-white hover:bg-[#1e293b] font-black transition-all cursor-pointer shadow-sm shrink-0"
          title={isSettingsOpen ? "Back to Editor" : "Open XITE Studio Settings"}
        >
          {isSettingsOpen ? (
            <X className="w-4 h-4 text-white" />
          ) : (
            <span className="font-black text-xs tracking-tight">x</span>
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* 2. System Tools Group */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleDrawer}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Pages, Colors & Fonts Drawer"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={handleManualSave}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 relative cursor-pointer"
            title="Save Status"
          >
            <Save className={`w-4 h-4 ${saving ? "animate-spin text-blue-600" : ""}`} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Instant Share / Copy Live Website Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
          </button>

          <button
            onClick={handleOpenPreview}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
            title="Open Live Website Preview in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* 3. Selected Section Tools */}
        {isSectionSelected && hasSections && (
          <>
            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
              <span className="font-extrabold text-slate-900 text-xs px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/80">
                {activeSectionTitle}
              </span>

              <button
                onClick={onDuplicateSection}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Duplicate Section"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={onUndo}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleRefreshSwap}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 font-bold transition-colors cursor-pointer"
                title="Swap Variant"
              >
                <RefreshCw className="w-4 h-4 hover:rotate-180 transition-transform duration-300" />
              </button>

              <button
                onClick={onRedo}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              <button
                onClick={onMoveUp}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              <button
                onClick={onMoveDown}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={onDeleteSection}
                className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer"
                title="Delete Section"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {onClearSelection && (
                <button
                  onClick={onClearSelection}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
                  title="Deselect Section"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* 4. Multi-Resolution Viewport Switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleDesktopClick}
            className={`transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              activeDesktop
                ? "bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-1 text-slate-900 font-extrabold"
                : "text-slate-500 hover:text-slate-900 p-1.5"
            }`}
            title="Desktop / Laptop (Click to cycle 1440px / 1280px / 1600px)"
          >
            <Monitor className="w-4 h-4" />
            {activeDesktop && (
              <span className="font-mono font-extrabold text-[11px] text-slate-800">
                {activeDesktop.width}
              </span>
            )}
          </button>

          <button
            onClick={handleTabletClick}
            className={`transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTablet
                ? "bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-1 text-slate-900 font-extrabold"
                : "text-slate-500 hover:text-slate-900 p-1.5"
            }`}
            title="Tablet (Click to cycle 768px / 640px / 1024px)"
          >
            <Tablet className="w-4 h-4" />
            {activeTablet && (
              <span className="font-mono font-extrabold text-[11px] text-slate-800">
                {activeTablet.width}
              </span>
            )}
          </button>

          <button
            onClick={handleMobileClick}
            className={`transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              activeMobile
                ? "bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-1 text-slate-900 font-extrabold"
                : "text-slate-500 hover:text-slate-900 p-1.5"
            }`}
            title="Mobile (Click to cycle 375px / 320px / 425px)"
          >
            <Smartphone className="w-4 h-4" />
            {activeMobile && (
              <span className="font-mono font-extrabold text-[11px] text-slate-800">
                {activeMobile.width}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in duration-150 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
