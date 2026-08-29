"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Lock,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  SlidersVertical,
  Volume2,
  Sparkles,
  Scissors,
  RotateCw,
  Crop,
  Droplet,
  Gauge,
  LayoutGrid,
  Check as CheckIcon,
  Edit3,
  Bookmark,
  ChevronDown,
} from "lucide-react";
import type { ViewportState } from "@/lib/viewport-presets";
import { rootDomain } from "@/lib/host-routing";

interface EditorToolbarProps {
  subdomain?: string;
  onOpenSettings: () => void;
  onToggleDrawer: () => void;
  isSettingsOpen?: boolean;
  viewport: ViewportState;
  setViewport: (next: ViewportState) => void;
  canvasScale?: number;
  activeSectionTitle?: string;
  hasSections?: boolean;
  isSectionSelected?: boolean;
  onAddSection?: () => void;
  onDuplicateSection?: () => void;
  onSwapVariant?: () => void;
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
  saveStatus?: SaveStatus;
  saveError?: string | null;
  onDockPositionChange?: (position: "bottom" | "top" | "left" | "right") => void;
  /**
   * The kind of section selected — "Hero", "Header", "Services" — for the one
   * button that opens its controls. Empty when the selection has no controls.
   */
  sectionKindLabel?: string;
  /** Whether that button's popup is currently open, so it can show as pressed. */
  isSectionPanelOpen?: boolean;
  onToggleSectionPanel?: () => void;
}

export function EditorToolbar({
  subdomain = "greenfield",
  onOpenSettings,
  onToggleDrawer,
  isSettingsOpen = false,
  viewport,
  setViewport,
  canvasScale = 1,
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
  onDockPositionChange,
  sectionKindLabel = "",
  isSectionPanelOpen = false,
  onToggleSectionPanel,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Toolbar Mode: "format" (Text formatting) or "media" (Crop, Speed, Loop, Volume)
  const [toolbarMode, setToolbarMode] = useState<"format" | "media">("format");

  // Interactive Popover States
  const [activeDropdown, setActiveDropdown] = useState<
    "fontSize" | "alignment" | "speed" | "loop" | "volume" | "fontFamily" | "fillColor" | "lineHeight" | null
  >(null);

  // Formatting state
  const [fontSize, setFontSize] = useState<number>(40);
  const [fontFamily, setFontFamily] = useState<string>("Inter");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("left");
  const [lineHeight, setLineHeight] = useState<number>(1.4);
  const [fillColor, setFillColor] = useState<string>("#2563eb");
  const [speed, setSpeed] = useState<number>(0.75);
  const [volume, setVolume] = useState<number>(50);
  const [loopEnabled, setLoopEnabled] = useState<boolean>(true);

  // Tooltip tracking
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Close dropdowns on outside click
  const toolbarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const preview = `${origin}/preview/${subdomain}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(preview).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleManualSave = () => {
    if (onSyncAdminWebsite) {
      onSyncAdminWebsite();
    }
  };

  const toggleDropdown = (name: typeof activeDropdown) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // Tooltip helper component
  const Tooltip = ({ title, shortcut }: { title: string; shortcut?: string }) => (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#09090b",
        color: "#ffffff",
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 700,
        fontFamily: "'Inter', system-ui, sans-serif",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
        border: "1px solid #27272a",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
      }}
    >
      <span>{title}</span>
      {shortcut && (
        <span style={{ fontSize: "10px", color: "#a1a1aa", fontWeight: 500 }}>
          {shortcut}
        </span>
      )}
      {/* Downward triangle arrow */}
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: "4px solid #09090b",
        }}
      />
    </div>
  );

  return (
    <div
      ref={toolbarRef}
      style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        maxWidth: "96vw",
      }}
    >
      {/* Active Section Label Pill above Toolbar */}
      {activeSectionTitle && (
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(8px)",
            color: "#f8fafc",
            padding: "3px 12px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "-0.01em",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#38bdf8" }} />
          <span>{activeSectionTitle}</span>
          {/*
            The one way into the section's own controls.

            Deliberately one button and not a strip of them. A hero has around
            sixty controls once its buttons, typography, background and
            per-device values are counted, and none of that fits in a 52px
            dock — so what goes here is the door, and the controls are behind
            it. It sits in the pill that already names the selected section,
            because that is where somebody looking for "what can I do to this
            section" is already looking.
          */}
          {onToggleSectionPanel && sectionKindLabel && (
            <button
              onClick={onToggleSectionPanel}
              aria-pressed={isSectionPanelOpen}
              title={
                isSectionPanelOpen
                  ? `Close the ${sectionKindLabel} controls`
                  : `Edit this ${sectionKindLabel.toLowerCase()} — content, layout, background, typography, spacing and responsive`
              }
              style={{
                backgroundColor: isSectionPanelOpen ? "#38bdf8" : "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "4px",
                color: isSectionPanelOpen ? "#0f172a" : "#38bdf8",
                fontSize: "10px",
                fontWeight: 800,
                padding: "1px 6px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <SlidersVertical style={{ width: "10px", height: "10px" }} />
              Edit {sectionKindLabel}
            </button>
          )}
          {variantCount > 1 && (
            <button
              onClick={onSwapVariant}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "4px",
                color: "#38bdf8",
                fontSize: "10px",
                fontWeight: 800,
                padding: "1px 6px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
              title={`Swap to next layout (${variantCount} available)`}
            >
              <RefreshCw style={{ width: "10px", height: "10px" }} />
              Swap ({variantCount})
            </button>
          )}
        </div>
      )}

      {/* Main Floating White Toolbar Bar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: "4px",
          boxShadow: "0 14px 40px -4px rgba(0, 0, 0, 0.14), 0 4px 14px -2px rgba(0, 0, 0, 0.05)",
          border: "1px solid rgba(228, 228, 231, 0.95)",
          boxSizing: "border-box",
          userSelect: "none",
          position: "relative",
        }}
      >
        {/* === LEFT / CENTER: Formatting or Media Group === */}
        {toolbarMode === "format" ? (
          <>
            {/* 1. Font Family Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("fontFamily")}
                onMouseEnter={() => setHoveredButton("font")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "34px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  backgroundColor: activeDropdown === "fontFamily" ? "#f4f4f5" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#18181b",
                  transition: "background-color 0.15s ease",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#27272a" }}>Tᴛ</span>
                <span>{fontFamily}</span>
              </button>
              {hoveredButton === "font" && activeDropdown !== "fontFamily" && (
                <Tooltip title="Font family" />
              )}

              {/* Font Family Popover */}
              {activeDropdown === "fontFamily" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 10px)",
                    left: 0,
                    backgroundColor: "#000000",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    padding: "6px",
                    width: "180px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    zIndex: 99999,
                  }}
                >
                  {["Inter", "Outfit", "Playfair Display", "Jakarta Sans", "Serif", "Monospace"].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFontFamily(f);
                        setActiveDropdown(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        textAlign: "left",
                        backgroundColor: fontFamily === f ? "#0091ff" : "transparent",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: fontFamily === f ? 800 : 500,
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{f}</span>
                      {fontFamily === f && <CheckIcon style={{ width: "14px", height: "14px" }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Font Size Input / Pill (Matching Image: [🔒 40.00]) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("fontSize")}
                onMouseEnter={() => setHoveredButton("fontSize")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "34px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  backgroundColor: activeDropdown === "fontSize" ? "#f4f4f5" : "transparent",
                  border: activeDropdown === "fontSize" ? "1.5px solid #0091ff" : "1px solid #e4e4e7",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#18181b",
                  fontFamily: "monospace",
                  minWidth: "78px",
                  justifyContent: "center",
                }}
              >
                <Lock style={{ width: "12px", height: "12px", color: "#71717a" }} />
                <span>{fontSize.toFixed(2)}</span>
              </button>
              {hoveredButton === "fontSize" && activeDropdown !== "fontSize" && (
                <Tooltip title="Font size" />
              )}

              {/* Font Size Dropdown Popover (Exact match to image) */}
              {activeDropdown === "fontSize" && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#000000",
                    border: "1px solid #27272a",
                    borderRadius: "10px",
                    padding: "4px",
                    width: "84px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    zIndex: 99999,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {[24, 32, 40, 48, 56, 64, 72].map((sz) => {
                    const isSelected = fontSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => {
                          setFontSize(sz);
                          setActiveDropdown(null);
                        }}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "6px",
                          backgroundColor: isSelected ? "#0091ff" : "transparent",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        {sz === 40 && !isSelected && (
                          <span style={{ fontSize: "11px", color: "#a1a1aa" }}>✓</span>
                        )}
                        <span>{sz}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subtle Divider */}
            <div style={{ width: "1px", height: "20px", backgroundColor: "#e4e4e7", margin: "0 2px" }} />

            {/* 3. Bold Button (B) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setIsBold(!isBold)}
                onMouseEnter={() => setHoveredButton("bold")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: isBold ? "#e4e4e7" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "#18181b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                B
              </button>
              {hoveredButton === "bold" && <Tooltip title="Bold" shortcut="⌘B" />}
            </div>

            {/* 4. Italic Button (I) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setIsItalic(!isItalic)}
                onMouseEnter={() => setHoveredButton("italic")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: isItalic ? "#e4e4e7" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: "#18181b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                I
              </button>
              {hoveredButton === "italic" && <Tooltip title="Italic" shortcut="⌘I" />}
            </div>

            {/* 5. Underline Button (U) (Exact match to image) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setIsUnderline(!isUnderline)}
                onMouseEnter={() => setHoveredButton("underline")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: isUnderline ? "#e4e4e7" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  textDecoration: "underline",
                  fontWeight: 700,
                  color: "#18181b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                U
              </button>
              {hoveredButton === "underline" && (
                <Tooltip title="Underline" shortcut="⌘U" />
              )}
            </div>

            {/* Subtle Divider */}
            <div style={{ width: "1px", height: "20px", backgroundColor: "#e4e4e7", margin: "0 2px" }} />

            {/* 6. Alignment Button (≡) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("alignment")}
                onMouseEnter={() => setHoveredButton("align")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: activeDropdown === "alignment" ? "#f4f4f5" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#18181b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {alignment === "left" && <AlignLeft style={{ width: "16px", height: "16px" }} />}
                {alignment === "center" && <AlignCenter style={{ width: "16px", height: "16px" }} />}
                {alignment === "right" && <AlignRight style={{ width: "16px", height: "16px" }} />}
              </button>
              {hoveredButton === "align" && activeDropdown !== "alignment" && (
                <Tooltip title="Alignment" />
              )}

              {/* Alignment Popover (Exact match to image: [ ≡ | ≡ | ≡ ]) */}
              {activeDropdown === "alignment" && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#000000",
                    border: "1px solid #27272a",
                    borderRadius: "10px",
                    padding: "4px",
                    display: "flex",
                    gap: "3px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    zIndex: 99999,
                  }}
                >
                  <button
                    onClick={() => {
                      setAlignment("left");
                      setActiveDropdown(null);
                    }}
                    style={{
                      width: "32px",
                      height: "30px",
                      borderRadius: "6px",
                      backgroundColor: alignment === "left" ? "#0091ff" : "transparent",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AlignLeft style={{ width: "15px", height: "15px" }} />
                  </button>
                  <button
                    onClick={() => {
                      setAlignment("center");
                      setActiveDropdown(null);
                    }}
                    style={{
                      width: "32px",
                      height: "30px",
                      borderRadius: "6px",
                      backgroundColor: alignment === "center" ? "#0091ff" : "transparent",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AlignCenter style={{ width: "15px", height: "15px" }} />
                  </button>
                  <button
                    onClick={() => {
                      setAlignment("right");
                      setActiveDropdown(null);
                    }}
                    style={{
                      width: "32px",
                      height: "30px",
                      borderRadius: "6px",
                      backgroundColor: alignment === "right" ? "#0091ff" : "transparent",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AlignRight style={{ width: "15px", height: "15px" }} />
                  </button>
                </div>
              )}
            </div>

            {/* 7. Line Height Button (↕) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("lineHeight")}
                onMouseEnter={() => setHoveredButton("lineHeight")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: activeDropdown === "lineHeight" ? "#f4f4f5" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#18181b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SlidersVertical style={{ width: "16px", height: "16px" }} />
              </button>
              {hoveredButton === "lineHeight" && activeDropdown !== "lineHeight" && (
                <Tooltip title="Line height" />
              )}

              {/* Line Height Popover */}
              {activeDropdown === "lineHeight" && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#000000",
                    border: "1px solid #27272a",
                    borderRadius: "10px",
                    padding: "4px",
                    width: "80px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    zIndex: 99999,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map((lh) => (
                    <button
                      key={lh}
                      onClick={() => {
                        setLineHeight(lh);
                        setActiveDropdown(null);
                      }}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        backgroundColor: lineHeight === lh ? "#0091ff" : "transparent",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {lh.toFixed(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Fill Color / Text Color Swatch Button (T_) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("fillColor")}
                onMouseEnter={() => setHoveredButton("fillColor")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: activeDropdown === "fillColor" ? "#f4f4f5" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#18181b",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 800, lineHeight: 1 }}>T</span>
                <span
                  style={{
                    width: "14px",
                    height: "3px",
                    backgroundColor: fillColor,
                    borderRadius: "2px",
                    marginTop: "2px",
                  }}
                />
              </button>
              {hoveredButton === "fillColor" && activeDropdown !== "fillColor" && (
                <Tooltip title="Fill color" />
              )}

              {/* Fill Color Picker Popover */}
              {activeDropdown === "fillColor" && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#000000",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    padding: "10px",
                    width: "150px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    zIndex: 99999,
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "6px",
                  }}
                >
                  {[
                    "#2563eb",
                    "#3b82f6",
                    "#60a5fa",
                    "#10b981",
                    "#4ade80",
                    "#f59e0b",
                    "#fbbf24",
                    "#ef4444",
                    "#f43f5e",
                    "#a855f7",
                    "#c084fc",
                    "#ffffff",
                    "#94a3b8",
                    "#475569",
                    "#0f172a",
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setFillColor(c);
                        setActiveDropdown(null);
                      }}
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        backgroundColor: c,
                        border: fillColor === c ? "2px solid #0091ff" : "1px solid rgba(255,255,255,0.2)",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Subtle Divider */}
            <div style={{ width: "1px", height: "20px", backgroundColor: "#e4e4e7", margin: "0 2px" }} />

            {/* 9. Edit Action Button */}
            <button
              onClick={onEditText}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: "#18181b",
                transition: "background-color 0.15s ease",
              }}
            >
              <Edit3 style={{ width: "14px", height: "14px", color: "#27272a" }} />
              <span>Edit</span>
            </button>

            {/* 10. Animation Button */}
            <button
              onClick={() => setToolbarMode("media")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: "#18181b",
                transition: "background-color 0.15s ease",
              }}
            >
              <Sparkles style={{ width: "14px", height: "14px", color: "#27272a" }} />
              <span>Animation</span>
            </button>

            {/* 11. Save Action Button (with Live Indicator) */}
            <button
              onClick={handleManualSave}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: "#18181b",
                position: "relative",
              }}
            >
              <Bookmark style={{ width: "14px", height: "14px", color: "#27272a" }} />
              <span>Save</span>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor:
                    saveStatus === "saved"
                      ? "#22c55e"
                      : saveStatus === "saving"
                      ? "#f59e0b"
                      : saveStatus === "failed"
                      ? "#ef4444"
                      : "#22c55e",
                  marginLeft: "2px",
                }}
              />
            </button>
          </>
        ) : (
          /* === MEDIA / VIDEO / CROPPING BAR MODE (Row 4 in Image) === */
          <>
            {/* Switch back to format mode */}
            <button
              onClick={() => setToolbarMode("format")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                height: "34px",
                padding: "0 8px",
                borderRadius: "8px",
                backgroundColor: "#f4f4f5",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 800,
                color: "#0091ff",
              }}
            >
              ← Text
            </button>

            {/* Crop Button */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: "#18181b",
              }}
            >
              <Crop style={{ width: "14px", height: "14px" }} />
              <span>Crop</span>
            </button>

            {/* Blur Button */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: "#18181b",
              }}
            >
              <Droplet style={{ width: "14px", height: "14px" }} />
              <span>Blur</span>
            </button>

            {/* Trim Button */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: "#18181b",
              }}
            >
              <Scissors style={{ width: "14px", height: "14px" }} />
              <span>Trim</span>
            </button>

            {/* Speed Button */}
            <button
              onClick={() => toggleDropdown("speed")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                backgroundColor: activeDropdown === "speed" ? "#f4f4f5" : "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: "#18181b",
              }}
            >
              <Gauge style={{ width: "14px", height: "14px" }} />
              <span>Speed</span>
            </button>

            {/* Loop · On Button (with Popover Dropdown) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("loop")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  height: "34px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  backgroundColor: activeDropdown === "loop" ? "#f4f4f5" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0091ff",
                }}
              >
                <RotateCw style={{ width: "14px", height: "14px", color: "#0091ff" }} />
                <span>Loop · On</span>
              </button>

              {/* Loop / Speed Popover (Exact match to image) */}
              {activeDropdown === "loop" && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#000000",
                    border: "1px solid #27272a",
                    borderRadius: "10px",
                    padding: "4px",
                    width: "100px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    zIndex: 99999,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {[0.25, 0.5, 0.75, "Normal", 1.25, 1.5, 1.75, 2, 2.25, 2.5].map((val) => {
                    const isSelected = val === 0.75;
                    return (
                      <button
                        key={String(val)}
                        onClick={() => {
                          if (typeof val === "number") setSpeed(val);
                          setActiveDropdown(null);
                        }}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "6px",
                          backgroundColor: isSelected ? "#0091ff" : "transparent",
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        {val === "Normal" && <span style={{ fontSize: "11px" }}>✓</span>}
                        <span>{val}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Animation Button */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: "#18181b",
              }}
            >
              <Sparkles style={{ width: "14px", height: "14px" }} />
              <span>Animation</span>
            </button>

            {/* Volume Button (with Slider Popover) */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("volume")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  height: "34px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  backgroundColor: activeDropdown === "volume" ? "#f4f4f5" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#18181b",
                }}
              >
                <Volume2 style={{ width: "15px", height: "15px" }} />
                <span>Volume</span>
              </button>

              {/* Volume Popover (Exact match to image) */}
              {activeDropdown === "volume" && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#000000",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    width: "240px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    zIndex: 99999,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Volume2 style={{ width: "16px", height: "16px", color: "#a1a1aa" }} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      style={{
                        flex: 1,
                        accentColor: "#0091ff",
                        height: "4px",
                        borderRadius: "2px",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", minWidth: "32px", textAlign: "right" }}>
                      {volume}%
                    </span>
                  </div>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#e4e4e7",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "4px 0",
                    }}
                  >
                    <SlidersVertical style={{ width: "12px", height: "12px" }} />
                    <span>Advanced</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Separator before Right Actions */}
        <div style={{ width: "1.5px", height: "22px", backgroundColor: "#e4e4e7", margin: "0 4px" }} />

        {/* === RIGHT SECTION: Object & Section Actions === */}

        {/* Copy / Duplicate Button (Exact match to image) */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onDuplicateSection}
            onMouseEnter={() => setHoveredButton("copy")}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Copy style={{ width: "16px", height: "16px", strokeWidth: 1.8 }} />
          </button>
          {hoveredButton === "copy" && <Tooltip title="Copy" shortcut="⌘C" />}
        </div>

        {/* Paste / Add Section Button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onAddSection}
            onMouseEnter={() => setHoveredButton("add")}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus style={{ width: "17px", height: "17px", strokeWidth: 2 }} />
          </button>
          {hoveredButton === "add" && <Tooltip title="Add Section" />}
        </div>

        {/* Move Up Button (↑) */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onMoveUp}
            onMouseEnter={() => setHoveredButton("moveUp")}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowUp style={{ width: "16px", height: "16px", strokeWidth: 1.8 }} />
          </button>
          {hoveredButton === "moveUp" && <Tooltip title="Move Up" />}
        </div>

        {/* Move Down Button (↓) */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onMoveDown}
            onMouseEnter={() => setHoveredButton("moveDown")}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowDown style={{ width: "16px", height: "16px", strokeWidth: 1.8 }} />
          </button>
          {hoveredButton === "moveDown" && <Tooltip title="Move Down" />}
        </div>

        {/* Delete Section Button (🗑) */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onDeleteSection}
            onMouseEnter={() => setHoveredButton("delete")}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 style={{ width: "16px", height: "16px", strokeWidth: 1.8 }} />
          </button>
          {hoveredButton === "delete" && <Tooltip title="Delete" shortcut="⌫" />}
        </div>

        {/* More / Grid / Drawer Button (⊞) */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onToggleDrawer}
            onMouseEnter={() => setHoveredButton("grid")}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LayoutGrid style={{ width: "16px", height: "16px", strokeWidth: 1.8 }} />
          </button>
          {hoveredButton === "grid" && <Tooltip title="Layers & Theme" />}
        </div>
      </div>
    </div>
  );
}
