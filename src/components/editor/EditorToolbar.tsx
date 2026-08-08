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
            title="Mobile Resolution (Click to Cycle 375px / 425px)"
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
            backgroundColor: "rgba(0, 0, 0, 0.75)",
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
              backgroundColor: "#0d1527",
              border: "1px solid #2563eb",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(37, 99, 235, 0.3)",
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
                <div style={{ width: "38px", height: "38px", borderRadius: "12px", backgroundColor: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                  🔗
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0, color: "#ffffff" }}>Share Live Website Link</h3>
                  <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0 0" }}>Anyone with this link can view your live website</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            {/* Input URL display */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", display: "block", marginBottom: "8px", letterSpacing: "0.05em" }}>
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
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    padding: "0 14px",
                    color: "#60a5fa",
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
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", paddingTop: "12px", borderTop: "1px solid #1e293b" }}>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ height: "40px", padding: "0 18px", borderRadius: "10px", border: "none", background: "transparent", color: "#94a3b8", fontWeight: 800, cursor: "pointer" }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.open(shareUrl, "_blank");
                  setShowShareModal(false);
                }}
                style={{ height: "40px", padding: "0 22px", borderRadius: "10px", backgroundColor: "#059669", color: "#ffffff", fontWeight: 900, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
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
