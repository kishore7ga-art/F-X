"use client";

import { useCallback, useEffect, useState } from "react";

import type { SaveStatus } from "@/hooks/useEditorPages";
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
  Check,
  Layers,
  Type,
  Plus,
} from "lucide-react";
import type { ViewportState } from "@/lib/viewport-presets";
import { rootDomain } from "@/lib/host-routing";
import { ViewportControl } from "./ViewportControl";

interface EditorToolbarProps {
  subdomain?: string;
  onOpenSettings: () => void;
  onToggleDrawer: () => void;
  isSettingsOpen?: boolean;
  /**
   * The device, the width and the zoom — one object.
   *
   * This was a bare `viewportWidth: string` carrying values like `"768px"` and
   * `"100%"`, which is two different kinds of thing in one field: a real
   * viewport width, and a sentinel meaning "no particular width". Everything
   * downstream had to branch on the sentinel, and there was nowhere at all to
   * put a zoom. See `@/lib/viewport-presets`.
   */
  viewport: ViewportState;
  setViewport: (next: ViewportState) => void;
  /** What "Fit" currently works out to, measured by the canvas. */
  canvasScale?: number;
  activeSectionTitle?: string;
  hasSections?: boolean;
  isSectionSelected?: boolean;
  onAddSection?: () => void;
  onDuplicateSection?: () => void;
  onSwapVariant?: () => void;
  /**
   * How many layouts the selected section can swap between.
   *
   * The Swap button used to look identical whether a section had eight
   * alternatives or none, and pressing it in the second case did nothing and
   * said nothing. With the count here the button can disable itself and its
   * tooltip can say why.
   */
  variantCount?: number;
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
  /**
   * What to say about the person's unsaved work.
   *
   * Optional so the toolbar still renders without it, defaulting to "idle" —
   * which shows a neutral dot and claims nothing. The one state this must
   * never invent is "saved".
   */
  saveStatus?: SaveStatus;
  saveError?: string | null;
}

export function EditorToolbar({
  subdomain = "greenfield",
  onOpenSettings,
  onToggleDrawer,
  isSettingsOpen = false,
  viewport,
  setViewport,
  canvasScale = 1,
  // Empty, not a sample section name. The fallback below already says
  // "Select a section"; defaulting to "Hero 2" meant an omitted prop rendered
  // as a confident label for a section nobody had chosen.
  activeSectionTitle = "",
  hasSections = true,
  isSectionSelected = true,
  onAddSection,
  onDuplicateSection,
  onSwapVariant,
  variantCount = 0,
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
  saveStatus = "idle",
  saveError = null,
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

  /**
   * Say what just happened, in the status pill.
   *
   * This was an empty function with a comment saying notifications were
   * disabled, declared *below* the five places that called it — so "Toolbar
   * docked", "Link copied" and "Changes saved" were all computed and thrown
   * away, and the state holding them was never rendered. Popups are still
   * gone; this is one non-blocking line that replaces its own message.
   */
  const showToast = useCallback((message: string) => {
    setToastMessage(message || null);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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
  }, [isDragging, dragOffset, showToast]);

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    const sub = subdomain || "greenfield";
    const origin = window.location.origin;
    const isProd = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
    
    // Clean Live Website Public URL. The host comes from NEXT_PUBLIC_ROOT_DOMAIN
    // rather than a literal, so moving the platform's domain does not leave a
    // share button handing out links to the previous one.
    const publicWebsiteUrl = isProd
      ? `https://${rootDomain()}/site/${sub}`
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
    if (onSyncAdminWebsite) {
      onSyncAdminWebsite();
    }
    if (typeof window !== "undefined") {
      const sub = subdomain || "greenfield";
      const origin = window.location.origin;
      const isProd = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
      const previewTargetUrl = isProd ? `https://${rootDomain()}/site/${sub}` : `${origin}/site/${sub}`;
      
      window.open(previewTargetUrl, "_blank");
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

  /**
   * Ask for the next layout.
   *
   * No toast. This used to announce "Section variant updated!" the moment it
   * was pressed — before the swap was attempted, and regardless of whether one
   * happened. On the common failure (a category with nothing in the library)
   * the user was told the section had changed while it visibly had not.
   * Reporting belongs to the code that knows the outcome; the studio's status
   * line does it.
   */
  const handleRefreshSwap = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onSwapVariant?.();
  };

  /** Two or more layouts is the minimum for a swap to be able to do anything. */
  const canSwap = isSectionSelected && variantCount > 1;

  /**
   * The save button's dot and tooltip.
   *
   * A failure keeps the reason rather than flattening it to "Save failed":
   * "Network unavailable" and "Session expired" call for different actions
   * from the person reading it, and both used to reach the console only.
   */
  const saveIndicator = (() => {
    switch (saveStatus) {
      case "saving":
        return { dot: "#f59e0b", title: "Saving your changes…" };
      case "saved":
        return { dot: "#16a34a", title: "All changes saved" };
      case "failed":
        return {
          dot: "#e11d48",
          title: saveError
            ? `Not saved — ${saveError}. Your changes are still here; click to retry.`
            : "Not saved. Your changes are still here; click to retry.",
        };
      default:
        return { dot: "#94a3b8", title: "No changes to save" };
    }
  })();

  const buttonHoverStyle = {
    transition: "all 0.15s ease",
  };

  /**
   * Add Section — the one place a section is added from.
   *
   * It used to be a hover button in every seam of the canvas: pass the pointer
   * between two sections and a control appeared *inside the preview*, which is
   * the one place editor chrome does not belong. The page read as a stack of
   * blocks with gaps rather than as the website it is.
   *
   * Here it is instead, next to the other things you do to a section, and it
   * places relative to the selection: the new section lands directly **below**
   * the selected one. With nothing selected it falls back to the existing
   * rules — a navbar to the top, a footer to the bottom, anything else above
   * the footer.
   *
   * An icon alone, styled exactly like the tools beside it. A filled blue pill
   * with a label was tried and was wrong for this bar: every other control here
   * is a bare 30px glyph, so the one coloured, labelled button read as something
   * bolted on rather than as one of the tools. The row is scanned, not read.
   *
   * The `title` carries everything the label said and more — it names the
   * section the new one will land under — so pressing it is never a guess, and
   * `aria-label` says the same for anyone who never sees the tooltip.
   */
  const addSectionTitle = isSectionSelected && activeSectionTitle
    ? `Add a section below ${activeSectionTitle}`
    : "Add a section to this page";

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
    <>
      {/* What just happened. `toastMessage` already existed and nothing
          rendered it, so every message this component produced was discarded. */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "128px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 60,
            pointerEvents: "none",
            padding: "8px 16px",
            borderRadius: "999px",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            color: "#f8fafc",
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "-0.01em",
            boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
          }}
        >
          {toastMessage}
        </div>
      )}

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
          padding: isVertical ? "8px 0" : "0 24px",
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isVertical ? "16px" : "16px",
          boxSizing: "border-box",
          position: "relative",
          overflowY: isVertical ? "auto" : "visible",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        {/* Vertical Side Dock Layout */}
        {isVertical ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              height: "100%",
              width: "100%",
              boxSizing: "border-box",
              padding: "6px 0",
              gap: "0",
            }}
          >
            {/* Top Floating Section Name Badge beside Vertical Side Dock */}
            <div
              style={{
                position: "fixed",
                left: dockPosition === "left" ? "64px" : "auto",
                right: dockPosition === "right" ? "64px" : "auto",
                top: "8px",
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

            {/* Logo — always pinned at the top regardless of dock side */}
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
                marginBottom: "4px",
              }}
              title={isSettingsOpen ? "Back to Editor" : "XITE Studio Settings"}
            >
              <img src="/xite-logo.png" alt="XITE Logo" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "contain" }} />
            </button>

            {/* Inner container — reverses for right dock */}
            <div
              style={{
                display: "flex",
                flexDirection: dockPosition === "right" ? "column-reverse" : "column",
                alignItems: "center",
                justifyContent: "space-between",
                flex: 1,
                width: "100%",
                padding: "4px 0",
              }}
            >
            {/* === TOP GROUP: Action Buttons === */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
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

              {/* Add Section — icon only; the dock is 52px wide on end. */}
              <button
                onClick={onAddSection}
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
                  flexShrink: 0,
                  ...buttonHoverStyle,
                }}
                title={addSectionTitle}
                aria-label={addSectionTitle}
              >
                <Plus style={{ width: "17px", height: "17px", strokeWidth: 2.2, color: "#334155" }} />
              </button>

              {/* Duplicate Section Button */}
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

              {/* Swap Variant Layout Button */}
              <button
                onClick={handleRefreshSwap}
                disabled={!canSwap}
                style={{
                  position: "relative",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: canSwap ? "pointer" : "not-allowed",
                  opacity: canSwap ? 1 : 0.4,
                  color: "#334155",
                  ...buttonHoverStyle,
                }}
                title={
                  canSwap
                    ? `Next layout (${variantCount} available)`
                    : "No other layout for this section in the library"
                }
                aria-label={
                  canSwap
                    ? `Swap to the next of ${variantCount} layouts`
                    : "No other layout available for this section"
                }
              >
                <RefreshCw style={{ width: "16px", height: "16px", strokeWidth: 1.8, color: "#334155" }} />
                {canSwap && (
                  /* How many alternatives there are, on the button. Without it
                     the only way to find out was to press it and count. */
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: "-1px",
                      right: "-1px",
                      minWidth: "13px",
                      height: "13px",
                      padding: "0 3px",
                      borderRadius: "999px",
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      fontSize: "8px",
                      fontWeight: 900,
                      lineHeight: "13px",
                      textAlign: "center",
                    }}
                  >
                    {variantCount}
                  </span>
                )}
              </button>
            </div>
            {/* === CENTER GROUP: Resolution Switcher === */}
            {/* 3. Middle Resolution Switcher Group */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                margin: "4px 0",
              }}
            >
              <div style={{ height: "1px", width: "18px", backgroundColor: "#cbd5e1", margin: "4px 0" }} />

              <ViewportControl
                viewport={viewport}
                onChange={setViewport}
                scale={canvasScale}
                orientation="vertical"
              />

              <div style={{ height: "1px", width: "18px", backgroundColor: "#cbd5e1", margin: "4px 0" }} />
            </div>

            {/* === BOTTOM GROUP: Delete, External Preview, Copy Link, Save, Layers === */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              {/* Trash / Delete Section Button */}
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

              {/* Save Disk Button */}
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
                title={saveIndicator.title}
                aria-label={saveIndicator.title}
              >
                <Save
                  style={{
                    width: "16px",
                    height: "16px",
                    strokeWidth: 1.8,
                    color: saveStatus === "failed" ? "#e11d48" : "#334155",
                  }}
                />
                {/*
                  The dot reports the save queue rather than decorating the
                  button. It was a fixed `#0d1527` — the same colour whether a
                  request was in flight, had landed, or had failed — which made
                  it a decoration in the shape of a status light.

                  Colour is not the only carrier: the tooltip and the
                  `aria-label` say the same thing in words, and a failure also
                  tints the icon, so this does not depend on distinguishing
                  amber from green.
                */}
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: saveIndicator.dot,
                  }}
                />
              </button>

              {/* Layers Drawer Button (At Very Bottom) */}
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
            </div>
            </div>
          </div>
        ) : (
          /* Horizontal Dock Layout (Original Top/Bottom Dock Bar) */
          <>
            {/* 1. Far Left Group: Logo + System Tools */}
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

              {/* Primary System Tools Group */}
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
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

            {/* 2. Center: Active Section Name Text — absolutely centered */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
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

            {/* 3. Right Group: Viewport Switcher + Editing Tools */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
              <ViewportControl
                viewport={viewport}
                onChange={setViewport}
                scale={canvasScale}
                orientation="horizontal"
              />

              <div style={{ height: "18px", width: "1.5px", backgroundColor: "#cbd5e1", margin: "0 6px", flexShrink: 0 }} />

              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "6px" }}>
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

                <button
                  onClick={onAddSection}
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
                  title={addSectionTitle}
                  aria-label={addSectionTitle}
                >
                  <Plus style={{ width: "17px", height: "17px", strokeWidth: 2.2, color: "#334155" }} />
                </button>

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
          </>
        )}
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
    </>
  );
}
