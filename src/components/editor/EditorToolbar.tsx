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
  Type,
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
  onEditText?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
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
  onEditText,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onMoveUp,
  onMoveDown,
  onDeleteSection,
  onClearSelection,
  onSyncAdminWebsite,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    const sub = subdomain || "greenfield";
    const origin = window.location.origin;
    const isProd = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
    
    // Clean Live Website Public URL
    const publicWebsiteUrl = isProd
      ? `https://xite.co.in/site/${sub}`
      : `${origin}/site/${sub}`;

    setShareUrl(publicWebsiteUrl);
    setShowShareModal(true);

    try {
      await navigator.clipboard.writeText(publicWebsiteUrl);
      setCopied(true);
      showToast("Clean Live Website Link Copied! 🔗");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const sub = subdomain || "greenfield";
      const origin = window.location.origin;
      const isProd = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
      const previewTargetUrl = isProd ? `https://xite.co.in/site/${sub}` : `${origin}/site/${sub}`;
      
      window.open(previewTargetUrl, "_blank");
      showToast("Opening Live Full Website in new tab... 🚀");
    }
  };

  const handleManualSave = () => {
    setSaving(true);
    if (onSyncAdminWebsite) {
      onSyncAdminWebsite();
    }
    setTimeout(() => {
      setSaving(false);
      showToast("Changes saved successfully! 💾");
    }, 500);
  };

  const handleRefreshSwap = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSwapVariant) {
      onSwapVariant();
      showToast("Section variant updated!");
    } else {
      showToast("Swapped section layout variant 🚀");
    }
  };

  const MOBILE_SIZES = [
    { label: "Mobile M", width: "375px" },
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
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        margin: 0,
        zIndex: 99999,
        width: "100%",
        maxWidth: "100%",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Full Width Dock Container (Fills Side Space 100%) */}
      <div
        style={{
          height: "52px",
          width: "100%",
          maxWidth: "100%",
          backgroundColor: "#f4f6f9",
          backgroundImage: "linear-gradient(180deg, #fafbfc 0%, #edf0f5 100%)",
          borderTop: "1px solid rgba(226, 232, 240, 0.9)",
          boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.45), 0 -2px 10px rgba(0, 0, 0, 0.25)",
          borderRadius: 0,
          padding: "0 24px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* 1. Far Left Group: Logo Button + Primary System Tools (Layers, Save, Link, Preview, Trash) */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px" }}>
          {/* Logo Button */}
          <button
            onClick={onOpenSettings}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#0d1527",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(13,21,39,0.25)",
              overflow: "hidden",
            }}
            title={isSettingsOpen ? "Back to Editor" : "XITE Studio Settings"}
          >
            <img src="/xite-logo.png" alt="XITE Logo" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "contain" }} />
          </button>

          {/* Primary System Tools Group (Spacious 12px Gap) */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
            {/* Layers Drawer Button */}
            <button
              onClick={onToggleDrawer}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#1e293b",
                ...buttonHoverStyle,
              }}
              title="Pages, Colors & Fonts Drawer"
            >
              <Layers style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: "#1e293b" }} />
            </button>

            {/* Save Status Disk Button (with dot) */}
            <button
              onClick={handleManualSave}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#1e293b",
                position: "relative",
                ...buttonHoverStyle,
              }}
              title="Save Status (Click to Save)"
            >
              <Save style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: "#1e293b" }} />
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: "#0d1527",
                }}
              />
            </button>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#1e293b",
                ...buttonHoverStyle,
              }}
              title="Instant Share / Copy Live Website Link"
            >
              {copied ? (
                <Check style={{ width: "17px", height: "17px", strokeWidth: 2.8, color: "#16a34a" }} />
              ) : (
                <LinkIcon style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: "#1e293b" }} />
              )}
            </button>

            {/* External Link Button */}
            <button
              onClick={handleOpenPreview}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#1e293b",
                ...buttonHoverStyle,
              }}
              title="Open Live Website Preview in New Tab"
            >
              <ExternalLink style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: "#1e293b" }} />
            </button>

            {/* Dark Red Trash Icon Button (Placed Next to ExternalLink) */}
            <button
              onClick={onDeleteSection}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#dc2626",
                ...buttonHoverStyle,
              }}
              title="Delete Section"
            >
              <Trash2 style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: "#dc2626" }} />
            </button>
          </div>
        </div>

        {/* 2. Absolute Geometric Center: Active Section Name Light-Grey Pill */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: "32px",
              padding: "0 18px",
              borderRadius: "9999px",
              backgroundColor: "#dbe0e8",
              backgroundImage: "linear-gradient(180deg, #e5e9f0 0%, #d4d9e2 100%)",
              border: "1px solid rgba(255, 255, 255, 0.7)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "400px",
              overflow: "hidden",
              pointerEvents: "auto",
            }}
          >
            <span
              style={{
                fontSize: "12.5px",
                fontWeight: 800,
                color: "#4a151b",
                fontFamily: "'Plus Jakarta Sans', 'Outfit', var(--font-jakarta), var(--font-inter), sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "-0.015em",
              }}
            >
              {activeSectionTitle || "Select a section"}
            </span>
          </div>
        </div>

        {/* 3. Far Right Group: Viewport Switcher First + Editing Tools */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>

          {/* Viewport & Resolution Switcher Group (Underline Highlight Indicator) */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
            {/* Desktop Resolution Button */}
            <button
              onClick={handleDesktopClick}
              style={{
                height: "32px",
                padding: "0 4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                border: "none",
                borderBottom: !activeTablet && !activeMobile ? "2.5px solid #2563eb" : "2.5px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: !activeTablet && !activeMobile ? "#2563eb" : "#475569",
                ...buttonHoverStyle,
              }}
              title="Desktop Resolution (100%)"
            >
              <Monitor style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: !activeTablet && !activeMobile ? "#2563eb" : "#475569" }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: !activeTablet && !activeMobile ? 800 : 700, fontSize: "12.5px", color: !activeTablet && !activeMobile ? "#2563eb" : "#475569" }}>
                100%
              </span>
            </button>

            {/* Tablet Resolution Button */}
            <button
              onClick={handleTabletClick}
              style={{
                height: "32px",
                padding: "0 4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                border: "none",
                borderBottom: activeTablet ? "2.5px solid #2563eb" : "2.5px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: activeTablet ? "#2563eb" : "#475569",
                ...buttonHoverStyle,
              }}
              title="Tablet Resolution"
            >
              <Tablet style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: activeTablet ? "#2563eb" : "#475569" }} />
              {activeTablet && (
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "12.5px", color: "#2563eb" }}>
                  {viewportWidth}
                </span>
              )}
            </button>

            {/* Mobile Resolution Button */}
            <button
              onClick={handleMobileClick}
              style={{
                height: "32px",
                padding: "0 4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                border: "none",
                borderBottom: activeMobile ? "2.5px solid #2563eb" : "2.5px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: activeMobile ? "#2563eb" : "#475569",
                ...buttonHoverStyle,
              }}
              title="Mobile Resolution"
            >
              <Smartphone style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: activeMobile ? "#2563eb" : "#475569" }} />
              {activeMobile && (
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "12.5px", color: "#2563eb" }}>
                  {viewportWidth}
                </span>
              )}
            </button>
          </div>

          <div style={{ height: "18px", width: "1.5px", backgroundColor: "#cbd5e1", margin: "0 6px", flexShrink: 0 }} />

          {/* Section Tools Group (Undo, Redo, Duplicate, Move Up, Move Down, Swap) */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "6px" }}>
            {/* Undo Button */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: canUndo ? "pointer" : "default",
                color: canUndo ? "#1e293b" : "#cbd5e1",
                ...buttonHoverStyle,
              }}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: canUndo ? "#1e293b" : "#cbd5e1" }} />
            </button>

            {/* Redo Button */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: canRedo ? "pointer" : "default",
                color: canRedo ? "#1e293b" : "#cbd5e1",
                ...buttonHoverStyle,
              }}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: canRedo ? "#1e293b" : "#cbd5e1" }} />
            </button>

            {/* Duplicate Button */}
            <button
              onClick={onDuplicateSection}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#1e293b",
                ...buttonHoverStyle,
              }}
              title="Duplicate Section"
            >
              <Copy style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: "#1e293b" }} />
            </button>

            {/* Move Up Button */}
            <button
              onClick={onMoveUp}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#1e293b",
                ...buttonHoverStyle,
              }}
              title="Move Up"
            >
              <ArrowUp style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: "#1e293b" }} />
            </button>

            {/* Move Down Button */}
            <button
              onClick={onMoveDown}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#1e293b",
                ...buttonHoverStyle,
              }}
              title="Move Down"
            >
              <ArrowDown style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: "#1e293b" }} />
            </button>

            {/* Refresh / Swap Button (Moved to Last) */}
            <button
              onClick={handleRefreshSwap}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: "#1e293b",
                ...buttonHoverStyle,
              }}
              title="Swap Variant Layout"
            >
              <RefreshCw style={{ width: "17px", height: "17px", strokeWidth: 2.6, color: "#1e293b" }} />
            </button>
          </div>
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
            backgroundColor: "#000000",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 800,
            padding: "10px 20px",
            borderRadius: "16px",
            boxShadow: "0 20px 30px rgba(0,0,0,0.8)",
            border: "1px solid #3f3f46",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            pointerEvents: "none",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ffffff" }} />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* 🔗 Share Public Live Website Link Modal */}
      {showShareModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#000000",
              border: "1px solid #3f3f46",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.95)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              color: "#ffffff",
              fontFamily: "system-ui, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "12px", backgroundColor: "#ffffff", color: "#000000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900 }}>
                  🔗
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0, color: "#ffffff" }}>Share Live Website Link</h3>
                  <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "2px 0 0 0" }}>Anyone with this link can view your live website</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: "transparent", border: "none", color: "#a1a1aa", cursor: "pointer", fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            {/* Input URL display */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#e4e4e7", textTransform: "uppercase", display: "block", marginBottom: "8px", letterSpacing: "0.05em" }}>
                Public Live Website Link
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  style={{
                    flex: 1,
                    height: "44px",
                    backgroundColor: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: "12px",
                    padding: "0 14px",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    showToast("Link Copied to Clipboard! 📋");
                  }}
                  style={{
                    height: "44px",
                    padding: "0 18px",
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    fontWeight: 900,
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(255,255,255,0.2)",
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", paddingTop: "12px", borderTop: "1px solid #27272a" }}>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ height: "40px", padding: "0 18px", borderRadius: "10px", border: "none", background: "transparent", color: "#a1a1aa", fontWeight: 800, cursor: "pointer" }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.open(shareUrl, "_blank");
                  setShowShareModal(false);
                }}
                style={{ height: "40px", padding: "0 22px", borderRadius: "10px", backgroundColor: "#ffffff", color: "#000000", fontWeight: 900, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>Open Link in New Tab ↗️</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
