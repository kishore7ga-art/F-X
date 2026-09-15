"use client";

/**
 * The interactive outline and floating toolbar around the selected element.
 *
 * Renders directly over the canvas bounding box, providing all contextual
 * text formatting (tags, fonts, sizes, line height, letter spacing, colors,
 * alignment, styles, reset) right on the element where the user is working.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Copy,
  ArrowUp,
  ArrowDown,
  Trash2,
  X,
  ChevronDown,
  Type,
  MoreHorizontal,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  Plus,
  Layers,
  Square,
} from "lucide-react";
import { Youtube } from "./YouTubeIcon";
import { uploadMedia, ApiError } from "@/lib/api-client";

import type { ElementType, SelectionState } from "@/lib/editor/selection-store";
import type {
  ElementPropsByType,
  HeadingLevel,
  LeafType,
  TextAlign,
  TextTransform,
} from "@/lib/editor/element-resolver";
import { TOOLBAR_CONFIG } from "./toolbar-config";

const RING: Record<Exclude<ElementType, "section">, string> = {
  container: "#3b82f6",
  card: "#8b5cf6",
  heading: "#ec4899",
  text: "#f59e0b",
  button: "#6366f1",
  image: "#10b981",
  video: "#06b6d4",
  youtube: "#ef4444",
  icon: "#a855f7",
  logo: "#0284c7",
  plus: "#14b8a6",
  generic: "#64748b",
};

const FONT_OPTIONS = [
  { value: "", label: "Default Font" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Outfit', sans-serif", label: "Outfit" },
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta" },
  { value: "'Playfair Display', serif", label: "Playfair" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "ui-monospace, monospace", label: "Monospace" },
];

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#0f172a",
  "#334155",
  "#64748b",
  "#94a3b8",
  "#f43f5e",
  "#ec4899",
  "#d946ef",
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ea580c",
  "#ef4444",
];

const HEADING_TAGS: HeadingLevel[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

const FONT_SIZES = [
  { value: "", label: "Auto Size" },
  { value: "12px", label: "12px" },
  { value: "14px", label: "14px" },
  { value: "16px", label: "16px" },
  { value: "18px", label: "18px" },
  { value: "20px", label: "20px" },
  { value: "24px", label: "24px" },
  { value: "28px", label: "28px" },
  { value: "32px", label: "32px" },
  { value: "36px", label: "36px" },
  { value: "40px", label: "40px" },
  { value: "48px", label: "48px" },
  { value: "56px", label: "56px" },
  { value: "64px", label: "64px" },
  { value: "72px", label: "72px" },
  { value: "80px", label: "80px" },
  { value: "96px", label: "96px" },
];

const LINE_HEIGHTS = [
  { value: "", label: "Auto" },
  { value: "1.0", label: "1.0 Compact" },
  { value: "1.2", label: "1.2 Tight" },
  { value: "1.4", label: "1.4 Normal" },
  { value: "1.6", label: "1.6 Relaxed" },
  { value: "1.8", label: "1.8 Loose" },
  { value: "2.0", label: "2.0 Double" },
];

const LETTER_SPACINGS = [
  { value: "", label: "Normal" },
  { value: "-0.05em", label: "Tighter" },
  { value: "-0.02em", label: "Tight" },
  { value: "0.02em", label: "Wide" },
  { value: "0.05em", label: "Wider" },
  { value: "0.1em", label: "Widest" },
  { value: "0.2em", label: "Spaced" },
];

export interface SelectionHighlightProps {
  type: ElementType | null;
  /** Looks up the live node for the selection; null when there is none. */
  resolveElement: () => HTMLElement | null;
  /** Changes whenever the selection or the canvas content does, to re-measure. */
  revision: string;
  selection?: SelectionState;
  isEditingText?: boolean;
  onUpdateProps?: <T extends LeafType>(id: string, props: Partial<ElementPropsByType[T]>) => void;
  onChangeHeadingLevel?: (level: HeadingLevel) => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onEditText?: () => void;
  onFinishEditing?: () => void;
  onClose?: () => void;

  // Card specific actions
  onAddMediaToCard?: (
    mediaType: "image" | "video" | "youtube",
    initialProps?: Record<string, unknown>,
    position?: "top" | "bottom" | "left" | "right",
  ) => void;
  onRemoveMediaFromCard?: () => void;
  onSelectChildMedia?: () => void;
  onInsertChildIntoCard?: (childType: "heading" | "text" | "button") => void;

  // Direct formatting actions from inPlaceEditor
  activeTextColor?: string;
  onApplyTextColor?: (hex: string) => void;
  onApplyTextFormat?: (command: "bold" | "italic" | "underline" | "removeFormat") => void;
  activeFontFamily?: string;
  onApplyFontFamily?: (font: string) => void;
  activeFontSize?: string;
  onApplyFontSize?: (size: string) => void;
  activeTextAlign?: string;
  onApplyTextAlign?: (align: "left" | "center" | "right" | "justify") => void;
  activeLineHeight?: string;
  activeLetterSpacing?: string;
  onApplyTextSpacing?: (prop: "lineHeight" | "letterSpacing", value: string) => void;
}

export function SelectionHighlight({
  type,
  resolveElement,
  revision,
  selection,
  isEditingText = false,
  onUpdateProps,
  onChangeHeadingLevel,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onEditText,
  onFinishEditing,
  onClose,
  onAddMediaToCard,
  onRemoveMediaFromCard,
  onSelectChildMedia,
  onInsertChildIntoCard,
  activeTextColor,
  onApplyTextColor,
  onApplyTextFormat,
  activeFontFamily,
  onApplyFontFamily,
  activeFontSize,
  onApplyFontSize,
  activeTextAlign,
  onApplyTextAlign,
  activeLineHeight,
  activeLetterSpacing,
  onApplyTextSpacing,
}: SelectionHighlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [showFontPopover, setShowFontPopover] = useState(false);
  const [showTagPopover, setShowTagPopover] = useState(false);
  const [showSizePopover, setShowSizePopover] = useState(false);
  const [showMorePopover, setShowMorePopover] = useState(false);

  // Card specific popover states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showCardBgPopover, setShowCardBgPopover] = useState(false);
  const [showCardStylePopover, setShowCardStylePopover] = useState(false);
  const [showCardMediaPopover, setShowCardMediaPopover] = useState(false);
  const [cardCustomUrl, setCardCustomUrl] = useState("");
  const [cardUploadStatus, setCardUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    let observed: HTMLElement | null = null;
    const observer = new ResizeObserver(() => schedule());

    const measure = () => {
      frame = 0;
      const element = resolveElement();
      if (!element || !element.isConnected) {
        setRect(null);
        return;
      }
      if (observed !== element) {
        if (observed) observer.unobserve(observed);
        observer.observe(element);
        observed = element;
      }
      setRect(element.getBoundingClientRect());
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    schedule();
    observer.observe(document.documentElement);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [resolveElement, revision]);

  // Close submenus on genuine outside click
  useEffect(() => {
    const handleOutside = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("[data-xite-floating-toolbar]") ||
          target.closest("[data-xite-toolbar]") ||
          target.closest(".xite-floating-popover"))
      ) {
        return;
      }
      setShowColorPopover(false);
      setShowFontPopover(false);
      setShowTagPopover(false);
      setShowSizePopover(false);
      setShowMorePopover(false);
      setShowCardBgPopover(false);
      setShowCardStylePopover(false);
      setShowCardMediaPopover(false);
    };
    window.addEventListener("pointerdown", handleOutside);
    window.addEventListener("mousedown", handleOutside);
    return () => {
      window.removeEventListener("pointerdown", handleOutside);
      window.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  const activeElement = resolveElement();
  const effectiveType = type || (activeElement?.tagName.toLowerCase().startsWith("h") ? "heading" : activeElement ? "text" : null);

  if (!rect || !effectiveType || effectiveType === "section") return null;

  const colour = RING[effectiveType] || "#6366f1";
  const label = TOOLBAR_CONFIG[effectiveType]?.badge || (effectiveType === "heading" ? "Heading" : "Text");
  const isNearTop = rect.top < 52;
  const isTextLike = effectiveType === "heading" || effectiveType === "text";

  const selectedId = selection?.selectedId;
  const meta = (selection?.meta ?? {}) as Record<string, any>;

  // Current props extraction with live inPlaceEditor fallback
  const currentColor = activeTextColor || meta.color || (effectiveType === "heading" ? "#0f172a" : "#334155");
  const rawFontSize = activeFontSize || String(meta.fontSize || (effectiveType === "heading" ? "32px" : "16px"));
  const parsedFontSize = parseInt(rawFontSize, 10) || (effectiveType === "heading" ? 32 : 16);
  const currentFontFamily = activeFontFamily || meta.fontFamily || "";
  const currentWeight = String(meta.fontWeight || (effectiveType === "heading" ? "700" : "400"));
  const isBold = parseInt(currentWeight, 10) >= 600 || currentWeight === "bold";
  const currentAlign = (activeTextAlign || meta.textAlign || "left") as TextAlign;
  const currentTransform = (meta.textTransform || "none") as TextTransform;
  const currentLevel = (meta.level || (effectiveType === "heading" ? "h2" : "p")) as HeadingLevel;
  const currentLineHeight = activeLineHeight || meta.lineHeight || "";
  const currentLetterSpacing = activeLetterSpacing || meta.letterSpacing || "";

  // Handlers that work seamlessly in both selection mode and contentEditable mode with instant live DOM reflection
  const handleColorChange = (hex: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("color", hex, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyTextColor) onApplyTextColor(hex);
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { color: hex } as any);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const nextSize = Math.max(10, Math.min(140, parsedFontSize + delta));
    const sizeStr = `${nextSize}px`;
    const el = resolveElement();
    if (el) {
      el.style.setProperty("font-size", sizeStr, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyFontSize) onApplyFontSize(sizeStr);
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { fontSize: sizeStr } as any);
    }
  };

  const handleSelectExactSize = (sizeStr: string) => {
    const el = resolveElement();
    if (el) {
      if (sizeStr) {
        el.style.setProperty("font-size", sizeStr, "important");
      } else {
        el.style.removeProperty("font-size");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyFontSize) onApplyFontSize(sizeStr);
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { fontSize: sizeStr } as any);
    }
    setShowSizePopover(false);
  };

  const handleFontFamilyChange = (font: string) => {
    const el = resolveElement();
    if (el) {
      if (font) {
        el.style.setProperty("font-family", font, "important");
      } else {
        el.style.removeProperty("font-family");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyFontFamily) onApplyFontFamily(font);
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { fontFamily: font } as any);
    }
    setShowFontPopover(false);
  };

  const handleToggleBold = () => {
    const el = resolveElement();
    const nextWeight = isBold ? "400" : "700";
    if (el) {
      el.style.setProperty("font-weight", nextWeight, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyTextFormat) onApplyTextFormat("bold");
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { fontWeight: nextWeight } as any);
    }
  };

  const handleToggleItalic = () => {
    const el = resolveElement();
    if (el) {
      const currentStyle = window.getComputedStyle(el).fontStyle;
      el.style.setProperty("font-style", currentStyle === "italic" ? "normal" : "italic", "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyTextFormat) onApplyTextFormat("italic");
  };

  const handleToggleUnderline = () => {
    const el = resolveElement();
    if (el) {
      const currentDec = window.getComputedStyle(el).textDecoration;
      el.style.setProperty("text-decoration", currentDec.includes("underline") ? "none" : "underline", "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyTextFormat) onApplyTextFormat("underline");
  };

  const handleResetFormat = () => {
    const el = resolveElement();
    if (el) {
      el.style.removeProperty("font-weight");
      el.style.removeProperty("font-style");
      el.style.removeProperty("text-decoration");
      el.style.removeProperty("font-family");
      el.style.removeProperty("font-size");
      el.style.removeProperty("text-align");
      el.style.removeProperty("text-transform");
      el.style.removeProperty("line-height");
      el.style.removeProperty("letter-spacing");
      el.style.removeProperty("color");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyTextFormat) onApplyTextFormat("removeFormat");
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, {
        fontWeight: "400",
        fontFamily: "",
        textAlign: "left",
        textTransform: "none",
        lineHeight: "",
        letterSpacing: "",
      } as any);
    }
  };

  const handleCycleCase = () => {
    const el = resolveElement();
    const order: TextTransform[] = ["none", "uppercase", "capitalize"];
    const nextIdx = (order.indexOf(currentTransform) + 1) % order.length;
    const nextCase = order[nextIdx];
    if (el) {
      el.style.setProperty("text-transform", nextCase === "none" ? "none" : nextCase, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { textTransform: nextCase } as any);
    }
  };

  const handleAlignChange = (align: TextAlign) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("text-align", align, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyTextAlign) onApplyTextAlign(align);
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { textAlign: align } as any);
    }
  };

  const handleTagChange = (tag: HeadingLevel) => {
    if (onChangeHeadingLevel) {
      onChangeHeadingLevel(tag);
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { level: tag } as any);
    }
    setShowTagPopover(false);
  };

  const handleLineHeightChange = (val: string) => {
    const el = resolveElement();
    if (el) {
      if (val) el.style.setProperty("line-height", val, "important");
      else el.style.removeProperty("line-height");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyTextSpacing) onApplyTextSpacing("lineHeight", val);
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { lineHeight: val } as any);
    }
  };

  const handleLetterSpacingChange = (val: string) => {
    const el = resolveElement();
    if (el) {
      if (val) el.style.setProperty("letter-spacing", val, "important");
      else el.style.removeProperty("letter-spacing");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (onApplyTextSpacing) onApplyTextSpacing("letterSpacing", val);
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { letterSpacing: val } as any);
    }
  };

  // Card-specific props & live inspection
  const cardBg = meta.background || "#ffffff";
  const cardRadius = meta.radius || "16px";
  const cardBorderWidth = meta.borderWidth || "0px";
  const cardBorderColor = meta.borderColor || "#e2e8f0";
  const cardShadow = meta.shadow || "none";
  const cardHasMedia = Boolean(
    meta.hasMedia ||
      (activeElement &&
        (activeElement.querySelector("img, video, iframe, [data-xite-video], [data-xite-youtube]") ||
          activeElement.querySelector(".card-media, .image-wrapper")))
  );
  const cardMediaType =
    meta.mediaType ||
    (activeElement?.querySelector("video, [data-xite-video]")
      ? "video"
      : activeElement?.querySelector("iframe, [data-xite-youtube]")
      ? "youtube"
      : "image");

  const handleCardBgChange = (hex: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("background-color", hex, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { background: hex } as any);
    }
  };

  const handleCardRadiusChange = (rad: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("border-radius", rad, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { radius: rad } as any);
    }
  };

  const handleCardBorderWidthChange = (w: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("border-width", w, "important");
      el.style.setProperty("border-style", "solid", "important");
      el.style.setProperty("border-color", cardBorderColor || "#e2e8f0", "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { borderWidth: w, borderColor: cardBorderColor || "#e2e8f0" } as any);
    }
  };

  const handleCardBorderColorChange = (c: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("border-color", c, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { borderColor: c } as any);
    }
  };

  const handleCardShadowChange = (sh: string) => {
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { shadow: sh as any });
    }
  };

  const handleCardFileUpload = async (file: File | undefined) => {
    if (!file || !onAddMediaToCard) return;
    const isVideo = file.type.startsWith("video/");
    setCardUploadStatus(`Uploading ${file.name}…`);
    try {
      const { url } = await uploadMedia(file);
      onAddMediaToCard(isVideo ? "video" : "image", { src: url }, "top");
      setCardUploadStatus(null);
      setShowCardMediaPopover(false);
    } catch (err) {
      setCardUploadStatus(err instanceof ApiError ? err.message : "Upload failed");
    }
  };

  const handleAddCustomMediaUrl = () => {
    if (!cardCustomUrl.trim() || !onAddMediaToCard) return;
    const url = cardCustomUrl.trim();
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      onAddMediaToCard("youtube", { url }, "top");
    } else if (/\.(mp4|webm|ogg|mov)($|\?)/i.test(url)) {
      onAddMediaToCard("video", { src: url }, "top");
    } else {
      onAddMediaToCard("image", { src: url }, "top");
    }
    setCardCustomUrl("");
    setShowCardMediaPopover(false);
  };

  // Compute horizontal positioning so toolbar is anchored at the END (right side) of the element
  const toolbarRight = Math.max(420, Math.min(rect.right, window.innerWidth - 12));

  return (
    <>
      {/* 1. Bounding Outline Box */}
      <div
        aria-hidden
        className="pointer-events-none fixed z-[9998] transition-all duration-75"
        style={{
          top: rect.top - 2,
          left: rect.left - 2,
          width: rect.width + 4,
          height: rect.height + 4,
          border: `2px solid ${colour}`,
          borderRadius: 6,
          boxShadow: `0 0 0 3px ${colour}33`,
        }}
      >
        {/* Badge */}
        <span
          className={`absolute ${
            isNearTop ? "top-1 left-1" : "-top-5 left-0"
          } rounded px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white shadow-xs select-none`}
          style={{ background: colour }}
        >
          {label}
        </span>
      </div>

      {/* 2. Floating Contextual Toolbar - Modern Sleek Pill UI */}
      <div
        data-xite-floating-toolbar=""
        data-xite-toolbar=""
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed z-[99999] pointer-events-auto flex items-center gap-1 bg-white/95 text-slate-700 backdrop-blur-md border border-slate-200/90 shadow-[0_10px_35px_-4px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 text-xs select-none transition-all duration-75"
        style={{
          top: isNearTop ? `${rect.bottom + 8}px` : `${Math.max(6, rect.top - 46)}px`,
          left: `${toolbarRight}px`,
          transform: "translateX(-100%)",
        }}
      >
        {isTextLike ? (
          <>
            {/* 1. Tag / Heading Level Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTagPopover(!showTagPopover);
                  setShowFontPopover(false);
                  setShowColorPopover(false);
                  setShowSizePopover(false);
                  setShowMorePopover(false);
                }}
                title="Change semantic tag (H1-H6, P)"
                className="flex items-center gap-1 rounded-xl px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-[11.5px] font-bold text-slate-800 border border-slate-200/80 transition cursor-pointer"
              >
                <span className="font-extrabold text-pink-600">{currentLevel.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showTagPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col gap-0.5 z-[100000] min-w-[110px]"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {HEADING_TAGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagChange(t);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] font-semibold text-left transition cursor-pointer ${
                        currentLevel === t
                          ? "bg-pink-50 text-pink-600 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{t.toUpperCase()}</span>
                      <span className="text-[9px] opacity-60">Heading {t.slice(1)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Font Family Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFontPopover(!showFontPopover);
                  setShowTagPopover(false);
                  setShowColorPopover(false);
                  setShowSizePopover(false);
                  setShowMorePopover(false);
                }}
                title="Font Family"
                className="flex items-center gap-1 rounded-xl px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-[11.5px] font-medium text-slate-800 border border-slate-200/80 transition max-w-[120px] truncate cursor-pointer"
              >
                <Type className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">
                  {FONT_OPTIONS.find((f) => f.value === currentFontFamily)?.label || "Font"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {showFontPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col gap-0.5 z-[100000] min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFontFamilyChange(font.value);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium text-left transition cursor-pointer ${
                        currentFontFamily === font.value
                          ? "bg-blue-50 text-blue-600 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Font Size Stepper & Dropdown */}
            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200/80 p-0.5 relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFontSizeChange(-2);
                }}
                title="Decrease font size"
                className="w-5 h-5 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 text-xs font-bold transition cursor-pointer"
              >
                −
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSizePopover(!showSizePopover);
                  setShowTagPopover(false);
                  setShowFontPopover(false);
                  setShowColorPopover(false);
                  setShowMorePopover(false);
                }}
                className="px-1.5 text-[11px] font-mono font-bold text-slate-800 min-w-[28px] text-center hover:text-blue-600 transition cursor-pointer"
              >
                {parsedFontSize}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFontSizeChange(2);
                }}
                title="Increase font size"
                className="w-5 h-5 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 text-xs font-bold transition cursor-pointer"
              >
                +
              </button>

              {showSizePopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xl grid grid-cols-3 gap-0.5 z-[100000] w-48"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {FONT_SIZES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectExactSize(s.value);
                      }}
                      className={`px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold text-center transition cursor-pointer ${
                        rawFontSize === s.value
                          ? "bg-blue-50 text-blue-600 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* 4. Bold (B) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleBold();
              }}
              title="Bold"
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                isBold
                  ? "bg-slate-900 text-white shadow-xs font-black"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* 5. Text Color Swatch & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPopover(!showColorPopover);
                  setShowFontPopover(false);
                  setShowTagPopover(false);
                  setShowSizePopover(false);
                  setShowMorePopover(false);
                }}
                title="Text Color"
                className="p-1 rounded-xl hover:bg-slate-100 flex items-center gap-1 border border-slate-200/80 transition cursor-pointer"
              >
                <span
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                  style={{ background: currentColor }}
                />
              </button>

              {showColorPopover && (
                <div
                  className="xite-floating-popover absolute top-full right-0 mt-1.5 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col gap-2 z-[100000] w-48 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Colors
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PRESET_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleColorChange(hex);
                          setShowColorPopover(false);
                        }}
                        className="w-5 h-5 rounded-full border border-slate-200 hover:scale-115 transition shadow-xs cursor-pointer"
                        style={{ background: hex }}
                      />
                    ))}
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                    <input
                      type="color"
                      value={currentColor.startsWith("#") ? currentColor : "#ffffff"}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="flex-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-800 uppercase focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 6. More Options Popover Button (All Other Options As Pop) */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMorePopover(!showMorePopover);
                  setShowColorPopover(false);
                  setShowFontPopover(false);
                  setShowTagPopover(false);
                  setShowSizePopover(false);
                }}
                title="More text formatting & alignment options"
                className={`p-1.5 rounded-xl border border-slate-200/80 transition cursor-pointer flex items-center gap-1 ${
                  showMorePopover
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* All Other Options Popover Menu */}
              {showMorePopover && (
                <div
                  className="xite-floating-popover absolute top-full right-0 mt-1.5 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col gap-3 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Style Row: Italic, Underline, Reset, Case */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Text Style
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleItalic();
                        }}
                        title="Italic"
                        className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition cursor-pointer flex-1 flex justify-center"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleUnderline();
                        }}
                        title="Underline"
                        className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition cursor-pointer flex-1 flex justify-center"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetFormat();
                        }}
                        title="Reset formatting"
                        className="p-1 rounded-lg text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-xs transition cursor-pointer flex-1 flex justify-center"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCycleCase();
                        }}
                        title={`Case: ${currentTransform}`}
                        className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer flex-1 text-center ${
                          currentTransform !== "none"
                            ? "bg-purple-50 text-purple-600 font-bold"
                            : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs"
                        }`}
                      >
                        {currentTransform === "uppercase"
                          ? "AA"
                          : currentTransform === "capitalize"
                          ? "Ab"
                          : "Aa"}
                      </button>
                    </div>
                  </div>

                  {/* Alignment Row */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Alignment
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlignChange("left");
                        }}
                        title="Align Left"
                        className={`p-1 rounded-lg transition cursor-pointer flex-1 flex justify-center ${
                          currentAlign === "left"
                            ? "bg-white text-blue-600 shadow-xs font-bold"
                            : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlignChange("center");
                        }}
                        title="Align Center"
                        className={`p-1 rounded-lg transition cursor-pointer flex-1 flex justify-center ${
                          currentAlign === "center"
                            ? "bg-white text-blue-600 shadow-xs font-bold"
                            : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                        }`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlignChange("right");
                        }}
                        title="Align Right"
                        className={`p-1 rounded-lg transition cursor-pointer flex-1 flex justify-center ${
                          currentAlign === "right"
                            ? "bg-white text-blue-600 shadow-xs font-bold"
                            : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                        }`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlignChange("justify");
                        }}
                        title="Align Justify"
                        className={`p-1 rounded-lg transition cursor-pointer flex-1 flex justify-center ${
                          currentAlign === "justify"
                            ? "bg-white text-blue-600 shadow-xs font-bold"
                            : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                        }`}
                      >
                        <AlignJustify className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Line Height */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Line Height
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {LINE_HEIGHTS.map((lh) => (
                        <button
                          key={lh.value}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLineHeightChange(lh.value);
                          }}
                          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-medium text-center transition cursor-pointer ${
                            currentLineHeight === lh.value
                              ? "bg-blue-50 text-blue-600 font-bold border border-blue-200"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {lh.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Letter Spacing
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {LETTER_SPACINGS.map((ls) => (
                        <button
                          key={ls.value}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLetterSpacingChange(ls.value);
                          }}
                          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-medium text-center transition cursor-pointer ${
                            currentLetterSpacing === ls.value
                              ? "bg-blue-50 text-blue-600 font-bold border border-blue-200"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {ls.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Element Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                    {onDuplicate && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate();
                        }}
                        title="Duplicate element"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Duplicate</span>
                      </button>
                    )}
                    {onMoveUp && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveUp();
                        }}
                        title="Move Up"
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onMoveDown && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveDown();
                        }}
                        title="Move Down"
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                        }}
                        title="Delete element"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[10px] font-bold text-red-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : effectiveType === "card" ? (
          <>
            {/* Hidden file input for direct card media upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                void handleCardFileUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            {/* 1. Card Background Color Swatch & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardBgPopover(!showCardBgPopover);
                  setShowCardStylePopover(false);
                  setShowCardMediaPopover(false);
                }}
                title="Card Background Color"
                className="p-1 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 border border-slate-200/80 transition cursor-pointer text-[11px] font-semibold text-slate-700 bg-slate-50"
              >
                <span
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-xs shrink-0"
                  style={{ background: cardBg }}
                />
                <span className="text-[10.5px] font-mono uppercase">{cardBg.slice(0, 7)}</span>
              </button>

              {showCardBgPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-1.5 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col gap-2 z-[100000] w-48 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Card Background
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PRESET_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardBgChange(hex);
                          setShowCardBgPopover(false);
                        }}
                        className="w-5 h-5 rounded-full border border-slate-200 hover:scale-115 transition shadow-xs cursor-pointer"
                        style={{ background: hex }}
                      />
                    ))}
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                    <input
                      type="color"
                      value={cardBg.startsWith("#") ? cardBg : "#ffffff"}
                      onChange={(e) => handleCardBgChange(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={cardBg}
                      onChange={(e) => handleCardBgChange(e.target.value)}
                      className="flex-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-800 uppercase focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Shape, Border & Shadow Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardStylePopover(!showCardStylePopover);
                  setShowCardBgPopover(false);
                  setShowCardMediaPopover(false);
                }}
                title="Card Shape, Border & Shadow"
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold border transition cursor-pointer ${
                  showCardStylePopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <Square className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                <span>Border & Shape</span>
              </button>

              {showCardStylePopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-1.5 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col gap-3 z-[100000] w-60 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Corner Radius */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                      <span>Corner Radius</span>
                      <span className="font-mono text-slate-600">{cardRadius}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {["0px", "8px", "12px", "16px", "24px", "32px"].map((rad) => (
                        <button
                          key={rad}
                          type="button"
                          onClick={() => handleCardRadiusChange(rad)}
                          className={`py-0.5 rounded-lg text-[10px] font-mono font-bold text-center transition cursor-pointer ${
                            cardRadius === rad
                              ? "bg-violet-50 text-violet-700 border border-violet-200 font-black"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                          }`}
                        >
                          {rad.replace("px", "")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Width & Color */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Border Width & Colour
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="grid grid-cols-5 gap-1 flex-1">
                        {["0px", "1px", "2px", "3px", "4px"].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => handleCardBorderWidthChange(w)}
                            className={`py-0.5 rounded-lg text-[10px] font-mono font-bold text-center transition cursor-pointer ${
                              cardBorderWidth === w
                                ? "bg-violet-50 text-violet-700 border border-violet-200 font-black"
                                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                            }`}
                          >
                            {w.replace("px", "")}
                          </button>
                        ))}
                      </div>
                      <input
                        type="color"
                        value={cardBorderColor.startsWith("#") ? cardBorderColor : "#e2e8f0"}
                        onChange={(e) => handleCardBorderColorChange(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                        title="Border Color"
                      />
                    </div>
                  </div>

                  {/* Shadow Presets */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Shadow
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {["none", "sm", "md", "lg", "xl"].map((sh) => (
                        <button
                          key={sh}
                          type="button"
                          onClick={() => handleCardShadowChange(sh)}
                          className={`py-0.5 rounded-lg text-[10px] font-bold uppercase text-center transition cursor-pointer ${
                            cardShadow === sh
                              ? "bg-violet-50 text-violet-700 border border-violet-200 font-black"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                          }`}
                        >
                          {sh}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* 3. Media Controls Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardMediaPopover(!showCardMediaPopover);
                  setShowCardBgPopover(false);
                  setShowCardStylePopover(false);
                }}
                title="Add or Manage Media in Card"
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold border transition cursor-pointer ${
                  showCardMediaPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : cardHasMedia
                    ? "bg-violet-50 text-violet-700 border-violet-200/80"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/80"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{cardHasMedia ? "Media" : "+ Media"}</span>
              </button>

              {showCardMediaPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-1.5 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col gap-2.5 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {cardHasMedia ? (
                    <>
                      <div className="flex items-center justify-between text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-1 rounded-lg border border-violet-200/60">
                        <span className="capitalize">{cardMediaType} in Card</span>
                        {onSelectChildMedia && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectChildMedia();
                              setShowCardMediaPopover(false);
                            }}
                            className="underline hover:text-violet-900 cursor-pointer"
                          >
                            Edit Settings
                          </button>
                        )}
                      </div>

                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                        Replace Media
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("image", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1 rounded-lg text-[10.5px] font-bold bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <ImageIcon className="w-3 h-3 text-emerald-600" />
                          Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("video", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1 rounded-lg text-[10.5px] font-bold bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <VideoIcon className="w-3 h-3 text-cyan-600" />
                          Video
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("youtube", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1 rounded-lg text-[10.5px] font-bold bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <Youtube className="w-3 h-3 text-rose-600" />
                          YouTube
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-1 w-full py-1 rounded-lg text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-slate-500" />
                        Upload New File
                      </button>

                      {onRemoveMediaFromCard && (
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveMediaFromCard();
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 w-full py-1 rounded-lg text-[10.5px] font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove Media
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                        Add Media to Card
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("image", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition cursor-pointer"
                        >
                          <ImageIcon className="w-3 h-3" />
                          Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("video", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200/80 transition cursor-pointer"
                        >
                          <VideoIcon className="w-3 h-3" />
                          Video
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("youtube", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition cursor-pointer"
                        >
                          <Youtube className="w-3 h-3" />
                          YouTube
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-[10.5px] font-bold bg-slate-900 text-white hover:bg-slate-700 transition cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload File
                      </button>

                      <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                        <input
                          type="url"
                          value={cardCustomUrl}
                          onChange={(e) => setCardCustomUrl(e.target.value)}
                          placeholder="Paste URL…"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddCustomMediaUrl();
                          }}
                          className="flex-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomMediaUrl}
                          className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-[10.5px] font-bold text-slate-800 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </>
                  )}
                  {cardUploadStatus && (
                    <div className="text-[9.5px] font-semibold text-slate-500 text-center">{cardUploadStatus}</div>
                  )}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* 4. Add Child Content: Heading, Text, Button */}
            {onInsertChildIntoCard && (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onInsertChildIntoCard("heading")}
                  title="Add Heading into this Card"
                  className="flex items-center gap-0.5 px-2 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-[10.5px] font-bold border border-pink-200/80 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Heading</span>
                </button>
                <button
                  type="button"
                  onClick={() => onInsertChildIntoCard("text")}
                  title="Add Text into this Card"
                  className="flex items-center gap-0.5 px-2 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10.5px] font-bold border border-amber-200/80 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => onInsertChildIntoCard("button")}
                  title="Add Button into this Card"
                  className="flex items-center gap-0.5 px-2 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10.5px] font-bold border border-indigo-200/80 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Button</span>
                </button>
              </div>
            )}

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* 5. Common Actions: Duplicate, Move, Delete */}
            <div className="flex items-center gap-0.5">
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  title="Duplicate Card"
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
              {onMoveUp && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp();
                  }}
                  title="Move Card Up"
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}
              {onMoveDown && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown();
                  }}
                  title="Move Card Down"
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  title="Delete Card"
                  className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        ) : null}

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Deselect (Esc)"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer ml-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </>
  );
}
