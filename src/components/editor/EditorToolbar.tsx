"use client";

import { useState, useEffect } from "react";
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

  // 4-Direction Hold & Drag + Auto-Docking State
  const [dockPosition, setDockPosition] = useState<"bottom" | "top" | "left" | "right">("bottom");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // If user clicked directly on or inside a <button>, allow button click normally
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    const rect = (e.currentTarget.closest(".editor-toolbar-dock") as HTMLElement)?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setDragPos({
        x: rect.left,
        y: rect.top,
      });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragOffset) return;
      setDragPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      setIsDragging(false);
      setDragOffset(null);

      // Snap to nearest 4 edges (Top, Bottom, Left, Right)
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = e.clientX;
      const y = e.clientY;

      const distTop = y;
      const distBottom = h - y;
      const distLeft = x;
      const distRight = w - x;

      const minDist = Math.min(distTop, distBottom, distLeft, distRight);

      let targetDock: "bottom" | "top" | "left" | "right" = "bottom";
      if (minDist === distTop) targetDock = "top";
      else if (minDist === distBottom) targetDock = "bottom";
      else if (minDist === distLeft) targetDock = "left";
      else targetDock = "right";

      setDockPosition(targetDock);
      setDragPos(null);
      showToast(`Toolbar docked to ${targetDock.toUpperCase()} 🎯`);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, dragOffset]);

  const showToast = (_msg: string) => {
    // Disabled all toast notifications per user request
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

  const isVertical = dockPosition === "left" || dockPosition === "right";

  // Dynamic Dock Positioning Styles
  const getDockPositionStyles = (): React.CSSProperties => {
    if (isDragging && dragPos) {
      return {
        position: "fixed",
        left: `${dragPos.x}px`,
        top: `${dragPos.y}px`,
        bottom: "auto",
        right: "auto",
        transform: "none",
        transition: "none",
        zIndex: 999999,
      };
    }

    if (dockPosition === "top") {
      return {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: "auto",
        width: "100%",
        height: "52px",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 99999,
      };
    }

    if (dockPosition === "left") {
      return {
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "52px",
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 99999,
      };
    }

    if (dockPosition === "right") {
      return {
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: "52px",
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 99999,
      };
    }

    // Default "bottom"
    return {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      top: "auto",
      width: "100%",
      height: "52px",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      zIndex: 99999,
    };
  };

  return (
    <div
      className="editor-toolbar-dock"
      onClick={(e) => e.stopPropagation()}
      style={{
        ...getDockPositionStyles(),
        userSelect: "none",
      }}
    >
      {/* Dock Bar Container (Draggable from any empty space) */}
      <div
        onPointerDown={handlePointerDown}
        style={{
          height: isVertical ? "100%" : "52px",
          width: isVertical ? "52px" : "100%",
          backgroundColor: "#f4f6f9",
          backgroundImage: "linear-gradient(180deg, #fafbfc 0%, #edf0f5 100%)",
          borderRight: dockPosition === "left" ? "1px solid rgba(226, 232, 240, 0.9)" : "none",
          borderLeft: dockPosition === "right" ? "1px solid rgba(226, 232, 240, 0.9)" : "none",
          borderTop: dockPosition === "bottom" ? "1px solid rgba(226, 232, 240, 0.9)" : "none",
          borderBottom: dockPosition === "top" ? "1px solid rgba(226, 232, 240, 0.9)" : "none",
          boxShadow:
            dockPosition === "left"
              ? "10px 0 40px rgba(0, 0, 0, 0.45)"
              : dockPosition === "right"
              ? "-10px 0 40px rgba(0, 0, 0, 0.45)"
              : dockPosition === "top"
              ? "0 10px 40px rgba(0, 0, 0, 0.45)"
              : "0 -10px 40px rgba(0, 0, 0, 0.45)",
          borderRadius: 0,
          padding: isVertical ? "16px 0" : "0 24px",
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          alignItems: "center",
          justifyContent: isVertical ? "flex-start" : "space-between",
          gap: isVertical ? "14px" : "16px",
          boxSizing: "border-box",
          position: "relative",
          overflowY: isVertical ? "auto" : "visible",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        {/* 1. Far Left / Top Group: Logo + System Tools */}
        <div style={{ display: "flex", flexDirection: isVertical ? "column" : "row", alignItems: "center", gap: isVertical ? "10px" : "16px" }}>
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

          {/* Primary System Tools Group */}
          <div style={{ display: "flex", flexDirection: isVertical ? "column" : "row", alignItems: "center", gap: isVertical ? "10px" : "12px" }}>
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
                color: "#334155",
                ...buttonHoverStyle,
              }}
              title="Pages, Colors & Fonts Drawer"
            >
              <Layers style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#334155" }} />
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
                color: "#334155",
                position: "relative",
                ...buttonHoverStyle,
              }}
              title="Save Status (Click to Save)"
            >
              <Save style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#334155" }} />
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
                color: "#334155",
                ...buttonHoverStyle,
              }}
              title="Instant Share / Copy Live Website Link"
            >
              {copied ? (
                <Check style={{ width: "16px", height: "16px", strokeWidth: 2, color: "#16a34a" }} />
              ) : (
                <LinkIcon style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#334155" }} />
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
                color: "#334155",
                ...buttonHoverStyle,
              }}
              title="Open Live Website Preview in New Tab"
            >
              <ExternalLink style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#334155" }} />
            </button>

            {/* Trash Icon Button */}
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
                color: "#0f172a",
                ...buttonHoverStyle,
              }}
              title="Delete Section"
            >
              <Trash2 style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#0f172a" }} />
            </button>
          </div>
        </div>

        {/* 2. Center: Active Section Name Text (In natural flex flow to prevent overlap) */}
        {!isVertical ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 12px",
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#0f172a",
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
        ) : (
          /* Top Floating Section Name Badge beside Vertical Side Dock */
          <div
            style={{
              position: "fixed",
              left: dockPosition === "left" ? "68px" : "auto",
              right: dockPosition === "right" ? "68px" : "auto",
              top: "16px",
              transform: "none",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "#ffffff",
              backgroundImage: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
              border: "1px solid rgba(203, 213, 225, 0.9)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
              fontSize: "12.5px",
              fontWeight: 800,
              color: "#0f172a",
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 999999,
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {activeSectionTitle || "Select a section"}
          </div>
        )}

        {/* 3. Right / Bottom Group: Viewport Switcher First + Editing Tools */}
        <div style={{ display: "flex", flexDirection: isVertical ? "column" : "row", alignItems: "center", gap: isVertical ? "10px" : "12px" }}>

          {/* Viewport & Resolution Switcher Group */}
          <div style={{ display: "flex", flexDirection: isVertical ? "column" : "row", alignItems: "center", gap: isVertical ? "8px" : "10px" }}>
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
                borderBottom: !isVertical && !activeTablet && !activeMobile ? "2px solid #2563eb" : "2px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: !activeTablet && !activeMobile ? "#2563eb" : "#475569",
                ...buttonHoverStyle,
              }}
              title="Desktop Resolution (100%)"
            >
              <Monitor style={{ width: "16px", height: "16px", strokeWidth: 2, color: !activeTablet && !activeMobile ? "#2563eb" : "#475569" }} />
              {!isVertical && (
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: !activeTablet && !activeMobile ? 600 : 500, fontSize: "12px", color: !activeTablet && !activeMobile ? "#2563eb" : "#475569" }}>
                  100%
                </span>
              )}
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
                borderBottom: !isVertical && activeTablet ? "2px solid #2563eb" : "2px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: activeTablet ? "#2563eb" : "#475569",
                ...buttonHoverStyle,
              }}
              title="Tablet Resolution"
            >
              <Tablet style={{ width: "16px", height: "16px", strokeWidth: 2, color: activeTablet ? "#2563eb" : "#475569" }} />
              {!isVertical && activeTablet && (
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "12px", color: "#2563eb" }}>
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
                borderBottom: !isVertical && activeMobile ? "2.5px solid #2563eb" : "2px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: activeMobile ? "#2563eb" : "#475569",
                ...buttonHoverStyle,
              }}
              title="Mobile Resolution"
            >
              <Smartphone style={{ width: "16px", height: "16px", strokeWidth: 2, color: activeMobile ? "#2563eb" : "#475569" }} />
              {!isVertical && activeMobile && (
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "12px", color: "#2563eb" }}>
                  {viewportWidth}
                </span>
              )}
            </button>
          </div>

          <div style={{ height: isVertical ? "1px" : "18px", width: isVertical ? "18px" : "1.5px", backgroundColor: "#cbd5e1", margin: isVertical ? "4px 0" : "0 6px", flexShrink: 0 }} />

          {/* Section Tools Group (Undo, Redo, Duplicate, Move Up, Move Down, Swap) */}
          <div style={{ display: "flex", flexDirection: isVertical ? "column" : "row", alignItems: "center", gap: isVertical ? "8px" : "6px" }}>
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
                color: canUndo ? "#334155" : "#cbd5e1",
                ...buttonHoverStyle,
              }}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: canUndo ? "#334155" : "#cbd5e1" }} />
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
                color: canRedo ? "#334155" : "#cbd5e1",
                ...buttonHoverStyle,
              }}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: canRedo ? "#334155" : "#cbd5e1" }} />
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
                color: "#334155",
                ...buttonHoverStyle,
              }}
              title="Duplicate Section"
            >
              <Copy style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#334155" }} />
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
                color: "#334155",
                ...buttonHoverStyle,
              }}
              title="Move Up"
            >
              <ArrowUp style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#334155" }} />
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
                color: "#334155",
                ...buttonHoverStyle,
              }}
              title="Move Down"
            >
              <ArrowDown style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#334155" }} />
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
                color: "#334155",
                ...buttonHoverStyle,
              }}
              title="Swap Variant Layout"
            >
              <RefreshCw style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#334155" }} />
            </button>
          </div>
        </div>
      </div>


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
