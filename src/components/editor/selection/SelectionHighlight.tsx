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
  Edit3,
  Check,
  ChevronDown,
  Type,
  Palette,
  MoreHorizontal,
} from "lucide-react";

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

  // Handlers that work seamlessly in both selection mode and contentEditable mode
  const handleColorChange = (hex: string) => {
    if (onApplyTextColor) onApplyTextColor(hex);
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.color = hex;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { color: hex } as any);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const nextSize = Math.max(10, Math.min(140, parsedFontSize + delta));
    const sizeStr = `${nextSize}px`;
    if (onApplyFontSize) onApplyFontSize(sizeStr);
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.fontSize = sizeStr;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { fontSize: sizeStr } as any);
    }
  };

  const handleSelectExactSize = (sizeStr: string) => {
    if (onApplyFontSize) onApplyFontSize(sizeStr);
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.fontSize = sizeStr;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { fontSize: sizeStr } as any);
    }
    setShowSizePopover(false);
  };

  const handleFontFamilyChange = (font: string) => {
    if (onApplyFontFamily) onApplyFontFamily(font);
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.fontFamily = font;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { fontFamily: font } as any);
    }
    setShowFontPopover(false);
  };

  const handleToggleBold = () => {
    if (onApplyTextFormat) onApplyTextFormat("bold");
    const nextWeight = isBold ? "400" : "700";
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.fontWeight = nextWeight;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { fontWeight: nextWeight } as any);
    }
  };

  const handleToggleItalic = () => {
    if (onApplyTextFormat) onApplyTextFormat("italic");
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.fontStyle = activeEl.style.fontStyle === "italic" ? "normal" : "italic";
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const handleToggleUnderline = () => {
    if (onApplyTextFormat) onApplyTextFormat("underline");
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.textDecoration = activeEl.style.textDecoration === "underline" ? "none" : "underline";
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const handleResetFormat = () => {
    if (onApplyTextFormat) onApplyTextFormat("removeFormat");
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.fontWeight = "";
      activeEl.style.fontStyle = "";
      activeEl.style.textDecoration = "";
      activeEl.style.fontFamily = "";
      activeEl.style.fontSize = "";
      activeEl.style.textAlign = "";
      activeEl.style.textTransform = "";
      activeEl.style.lineHeight = "";
      activeEl.style.letterSpacing = "";
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
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
    const order: TextTransform[] = ["none", "uppercase", "capitalize"];
    const nextIdx = (order.indexOf(currentTransform) + 1) % order.length;
    const nextCase = order[nextIdx];
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.textTransform = nextCase;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { textTransform: nextCase } as any);
    }
  };

  const handleAlignChange = (align: TextAlign) => {
    if (onApplyTextAlign) onApplyTextAlign(align);
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.textAlign = align;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { textAlign: align } as any);
    }
  };

  const handleTagChange = (tag: HeadingLevel) => {
    if (onChangeHeadingLevel) {
      onChangeHeadingLevel(tag);
    }
    const activeEl = resolveElement();
    if (activeEl && activeEl.tagName.toLowerCase() !== tag.toLowerCase()) {
      const newHeading = document.createElement(tag);
      for (let i = 0; i < activeEl.attributes.length; i++) {
        const attr = activeEl.attributes[i]!;
        newHeading.setAttribute(attr.name, attr.value);
      }
      while (activeEl.firstChild) {
        newHeading.appendChild(activeEl.firstChild);
      }
      activeEl.replaceWith(newHeading);
      newHeading.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { level: tag } as any);
    }
    setShowTagPopover(false);
  };

  const handleLineHeightChange = (val: string) => {
    if (onApplyTextSpacing) onApplyTextSpacing("lineHeight", val);
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.lineHeight = val;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { lineHeight: val } as any);
    }
  };

  const handleLetterSpacingChange = (val: string) => {
    if (onApplyTextSpacing) onApplyTextSpacing("letterSpacing", val);
    const activeEl = resolveElement();
    if (activeEl) {
      activeEl.style.letterSpacing = val;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps && effectiveType) {
      onUpdateProps(selectedId, { letterSpacing: val } as any);
    }
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
