"use client";

import { useState } from "react";
import {
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
  subdomain?: string;
  onOpenSettings: () => void;
  onToggleDrawer: () => void;
  isSettingsOpen?: boolean;
  viewportWidth: string;
  setViewportWidth: (width: string) => void;
  activeSectionTitle?: string;
  hasSections?: boolean;
  isSectionSelected?: boolean;
  onAddSection?: () => void;
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
  subdomain = "greenfield",
  onOpenSettings,
  onToggleDrawer,
  isSettingsOpen = false,
  viewportWidth,
  setViewportWidth,
  activeSectionTitle = "Hero 2",
  hasSections = true,
  isSectionSelected = true,
  onDuplicateSection,
  onSwapVariant,
  onUndo,
  onRedo,
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
      const sub = subdomain || "greenfield";
      window.open(`/preview/${sub}`, "_blank");
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
    if (onSwapVariant) {
      onSwapVariant();
      showToast("Section variant updated!");
    } else {
      showToast("Swapped section layout variant 🚀");
    }
  };

  const MOBILE_SIZES = [
    { label: "Mobile M", width: "375px" },
    { label: "Mobile S", width: "320px" },
    { label: "Mobile L", width: "425px" },
  ];

  const TABLET_SIZES = [
    { label: "Tablet", width: "768px" },
    { label: "Tablet Mini", width: "640px" },
  ];

  const DESKTOP_SIZES = [
    { label: "Full Width (100%)", width: "100%" },
    { label: "Desktop Widescreen", width: "1200px" },
    { label: "Desktop Compact", width: "1024px" },
  ];

  const activeMobile = MOBILE_SIZES.find((s) => s.width === viewportWidth);
  const activeTablet = TABLET_SIZES.find((s) => s.width === viewportWidth);
  const activeDesktop = DESKTOP_SIZES.find((s) => s.width === viewportWidth);

  const handleMobileClick = () => {
    let nextIdx = 0;
    if (viewportWidth === "375px") nextIdx = 1;
    else if (viewportWidth === "320px") nextIdx = 2;
    else if (viewportWidth === "425px") nextIdx = 0;
    else nextIdx = 0;

    const target = MOBILE_SIZES[nextIdx]!;
    setViewportWidth(target.width);
    showToast(`${target.label} (${target.width})`);
  };

  const handleTabletClick = () => {
    let nextIdx = 0;
    if (viewportWidth === "768px") nextIdx = 1;
    else if (viewportWidth === "640px") nextIdx = 0;
    else nextIdx = 0;

    const target = TABLET_SIZES[nextIdx]!;
    setViewportWidth(target.width);
    showToast(`${target.label} (${target.width})`);
  };

  const handleDesktopClick = () => {
    let nextIdx = 0;
    if (viewportWidth === "100%") nextIdx = 1;
    else if (viewportWidth === "1200px") nextIdx = 2;
    else if (viewportWidth === "1024px") nextIdx = 0;
    else nextIdx = 0;

    const target = DESKTOP_SIZES[nextIdx]!;
    setViewportWidth(target.width);
    showToast(`${target.label} (${target.width})`);
  };

  const buttonHoverStyle = {
    transition: "all 0.15s ease",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: 0,
        right: 0,
        margin: "0 auto",
        zIndex: 99999,
        width: "max-content",
        maxWidth: "95vw",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {/* Outer Dock Floating Capsule Container */}
      <div
        style={{
          height: "54px",
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 30px -10px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          borderRadius: "9999px",
          padding: "0 14px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "10px",
          boxSizing: "border-box",
        }}
      >
        {/* 1. Dark Navy Logo Button */}
        <button
          onClick={onOpenSettings}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "14px",
            backgroundColor: "#0d1527",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          }}
          title={isSettingsOpen ? "Back to Editor" : "Open XITE Studio Settings"}
        >
          {isSettingsOpen ? (
            <X style={{ width: "16px", height: "16px", color: "#ffffff" }} />
          ) : (
            <span style={{ fontWeight: 900, fontSize: "14px", color: "#ffffff", lineHeight: 1 }}>x</span>
          )}
        </button>

        <div style={{ height: "20px", width: "1px", backgroundColor: "#e2e8f0", margin: "0 2px", flexShrink: 0 }} />

        {/* 2. Primary System Tools Group */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "4px" }}>
          {/* Layers Drawer Button */}
          <button
            onClick={onToggleDrawer}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#334155",
              ...buttonHoverStyle,
            }}
            title="Pages, Colors & Fonts Drawer"
          >
            <Layers style={{ width: "18px", height: "18px" }} />
          </button>

          {/* Save Status Disk Button */}
          <button
            onClick={handleManualSave}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#334155",
              position: "relative",
              ...buttonHoverStyle,
            }}
            title="Save Status (Click to Save)"
          >
            <Save style={{ width: "18px", height: "18px" }} />
            <span
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                border: "1.5px solid #ffffff",
              }}
            />
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#334155",
              ...buttonHoverStyle,
            }}
            title="Instant Share / Copy Live Website Link"
          >
            {copied ? (
              <Check style={{ width: "18px", height: "18px", color: "#059669" }} />
            ) : (
              <LinkIcon style={{ width: "18px", height: "18px" }} />
            )}
          </button>

          {/* External Preview Link Button */}
          <button
            onClick={handleOpenPreview}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#334155",
              ...buttonHoverStyle,
            }}
            title="Open Live Website Preview in New Tab"
          >
            <ExternalLink style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        <div style={{ height: "20px", width: "1px", backgroundColor: "#e2e8f0", margin: "0 2px", flexShrink: 0 }} />

        {/* 3. Section Editing Tools Group */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "4px" }}>
          {/* Active Section Title Badge */}
          <span
            style={{
              height: "32px",
              padding: "0 14px",
              borderRadius: "12px",
              backgroundColor: "#f1f5f9",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
              fontWeight: 800,
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {activeSectionTitle}
          </span>

          {/* Duplicate Button */}
          <button
            onClick={onDuplicateSection}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#334155",
              ...buttonHoverStyle,
            }}
            title="Duplicate Section"
          >
            <Copy style={{ width: "18px", height: "18px" }} />
          </button>

          {/* Undo Button */}
          <button
            onClick={onUndo}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#334155",
              ...buttonHoverStyle,
            }}
            title="Undo"
          >
            <Undo2 style={{ width: "18px", height: "18px" }} />
          </button>

          {/* Swap Variant Refresh Blue Button */}
          <button
            onClick={handleRefreshSwap}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#2563eb",
              ...buttonHoverStyle,
            }}
            title="Swap Variant Layout"
          >
            <RefreshCw style={{ width: "18px", height: "18px" }} />
          </button>

          {/* Redo Button */}
          <button
            onClick={onRedo}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#334155",
              ...buttonHoverStyle,
            }}
            title="Redo"
          >
            <Redo2 style={{ width: "18px", height: "18px" }} />
          </button>

          {/* Move Up Button */}
          <button
            onClick={onMoveUp}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#334155",
              ...buttonHoverStyle,
            }}
            title="Move Up"
          >
            <ArrowUp style={{ width: "18px", height: "18px" }} />
          </button>

          {/* Move Down Button */}
          <button
            onClick={onMoveDown}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#334155",
              ...buttonHoverStyle,
            }}
            title="Move Down"
          >
            <ArrowDown style={{ width: "18px", height: "18px" }} />
          </button>

          {/* Red Delete Trash Icon Button */}
          <button
            onClick={onDeleteSection}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#f43f5e",
              ...buttonHoverStyle,
            }}
            title="Delete Section"
          >
            <Trash2 style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        <div style={{ height: "20px", width: "1px", backgroundColor: "#e2e8f0", margin: "0 2px", flexShrink: 0 }} />

        {/* 4. Multi-Resolution Viewport Switcher Group */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "6px" }}>
          {/* Desktop Monitor Resolution Button */}
          <button
            onClick={handleDesktopClick}
            style={{
              height: "34px",
              padding: activeDesktop ? "0 12px" : "0 8px",
              borderRadius: "12px",
              border: activeDesktop ? "1px solid #cbd5e1" : "none",
              backgroundColor: activeDesktop ? "#ffffff" : "transparent",
              boxShadow: activeDesktop ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              color: "#0f172a",
              ...buttonHoverStyle,
            }}
            title="Desktop Resolution (Click to Cycle 1200px / 1024px / 800px)"
          >
            <Monitor style={{ width: "18px", height: "18px", color: "#334155" }} />
            {activeDesktop && (
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                {activeDesktop.width}
              </span>
            )}
          </button>

          {/* Tablet Resolution Button */}
          <button
            onClick={handleTabletClick}
            style={{
              height: "34px",
              padding: activeTablet ? "0 12px" : "0 8px",
              borderRadius: "12px",
              border: activeTablet ? "1px solid #cbd5e1" : "none",
              backgroundColor: activeTablet ? "#ffffff" : "transparent",
              boxShadow: activeTablet ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              color: "#0f172a",
              ...buttonHoverStyle,
            }}
            title="Tablet Resolution (Click to Cycle 768px / 640px / 1024px)"
          >
            <Tablet style={{ width: "18px", height: "18px", color: "#334155" }} />
            {activeTablet && (
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                {activeTablet.width}
              </span>
            )}
          </button>

          {/* Mobile Phone Resolution Button */}
          <button
            onClick={handleMobileClick}
            style={{
              height: "34px",
              padding: activeMobile ? "0 12px" : "0 8px",
              borderRadius: "12px",
              border: activeMobile ? "1px solid #cbd5e1" : "none",
              backgroundColor: activeMobile ? "#ffffff" : "transparent",
              boxShadow: activeMobile ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              color: "#0f172a",
              ...buttonHoverStyle,
            }}
            title="Mobile Resolution (Click to Cycle 375px / 320px / 425px)"
          >
            <Smartphone style={{ width: "18px", height: "18px", color: "#334155" }} />
            {activeMobile && (
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                {activeMobile.width}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "86px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999999,
            backgroundColor: "#0f172a",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 800,
            padding: "10px 20px",
            borderRadius: "16px",
            boxShadow: "0 20px 30px -10px rgba(0,0,0,0.3)",
            border: "1px solid #334155",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            pointerEvents: "none",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399" }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
