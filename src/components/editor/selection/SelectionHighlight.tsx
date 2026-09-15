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
  Minus,
  Layers,
  Square,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { Youtube } from "./YouTubeIcon";
import { uploadMedia, ApiError } from "@/lib/api-client";
import { calculateOppositeContrast } from "@/lib/editor-themes";
import { hexFromValue } from "@/lib/sections/section-edit";

import type { ElementType, SelectionState } from "@/lib/editor/selection-store";
import {
  extractYouTubeVideoId,
  getEffectiveElementBackground,
  BUTTON_SIZE_PADDING,
  BUTTON_SIZE_FONT,
  type ButtonSize,
  type ElementPropsByType,
  type HeadingLevel,
  type LeafType,
  type TextAlign,
  type TextTransform,
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
  onReplaceMedia?: (targetType: "image" | "video" | "youtube", props?: Record<string, unknown>) => void;

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
  onReplaceMedia,
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
  const toolbarRef = useRef<HTMLDivElement | null>(null);
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

  // Image specific popover states
  const [showImageMediaPopover, setShowImageMediaPopover] = useState(false);
  const [showImageFitPopover, setShowImageFitPopover] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);

  // Video specific popover states
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);
  const [showVideoMediaPopover, setShowVideoMediaPopover] = useState(false);
  const [showVideoPlaybackPopover, setShowVideoPlaybackPopover] = useState(false);
  const [videoUploadStatus, setVideoUploadStatus] = useState<string | null>(null);
  const [posterUploadStatus, setPosterUploadStatus] = useState<string | null>(null);

  // YouTube specific popover states
  const [showYoutubeMediaPopover, setShowYoutubeMediaPopover] = useState(false);
  const [showYoutubePlaybackPopover, setShowYoutubePlaybackPopover] = useState(false);

  // Button specific popover states
  const [showButtonLinkPopover, setShowButtonLinkPopover] = useState(false);
  const [showButtonFillPopover, setShowButtonFillPopover] = useState(false);
  const [showButtonRadiusPopover, setShowButtonRadiusPopover] = useState(false);

  // Generic element specific popover states
  const [showGenericBgPopover, setShowGenericBgPopover] = useState(false);
  const [showGenericColorPopover, setShowGenericColorPopover] = useState(false);
  const [showGenericStylePopover, setShowGenericStylePopover] = useState(false);

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
      setShowImageMediaPopover(false);
      setShowImageFitPopover(false);
      setShowVideoMediaPopover(false);
      setShowVideoPlaybackPopover(false);
      setShowYoutubeMediaPopover(false);
      setShowYoutubePlaybackPopover(false);
      setShowButtonLinkPopover(false);
      setShowButtonFillPopover(false);
      setShowButtonRadiusPopover(false);
      setShowGenericBgPopover(false);
      setShowGenericColorPopover(false);
      setShowGenericStylePopover(false);
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

  const effectiveBg = getEffectiveElementBackground(activeElement);
  const autoContrastColor = calculateOppositeContrast(effectiveBg).textColor;
  const rawElementColor = activeElement?.style.color
    ? hexFromValue(activeElement.style.color, autoContrastColor)
    : autoContrastColor;

  // Current props extraction with live inPlaceEditor fallback:
  // Auto-matches the background's high contrast color before the user sets an explicit color
  const currentColor = activeTextColor || meta.color || rawElementColor;
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
      el.setAttribute("data-xite-user-color", "true");
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
      const autoTextColor = calculateOppositeContrast(hex).textColor;
      const autoMutedColor = autoTextColor === "#ffffff" ? "#cbd5e1" : "#64748b";
      const textNodes = Array.from(el.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, p, span, li"));
      for (const node of textNodes) {
        if (!node.getAttribute("data-xite-user-color") && !node.closest("button, [data-xite-user-color='true']")) {
          const isHeading = /^h[1-6]$/i.test(node.tagName);
          node.style.setProperty("color", isHeading ? autoTextColor : autoMutedColor, "important");
        }
      }
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

  // Container-specific props & live mutation handlers
  const containerGap = meta.gap || "16px";
  const containerGapNum = parseInt(containerGap, 10) || 0;
  const containerDisplay =
    meta.display ||
    (activeElement
      ? window.getComputedStyle(activeElement).display.includes("grid")
        ? "grid"
        : window.getComputedStyle(activeElement).display.includes("flex")
        ? "flex"
        : "block"
      : "flex");

  const handleContainerDisplayChange = (disp: "flex" | "grid" | "block") => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("display", disp, "important");
      if (disp === "grid") {
        el.style.setProperty("grid-template-columns", "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", "important");
        el.style.setProperty("width", "100%", "important");
      } else if (disp === "flex") {
        el.style.removeProperty("grid-template-columns");
        el.style.setProperty("flex-wrap", "wrap", "important");
        el.style.setProperty("align-items", "center", "important");
        el.style.setProperty("justify-content", "space-between", "important");
        el.style.setProperty("width", "100%", "important");
      } else {
        el.style.removeProperty("grid-template-columns");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { display: disp } as any);
    }
  };

  const handleContainerGapStep = (delta: number) => {
    const next = Math.max(0, containerGapNum + delta);
    const gapStr = `${next}px`;
    const el = resolveElement();
    if (el) {
      el.style.setProperty("gap", gapStr, "important");
      if (el.style.display === "grid" && !el.style.gridTemplateColumns) {
        el.style.setProperty("grid-template-columns", "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", "important");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { gap: gapStr } as any);
    }
  };

  const handleContainerGapInput = (val: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("gap", val, "important");
      if (el.style.display === "grid" && !el.style.gridTemplateColumns) {
        el.style.setProperty("grid-template-columns", "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", "important");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { gap: val } as any);
    }
  };
  // Image-specific props & live mutation handlers
  const imageSrc = meta.src || (activeElement instanceof HTMLImageElement ? activeElement.src : "");
  const imageAlt = meta.alt || (activeElement instanceof HTMLImageElement ? activeElement.alt : "");
  const imageFit = (meta.objectFit || "cover") as "cover" | "contain" | "fill";
  const imageRadius = meta.radius || "0px";

  const handleImageSrcChange = (src: string) => {
    const el = resolveElement();
    if (el) {
      if (el instanceof HTMLImageElement) {
        el.src = src;
      } else {
        const img = el.querySelector("img");
        if (img) img.src = src;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { src } as any);
    }
  };

  const handleImageAltChange = (alt: string) => {
    const el = resolveElement();
    if (el) {
      if (el instanceof HTMLImageElement) {
        el.alt = alt;
      } else {
        const img = el.querySelector("img");
        if (img) img.alt = alt;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { alt } as any);
    }
  };

  const handleImageFitChange = (fit: "cover" | "contain" | "fill") => {
    const el = resolveElement();
    if (el) {
      if (el instanceof HTMLImageElement) {
        el.style.setProperty("object-fit", fit, "important");
      } else {
        const img = el.querySelector("img");
        if (img) img.style.setProperty("object-fit", fit, "important");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { objectFit: fit } as any);
    }
  };

  const handleImageRadiusChange = (rad: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("border-radius", rad, "important");
      const img = el.querySelector("img");
      if (img) img.style.setProperty("border-radius", rad, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { radius: rad } as any);
    }
  };

  const handleImageFileUpload = async (file: File | undefined) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    if (isVideo && onReplaceMedia) {
      setImageUploadStatus(`Uploading video ${file.name}…`);
      try {
        const { url } = await uploadMedia(file);
        onReplaceMedia("video", { src: url });
        setImageUploadStatus(null);
        setShowImageMediaPopover(false);
      } catch (err) {
        setImageUploadStatus(err instanceof ApiError ? err.message : "Upload failed");
      }
      return;
    }
    setImageUploadStatus(`Uploading ${file.name}…`);
    try {
      const { url } = await uploadMedia(file);
      handleImageSrcChange(url);
      setImageUploadStatus(null);
      setShowImageMediaPopover(false);
    } catch (err) {
      setImageUploadStatus(err instanceof ApiError ? err.message : "Upload failed");
    }
  };

  // Video-specific props & live mutation handlers
  const videoSrc = meta.src || (activeElement instanceof HTMLVideoElement ? activeElement.src : activeElement?.querySelector("video")?.getAttribute("src") || "");
  const videoPoster = meta.poster || (activeElement instanceof HTMLVideoElement ? activeElement.poster : activeElement?.querySelector("video")?.getAttribute("poster") || "");
  const videoFit = (meta.objectFit || "cover") as "cover" | "contain" | "fill";
  const videoRadius = meta.radius || "0px";
  const videoAutoplay = Boolean(meta.autoplay);
  const videoMuted = Boolean(meta.muted);
  const videoLoop = Boolean(meta.loop);
  const videoControls = meta.controls !== undefined ? Boolean(meta.controls) : true;
  const videoPlaysInline = Boolean(meta.playsInline);

  const handleVideoSrcChange = (src: string) => {
    const el = resolveElement();
    if (el) {
      if (el instanceof HTMLVideoElement) {
        el.src = src;
      } else {
        const vid = el.querySelector("video");
        if (vid) vid.src = src;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { src } as any);
    }
  };

  const handleVideoPosterChange = (poster: string) => {
    const el = resolveElement();
    if (el) {
      if (el instanceof HTMLVideoElement) {
        el.poster = poster;
      } else {
        const vid = el.querySelector("video");
        if (vid) vid.poster = poster;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { poster } as any);
    }
  };

  const handleVideoFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setVideoUploadStatus(`Uploading ${file.name}…`);
    try {
      const { url } = await uploadMedia(file);
      handleVideoSrcChange(url);
      setVideoUploadStatus(null);
      setShowVideoMediaPopover(false);
    } catch (err) {
      setVideoUploadStatus(err instanceof ApiError ? err.message : "Upload failed");
    }
  };

  const handlePosterFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setPosterUploadStatus(`Uploading poster…`);
    try {
      const { url } = await uploadMedia(file);
      handleVideoPosterChange(url);
      setPosterUploadStatus(null);
    } catch (err) {
      setPosterUploadStatus(err instanceof ApiError ? err.message : "Upload failed");
    }
  };

  const handleVideoFitChange = (fit: "cover" | "contain" | "fill") => {
    const el = resolveElement();
    if (el) {
      if (el instanceof HTMLVideoElement) {
        el.style.setProperty("object-fit", fit, "important");
      } else {
        const vid = el.querySelector("video");
        if (vid) vid.style.setProperty("object-fit", fit, "important");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { objectFit: fit } as any);
    }
  };

  const handleVideoRadiusChange = (rad: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("border-radius", rad, "important");
      const vid = el.querySelector("video");
      if (vid) vid.style.setProperty("border-radius", rad, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { radius: rad } as any);
    }
  };

  const handleVideoPlaybackToggle = (prop: "autoplay" | "muted" | "loop" | "controls" | "playsInline", value: boolean) => {
    const el = resolveElement();
    const vid = el instanceof HTMLVideoElement ? el : el?.querySelector("video");
    if (vid) {
      if (prop === "autoplay") {
        vid.autoplay = value;
        if (value) vid.muted = true;
      } else if (prop === "muted") {
        vid.muted = value;
      } else if (prop === "loop") {
        vid.loop = value;
      } else if (prop === "controls") {
        vid.controls = value;
      } else if (prop === "playsInline") {
        vid.playsInline = value;
      }
      el?.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      if (prop === "autoplay" && value) {
        onUpdateProps(selectedId, { autoplay: true, muted: true } as any);
      } else {
        onUpdateProps(selectedId, { [prop]: value } as any);
      }
    }
  };

  // YouTube-specific props & live mutation handlers
  const youtubeUrl = meta.url || (meta.videoId ? `https://www.youtube.com/watch?v=${meta.videoId}` : "");
  const youtubeVideoId = meta.videoId || extractYouTubeVideoId(youtubeUrl);
  const isYoutubeValid = Boolean(youtubeVideoId);
  const youtubeRadius = meta.radius || "0px";
  const youtubeAutoplay = Boolean(meta.autoplay);
  const youtubeMuted = Boolean(meta.muted);
  const youtubeLoop = Boolean(meta.loop);
  const youtubeControls = meta.controls !== undefined ? Boolean(meta.controls) : true;

  const handleYoutubeUrlChange = (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    const id = extractYouTubeVideoId(trimmed);
    if (id && selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { url: trimmed, videoId: id } as any);
    } else if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { url: trimmed } as any);
    }
  };

  const handleYoutubeRadiusChange = (rad: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("border-radius", rad, "important");
      const iframe = el.querySelector("iframe");
      if (iframe) iframe.style.setProperty("border-radius", rad, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { radius: rad } as any);
    }
  };

  const handleYoutubePlaybackToggle = (prop: "autoplay" | "muted" | "loop" | "controls", value: boolean) => {
    if (selectedId && onUpdateProps) {
      if (prop === "autoplay" && value) {
        onUpdateProps(selectedId, { autoplay: true, muted: true } as any);
      } else {
        onUpdateProps(selectedId, { [prop]: value } as any);
      }
    }
  };

  // Button-specific props & live mutation handlers
  const buttonHref = meta.href ?? (activeElement instanceof HTMLAnchorElement ? activeElement.getAttribute("href") || "" : activeElement?.getAttribute("data-href") || "");
  const buttonNewTab = Boolean(meta.newTab ?? activeElement?.getAttribute("target") === "_blank");
  const buttonSize = ((meta.size || activeElement?.getAttribute("data-xite-size") || "md") as ButtonSize);
  const buttonFill = meta.background ?? (activeElement ? (activeElement.style.backgroundColor ? (activeElement.style.backgroundColor.startsWith("#") ? activeElement.style.backgroundColor : "#2563eb") : "#2563eb") : "#2563eb");
  const buttonRadius = meta.radius || (activeElement?.style.borderRadius || "50px");

  const handleButtonHrefChange = (href: string) => {
    const el = resolveElement();
    if (el) {
      if (el.tagName === "A") el.setAttribute("href", href);
      else el.setAttribute("data-href", href);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { href } as any);
    }
  };

  const handleButtonNewTabToggle = (newTab: boolean) => {
    const el = resolveElement();
    if (el) {
      if (newTab) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      } else {
        el.removeAttribute("target");
        el.removeAttribute("rel");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { newTab } as any);
    }
  };

  const handleButtonSizeChange = (size: ButtonSize) => {
    const el = resolveElement();
    if (el) {
      el.setAttribute("data-xite-size", size);
      el.style.setProperty("padding", BUTTON_SIZE_PADDING[size], "important");
      el.style.setProperty("font-size", BUTTON_SIZE_FONT[size], "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { size } as any);
    }
  };

  const handleButtonFillChange = (hex: string) => {
    const el = resolveElement();
    const autoTextColor = calculateOppositeContrast(hex).textColor;
    if (el) {
      el.style.setProperty("background-color", hex, "important");
      el.style.setProperty("color", autoTextColor, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { background: hex, textColor: autoTextColor } as any);
    }
  };

  const handleButtonRadiusChange = (rad: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("border-radius", rad, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { radius: rad } as any);
    }
  };

  // Generic element-specific props & live mutation handlers
  const genericBg = meta.background ?? (activeElement?.style.backgroundColor || "transparent");
  const genericColor = meta.color ?? (activeElement?.style.color || "#0f172a");
  const genericRadius = meta.radius || (activeElement?.style.borderRadius || "0px");
  const genericBorderWidth = meta.borderWidth || (activeElement?.style.borderWidth || "0px");
  const genericBorderColor = meta.borderColor || (activeElement?.style.borderColor || "#e2e8f0");

  const handleGenericBgChange = (hex: string) => {
    const el = resolveElement();
    if (el) {
      if (hex === "transparent") {
        el.style.removeProperty("background-color");
      } else {
        el.style.setProperty("background-color", hex, "important");
        const autoTextColor = calculateOppositeContrast(hex).textColor;
        const autoMutedColor = autoTextColor === "#ffffff" ? "#cbd5e1" : "#64748b";
        const textNodes = Array.from(el.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, p, span, li"));
        for (const node of textNodes) {
          if (!node.getAttribute("data-xite-user-color") && !node.closest("button, .card, [data-xite-user-color='true']")) {
            const isHeading = /^h[1-6]$/i.test(node.tagName);
            node.style.setProperty("color", isHeading ? autoTextColor : autoMutedColor, "important");
          }
        }
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { background: hex } as any);
    }
  };

  const handleGenericColorChange = (hex: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("color", hex, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { color: hex } as any);
    }
  };

  const handleGenericRadiusChange = (rad: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("border-radius", rad, "important");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { radius: rad } as any);
    }
  };

  const handleGenericBorderWidthChange = (w: string) => {
    const el = resolveElement();
    if (el) {
      if (w === "0px") {
        el.style.removeProperty("border-width");
        el.style.removeProperty("border-style");
        el.style.removeProperty("border-color");
      } else {
        el.style.setProperty("border-width", w, "important");
        el.style.setProperty("border-style", "solid", "important");
        el.style.setProperty("border-color", genericBorderColor || "#e2e8f0", "important");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, { borderWidth: w, borderColor: genericBorderColor || "#e2e8f0" } as any);
    }
  };

  const handleGenericBorderColorChange = (c: string) => {
    const el = resolveElement();
    if (el) {
      el.style.setProperty("border-color", c, "important");
      if (!el.style.borderWidth || el.style.borderWidth === "0px") {
        el.style.setProperty("border-width", "1px", "important");
        el.style.setProperty("border-style", "solid", "important");
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (selectedId && onUpdateProps) {
      onUpdateProps(selectedId, {
        borderColor: c,
        borderWidth: genericBorderWidth === "0px" ? "1px" : genericBorderWidth,
      } as any);
    }
  };

  // Toolbar positioning: strictly clamp within viewport boundaries [12px, window.innerWidth - toolbarWidth - 12px]
  const toolbarWidth = toolbarRef.current?.offsetWidth || 440;
  const toolbarHeight = toolbarRef.current?.offsetHeight || 44;
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  // Horizontal position: align with rect.left, clamped within viewport so it NEVER gets cut off
  const toolbarLeft = Math.max(12, Math.min(rect.left, viewportWidth - toolbarWidth - 12));

  // Vertical position: prefer placing above element; if too close to viewport top (< 56px), place below element
  const isTooCloseToTop = rect.top < toolbarHeight + 16;
  const idealTop = isTooCloseToTop ? rect.bottom + 8 : rect.top - toolbarHeight - 8;
  const toolbarTop = Math.max(8, Math.min(idealTop, viewportHeight - toolbarHeight - 8));

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
      />

      {/* 2. Floating Contextual Toolbar - Modern Sleek Pill UI with auto viewport containment */}
      <div
        ref={toolbarRef}
        data-xite-floating-toolbar=""
        data-xite-toolbar=""
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed z-[99999] pointer-events-auto flex items-center gap-1 bg-white/95 text-slate-700 backdrop-blur-md border border-slate-200/90 shadow-[0_10px_35px_-4px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 text-xs select-none transition-all duration-75 max-w-[calc(100vw-24px)]"
        style={{
          top: `${toolbarTop}px`,
          left: `${toolbarLeft}px`,
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
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 ${
                  showCardBgPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs shrink-0"
                  style={{ background: cardBg }}
                />
                <span className="font-mono text-[11px] uppercase font-semibold">
                  {cardBg.startsWith("#") ? cardBg.toUpperCase() : "Bg"}
                </span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showCardBgPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 z-[100000] w-52 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
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
                        className={`w-6 h-6 rounded-lg border transition hover:scale-110 shadow-xs cursor-pointer ${
                          cardBg.toLowerCase() === hex.toLowerCase()
                            ? "border-violet-600 ring-2 ring-violet-400/30"
                            : "border-slate-200"
                        }`}
                        style={{ background: hex }}
                      />
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="color"
                      value={cardBg.startsWith("#") ? cardBg : "#ffffff"}
                      onChange={(e) => handleCardBgChange(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 bg-transparent p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={cardBg}
                      onChange={(e) => handleCardBgChange(e.target.value)}
                      className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-800 uppercase focus:outline-none focus:border-violet-400"
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
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showCardStylePopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Style</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showCardStylePopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-3 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Corner Radius */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Corner Radius</span>
                      <span className="font-mono text-slate-600 font-semibold">{cardRadius}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                      {["0px", "8px", "12px", "16px", "24px", "9999px"].map((rad) => (
                        <button
                          key={rad}
                          type="button"
                          onClick={() => handleCardRadiusChange(rad)}
                          className={`py-1 rounded-lg text-[10px] font-mono font-semibold text-center transition cursor-pointer ${
                            cardRadius === rad
                              ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                          }`}
                        >
                          {rad === "9999px" ? "Full" : rad.replace("px", "")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Width & Color */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Border Width & Color
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="grid grid-cols-5 gap-1 flex-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                        {["0px", "1px", "2px", "3px", "4px"].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => handleCardBorderWidthChange(w)}
                            className={`py-1 rounded-lg text-[10px] font-mono font-semibold text-center transition cursor-pointer ${
                              cardBorderWidth === w
                                ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
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
                        className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 bg-transparent p-0.5 shrink-0"
                        title="Border Color"
                      />
                    </div>
                  </div>

                  {/* Shadow Presets */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Shadow
                    </div>
                    <div className="grid grid-cols-5 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                      {["none", "sm", "md", "lg", "xl"].map((sh) => (
                        <button
                          key={sh}
                          type="button"
                          onClick={() => handleCardShadowChange(sh)}
                          className={`py-1 rounded-lg text-[10px] font-semibold uppercase text-center transition cursor-pointer ${
                            cardShadow === sh
                              ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
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
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showCardMediaPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : cardHasMedia
                    ? "bg-violet-50 text-violet-700 border-violet-200 font-semibold"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Media</span>
                {cardHasMedia && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showCardMediaPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {cardHasMedia ? (
                    <>
                      <div className="flex items-center justify-between text-[10px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1.5 rounded-xl border border-violet-200/60">
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
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("video", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <VideoIcon className="w-3.5 h-3.5 text-cyan-600" />
                          Video
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("youtube", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <Youtube className="w-3.5 h-3.5 text-rose-600" />
                          YouTube
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        Upload New File
                      </button>

                      {onRemoveMediaFromCard && (
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveMediaFromCard();
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-[11px] font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("video", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <VideoIcon className="w-3.5 h-3.5 text-cyan-600" />
                          Video
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAddMediaToCard?.("youtube", undefined, "top");
                            setShowCardMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <Youtube className="w-3.5 h-3.5 text-rose-600" />
                          YouTube
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload File
                      </button>

                      <div className="flex items-center gap-1 pt-1.5 border-t border-slate-100">
                        <input
                          type="url"
                          value={cardCustomUrl}
                          onChange={(e) => setCardCustomUrl(e.target.value)}
                          placeholder="Paste image or video URL…"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddCustomMediaUrl();
                          }}
                          className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomMediaUrl}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-white transition cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </>
                  )}
                  {cardUploadStatus && (
                    <div className="text-[10px] font-semibold text-slate-500 text-center">{cardUploadStatus}</div>
                  )}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* 4. Add Child Content: Heading, Text, Button (Segmented modern control) */}
            {onInsertChildIntoCard && (
              <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 gap-0.5">
                <button
                  type="button"
                  onClick={() => onInsertChildIntoCard("heading")}
                  title="Add Heading into Card"
                  className="h-7 px-2.5 flex items-center gap-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-pink-600 hover:shadow-xs transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3 h-3 text-pink-500 shrink-0" />
                  <span>Heading</span>
                </button>
                <button
                  type="button"
                  onClick={() => onInsertChildIntoCard("text")}
                  title="Add Text into Card"
                  className="h-7 px-2.5 flex items-center gap-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-amber-600 hover:shadow-xs transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => onInsertChildIntoCard("button")}
                  title="Add Button into Card"
                  className="h-7 px-2.5 flex items-center gap-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-indigo-600 hover:shadow-xs transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3 h-3 text-indigo-500 shrink-0" />
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
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        ) : effectiveType === "container" ? (
          <>
            {/* 1. Display Selector (Auto Fit, Grid, Block) */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 gap-0.5">
              <button
                type="button"
                onClick={() => handleContainerDisplayChange("flex")}
                title="Auto-Fit Row (horizontal auto layout)"
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  containerDisplay === "flex"
                    ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                Auto Fit
              </button>
              <button
                type="button"
                onClick={() => handleContainerDisplayChange("grid")}
                title="Grid with Auto-Fit columns"
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  containerDisplay === "grid"
                    ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => handleContainerDisplayChange("block")}
                title="Block (vertical stack)"
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  containerDisplay === "block"
                    ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                Block
              </button>
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* 2. Gap Stepper with Increment & Decrement */}
            <div className="flex items-center bg-slate-50 px-2 py-0.5 rounded-xl border border-slate-200/80 gap-1.5 h-8">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gap</span>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs h-6.5">
                <button
                  type="button"
                  onClick={() => handleContainerGapStep(-4)}
                  title="Decrease Gap (-4px)"
                  className="px-2 h-full hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer border-r border-slate-100 flex items-center justify-center"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="text"
                  value={containerGap}
                  onChange={(e) => handleContainerGapInput(e.target.value)}
                  className="w-[48px] text-center text-[11px] font-mono font-semibold text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleContainerGapStep(4)}
                  title="Increase Gap (+4px)"
                  className="px-2 h-full hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer border-l border-slate-100 flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* 3. Actions: Duplicate, Move Up, Move Down, Delete */}
            <div className="flex items-center gap-0.5">
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  title="Duplicate Container"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Container Up"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Container Down"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Delete Container"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        ) : effectiveType === "image" ? (
          <>
            {/* Hidden file input for image upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                void handleImageFileUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            {/* 1. Media & Replace Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageMediaPopover(!showImageMediaPopover);
                  setShowImageFitPopover(false);
                }}
                title="Replace or Manage Image"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showImageMediaPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Replace</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showImageMediaPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Replace Media Type Switcher */}
                  {onReplaceMedia && (
                    <>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                        Media Type
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-bold bg-slate-900 text-white shadow-xs">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Image
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onReplaceMedia("video");
                            setShowImageMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <VideoIcon className="w-3.5 h-3.5 text-cyan-600" />
                          Video
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onReplaceMedia("youtube");
                            setShowImageMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <Youtube className="w-3.5 h-3.5 text-rose-600" />
                          YouTube
                        </button>
                      </div>
                    </>
                  )}

                  {/* Upload file button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                  </button>

                  {/* URL Input */}
                  <div className="flex items-center gap-1 pt-1.5 border-t border-slate-100">
                    <input
                      type="url"
                      defaultValue={imageSrc}
                      placeholder="Paste image URL…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleImageSrcChange((e.target as HTMLInputElement).value);
                          setShowImageMediaPopover(false);
                        }
                      }}
                      onBlur={(e) => handleImageSrcChange(e.target.value)}
                      className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Alt text Input */}
                  <div className="pt-1">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Alt Text
                    </div>
                    <input
                      type="text"
                      defaultValue={imageAlt}
                      placeholder="Describe the image…"
                      onBlur={(e) => handleImageAltChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleImageAltChange((e.target as HTMLInputElement).value);
                      }}
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {imageUploadStatus && (
                    <div className="text-[10px] font-semibold text-slate-500 text-center">{imageUploadStatus}</div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Fit & Radius Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageFitPopover(!showImageFitPopover);
                  setShowImageMediaPopover(false);
                }}
                title="Image Fit & Corner Radius"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showImageFitPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Fit & Radius</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showImageFitPopover && (
                <div
                  className="xite-floating-popover absolute top-full right-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-3 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Object Fit */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Object Fit
                    </div>
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                      {(["cover", "contain", "fill"] as const).map((fit) => (
                        <button
                          key={fit}
                          type="button"
                          onClick={() => handleImageFitChange(fit)}
                          className={`py-1 rounded-lg text-[10.5px] font-semibold capitalize text-center transition cursor-pointer ${
                            imageFit === fit
                              ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                          }`}
                        >
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Corner Radius</span>
                      <span className="font-mono text-slate-600 font-semibold">{imageRadius}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                      {["0px", "8px", "12px", "16px", "24px", "9999px"].map((rad) => (
                        <button
                          key={rad}
                          type="button"
                          onClick={() => handleImageRadiusChange(rad)}
                          className={`py-1 rounded-lg text-[10px] font-mono font-semibold text-center transition cursor-pointer ${
                            imageRadius === rad
                              ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                          }`}
                        >
                          {rad === "9999px" ? "Full" : rad.replace("px", "")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* 3. Common Actions: Duplicate, Move, Delete */}
            <div className="flex items-center gap-0.5">
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  title="Duplicate Image"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Image Up"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Image Down"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Delete Image"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        ) : null}

        {/* 6. Video Element Floating Pop Toolbar */}
        {effectiveType === "video" ? (
          <>
            {/* 1. Video Source / Replace Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideoMediaPopover(!showVideoMediaPopover);
                  setShowVideoPlaybackPopover(false);
                }}
                title="Video Source"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showVideoMediaPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>Video Source</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showVideoMediaPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Media Type Switcher */}
                  {onReplaceMedia && (
                    <>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Media Type</div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onReplaceMedia("image");
                            setShowVideoMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          Image
                        </button>
                        <span className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-bold bg-slate-900 text-white shadow-xs">
                          <VideoIcon className="w-3.5 h-3.5 text-cyan-400" />
                          Video
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onReplaceMedia("youtube");
                            setShowVideoMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <Youtube className="w-3.5 h-3.5 text-rose-600" />
                          YouTube
                        </button>
                      </div>
                    </>
                  )}

                  {/* Upload MP4 button */}
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload MP4 Video
                  </button>
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    className="hidden"
                    onChange={(e) => {
                      void handleVideoFileUpload(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />

                  {/* Video URL Input */}
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-100">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Video URL</div>
                    <input
                      type="url"
                      defaultValue={videoSrc}
                      placeholder="Paste MP4 / WebM URL…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleVideoSrcChange((e.target as HTMLInputElement).value);
                          setShowVideoMediaPopover(false);
                        }
                      }}
                      onBlur={(e) => handleVideoSrcChange(e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Poster Image */}
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Poster Image</span>
                      <button
                        type="button"
                        onClick={() => posterFileInputRef.current?.click()}
                        className="text-[10px] font-semibold text-cyan-600 hover:text-cyan-700 transition cursor-pointer"
                      >
                        Upload
                      </button>
                      <input
                        ref={posterFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          void handlePosterFileUpload(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <input
                      type="url"
                      defaultValue={videoPoster}
                      placeholder="Poster image URL (optional)"
                      onBlur={(e) => handleVideoPosterChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleVideoPosterChange((e.target as HTMLInputElement).value);
                      }}
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {(videoUploadStatus || posterUploadStatus) && (
                    <div className="text-[10px] font-semibold text-slate-500 text-center">
                      {videoUploadStatus || posterUploadStatus}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Playback & Style Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideoPlaybackPopover(!showVideoPlaybackPopover);
                  setShowVideoMediaPopover(false);
                }}
                title="Playback & Style"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showVideoPlaybackPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <Play className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Playback & Style</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showVideoPlaybackPopover && (
                <div
                  className="xite-floating-popover absolute top-full right-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-3 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Playback Toggles */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Playback</div>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => handleVideoPlaybackToggle("autoplay", !videoAutoplay)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                          videoAutoplay ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>Autoplay</span>
                        <span className={`w-2 h-2 rounded-full ${videoAutoplay ? "bg-cyan-500" : "bg-slate-300"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVideoPlaybackToggle("muted", !videoMuted)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                          videoMuted ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>Muted</span>
                        <span className={`w-2 h-2 rounded-full ${videoMuted ? "bg-cyan-500" : "bg-slate-300"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVideoPlaybackToggle("loop", !videoLoop)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                          videoLoop ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>Loop</span>
                        <span className={`w-2 h-2 rounded-full ${videoLoop ? "bg-cyan-500" : "bg-slate-300"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVideoPlaybackToggle("controls", !videoControls)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                          videoControls ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>Controls</span>
                        <span className={`w-2 h-2 rounded-full ${videoControls ? "bg-cyan-500" : "bg-slate-300"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Object Fit */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Fit</div>
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                      {(["cover", "contain", "fill"] as const).map((fit) => (
                        <button
                          key={fit}
                          type="button"
                          onClick={() => handleVideoFitChange(fit)}
                          className={`py-1 rounded-lg text-[10.5px] font-semibold capitalize text-center transition cursor-pointer ${
                            videoFit === fit
                              ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                          }`}
                        >
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Corner Radius</span>
                      <span className="font-mono text-slate-600 font-semibold">{videoRadius}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                      {["0px", "8px", "12px", "16px", "24px", "9999px"].map((rad) => (
                        <button
                          key={rad}
                          type="button"
                          onClick={() => handleVideoRadiusChange(rad)}
                          className={`py-1 rounded-lg text-[10px] font-mono font-semibold text-center transition cursor-pointer ${
                            videoRadius === rad
                              ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                          }`}
                        >
                          {rad === "9999px" ? "Full" : rad.replace("px", "")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* Common Actions */}
            <div className="flex items-center gap-0.5">
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  title="Duplicate Video"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Video Up"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Video Down"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Delete Video"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        ) : null}

        {/* 7. YouTube Element Floating Pop Toolbar */}
        {effectiveType === "youtube" ? (
          <>
            {/* 1. YouTube Source / Replace Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowYoutubeMediaPopover(!showYoutubeMediaPopover);
                  setShowYoutubePlaybackPopover(false);
                }}
                title="YouTube Source"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showYoutubeMediaPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>YouTube Source</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showYoutubeMediaPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 z-[100000] w-72 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Media Type Switcher */}
                  {onReplaceMedia && (
                    <>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Media Type</div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onReplaceMedia("image");
                            setShowYoutubeMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onReplaceMedia("video");
                            setShowYoutubeMediaPopover(false);
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition cursor-pointer"
                        >
                          <VideoIcon className="w-3.5 h-3.5 text-cyan-600" />
                          Video
                        </button>
                        <span className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10.5px] font-bold bg-slate-900 text-white shadow-xs">
                          <Youtube className="w-3.5 h-3.5 text-rose-400" />
                          YouTube
                        </span>
                      </div>
                    </>
                  )}

                  {/* YouTube URL Input */}
                  <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-100">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">YouTube URL</div>
                    <input
                      type="url"
                      defaultValue={youtubeUrl}
                      placeholder="https://www.youtube.com/watch?v=…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleYoutubeUrlChange((e.target as HTMLInputElement).value);
                          setShowYoutubeMediaPopover(false);
                        }
                      }}
                      onBlur={(e) => handleYoutubeUrlChange(e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400"
                    />

                    <div className="flex items-center justify-between pt-1">
                      {isYoutubeValid ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Valid ID: {youtubeVideoId}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <AlertCircle className="h-3 w-3" />
                          Invalid URL
                        </span>
                      )}

                      {youtubeVideoId && (
                        <a
                          href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10.5px] font-bold text-slate-500 hover:text-rose-600 transition"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Watch
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Playback & Style Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowYoutubePlaybackPopover(!showYoutubePlaybackPopover);
                  setShowYoutubeMediaPopover(false);
                }}
                title="Playback & Style"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showYoutubePlaybackPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <Play className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Playback & Style</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showYoutubePlaybackPopover && (
                <div
                  className="xite-floating-popover absolute top-full right-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-3 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Playback Toggles */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Playback</div>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => handleYoutubePlaybackToggle("autoplay", !youtubeAutoplay)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                          youtubeAutoplay ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>Autoplay</span>
                        <span className={`w-2 h-2 rounded-full ${youtubeAutoplay ? "bg-rose-500" : "bg-slate-300"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleYoutubePlaybackToggle("muted", !youtubeMuted)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                          youtubeMuted ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>Muted</span>
                        <span className={`w-2 h-2 rounded-full ${youtubeMuted ? "bg-rose-500" : "bg-slate-300"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleYoutubePlaybackToggle("loop", !youtubeLoop)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                          youtubeLoop ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>Loop</span>
                        <span className={`w-2 h-2 rounded-full ${youtubeLoop ? "bg-rose-500" : "bg-slate-300"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleYoutubePlaybackToggle("controls", !youtubeControls)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold text-left flex items-center justify-between transition cursor-pointer ${
                          youtubeControls ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>Controls</span>
                        <span className={`w-2 h-2 rounded-full ${youtubeControls ? "bg-rose-500" : "bg-slate-300"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Corner Radius</span>
                      <span className="font-mono text-slate-600 font-semibold">{youtubeRadius}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                      {["0px", "8px", "12px", "16px", "24px", "9999px"].map((rad) => (
                        <button
                          key={rad}
                          type="button"
                          onClick={() => handleYoutubeRadiusChange(rad)}
                          className={`py-1 rounded-lg text-[10px] font-mono font-semibold text-center transition cursor-pointer ${
                            youtubeRadius === rad
                              ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                          }`}
                        >
                          {rad === "9999px" ? "Full" : rad.replace("px", "")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* Common Actions */}
            <div className="flex items-center gap-0.5">
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  title="Duplicate YouTube Video"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move YouTube Video Up"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move YouTube Video Down"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Delete YouTube Video"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        ) : null}

        {/* 8. Button Element Floating Pop Toolbar */}
        {effectiveType === "button" ? (
          <>
            {/* 1. Link Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowButtonLinkPopover(!showButtonLinkPopover);
                  setShowButtonFillPopover(false);
                  setShowButtonRadiusPopover(false);
                }}
                title="Button Link"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showButtonLinkPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Link</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showButtonLinkPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Destination URL</div>
                  <input
                    type="text"
                    defaultValue={buttonHref}
                    placeholder="/admissions or https://…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleButtonHrefChange((e.target as HTMLInputElement).value);
                        setShowButtonLinkPopover(false);
                      }
                    }}
                    onBlur={(e) => handleButtonHrefChange(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                  />
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-medium text-slate-600">Open in new tab</span>
                    <button
                      type="button"
                      onClick={() => handleButtonNewTabToggle(!buttonNewTab)}
                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors cursor-pointer ${
                        buttonNewTab ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          buttonNewTab ? "translate-x-3.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Size Selector (S, M, L) */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 gap-0.5">
              {(["sm", "md", "lg"] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleButtonSizeChange(sz)}
                  className={`h-7 w-7 rounded-lg text-[11px] font-semibold uppercase flex items-center justify-center transition cursor-pointer ${
                    buttonSize === sz
                      ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* 3. Fill Color Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowButtonFillPopover(!showButtonFillPopover);
                  setShowButtonLinkPopover(false);
                  setShowButtonRadiusPopover(false);
                }}
                title="Button Fill Color"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 ${
                  showButtonFillPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                  style={{ backgroundColor: buttonFill }}
                />
                <span>Fill</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showButtonFillPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Fill Color</div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PRESET_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => {
                          handleButtonFillChange(hex);
                          setShowButtonFillPopover(false);
                        }}
                        className={`w-7 h-7 rounded-lg border transition cursor-pointer relative flex items-center justify-center ${
                          buttonFill.toLowerCase() === hex.toLowerCase()
                            ? "border-slate-900 scale-110 shadow-xs ring-2 ring-indigo-500/20"
                            : "border-slate-200/80 hover:scale-105"
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="color"
                      value={buttonFill.startsWith("#") ? buttonFill : "#2563eb"}
                      onChange={(e) => handleButtonFillChange(e.target.value)}
                      className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={buttonFill}
                      onChange={(e) => handleButtonFillChange(e.target.value)}
                      placeholder="#2563eb"
                      className="flex-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] font-mono text-slate-700 outline-none uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Radius Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowButtonRadiusPopover(!showButtonRadiusPopover);
                  setShowButtonLinkPopover(false);
                  setShowButtonFillPopover(false);
                }}
                title="Corner Radius"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showButtonRadiusPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Radius</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showButtonRadiusPopover && (
                <div
                  className="xite-floating-popover absolute top-full right-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2 z-[100000] w-60 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Corner Radius</span>
                    <span className="font-mono text-slate-600 font-semibold">{buttonRadius}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                    {["0px", "8px", "16px", "24px", "50px"].map((rad) => (
                      <button
                        key={rad}
                        type="button"
                        onClick={() => {
                          handleButtonRadiusChange(rad);
                          setShowButtonRadiusPopover(false);
                        }}
                        className={`py-1 rounded-lg text-[10px] font-mono font-semibold text-center transition cursor-pointer ${
                          buttonRadius === rad
                            ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                      >
                        {rad === "50px" ? "Full" : rad.replace("px", "")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* Actions: Duplicate, Move Up, Move Down, Delete */}
            <div className="flex items-center gap-0.5">
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  title="Duplicate Button"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Button Up"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Button Down"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Delete Button"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        ) : effectiveType === "generic" ? (
          <>
            {/* 1. Background Color Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGenericBgPopover(!showGenericBgPopover);
                  setShowGenericColorPopover(false);
                  setShowGenericStylePopover(false);
                }}
                title="Background Color"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 ${
                  showGenericBgPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs shrink-0"
                  style={{ background: genericBg === "transparent" ? "#ffffff" : genericBg }}
                />
                <span className="font-mono text-[11px] uppercase font-semibold">
                  {genericBg === "transparent" ? "None" : genericBg.startsWith("#") ? genericBg.toUpperCase() : "Bg"}
                </span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showGenericBgPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 z-[100000] w-52 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Background</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleGenericBgChange("transparent");
                        setShowGenericBgPopover(false);
                      }}
                      className="text-[9.5px] font-semibold text-slate-500 hover:text-red-600 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PRESET_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenericBgChange(hex);
                          setShowGenericBgPopover(false);
                        }}
                        className={`w-6 h-6 rounded-lg border transition hover:scale-110 shadow-xs cursor-pointer ${
                          genericBg.toLowerCase() === hex.toLowerCase()
                            ? "border-violet-600 ring-2 ring-violet-400/30"
                            : "border-slate-200"
                        }`}
                        style={{ background: hex }}
                      />
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="color"
                      value={genericBg.startsWith("#") ? genericBg : "#ffffff"}
                      onChange={(e) => handleGenericBgChange(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 bg-transparent p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={genericBg}
                      placeholder="transparent"
                      onChange={(e) => handleGenericBgChange(e.target.value)}
                      className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-800 uppercase focus:outline-none focus:border-violet-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Text Color Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGenericColorPopover(!showGenericColorPopover);
                  setShowGenericBgPopover(false);
                  setShowGenericStylePopover(false);
                }}
                title="Text Color"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 ${
                  showGenericColorPopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                  style={{ backgroundColor: genericColor }}
                />
                <span>Color</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showGenericColorPopover && (
                <div
                  className="xite-floating-popover absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 z-[100000] w-52 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                    Text Color
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PRESET_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenericColorChange(hex);
                          setShowGenericColorPopover(false);
                        }}
                        className={`w-6 h-6 rounded-lg border transition hover:scale-110 shadow-xs cursor-pointer ${
                          genericColor.toLowerCase() === hex.toLowerCase()
                            ? "border-violet-600 ring-2 ring-violet-400/30"
                            : "border-slate-200"
                        }`}
                        style={{ background: hex }}
                      />
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="color"
                      value={genericColor.startsWith("#") ? genericColor : "#0f172a"}
                      onChange={(e) => handleGenericColorChange(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 bg-transparent p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={genericColor}
                      onChange={(e) => handleGenericColorChange(e.target.value)}
                      className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-800 uppercase focus:outline-none focus:border-violet-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Style (Border & Radius) Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGenericStylePopover(!showGenericStylePopover);
                  setShowGenericBgPopover(false);
                  setShowGenericColorPopover(false);
                }}
                title="Border & Radius"
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl border text-[11.5px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                  showGenericStylePopover
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Style</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
              </button>

              {showGenericStylePopover && (
                <div
                  className="xite-floating-popover absolute top-full right-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.08)] flex flex-col gap-3 z-[100000] w-64 text-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Corner Radius */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Corner Radius</span>
                      <span className="font-mono text-slate-600 font-semibold">{genericRadius}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                      {["0px", "8px", "12px", "16px", "24px", "9999px"].map((rad) => (
                        <button
                          key={rad}
                          type="button"
                          onClick={() => handleGenericRadiusChange(rad)}
                          className={`py-1 rounded-lg text-[10px] font-mono font-semibold text-center transition cursor-pointer ${
                            genericRadius === rad
                              ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                          }`}
                        >
                          {rad === "9999px" ? "Full" : rad.replace("px", "")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Width & Color */}
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Border Width & Color
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200/60 flex-1">
                        {["0px", "1px", "2px", "4px"].map((bw) => (
                          <button
                            key={bw}
                            type="button"
                            onClick={() => handleGenericBorderWidthChange(bw)}
                            className={`flex-1 py-1 text-[10px] font-mono rounded font-semibold transition cursor-pointer ${
                              genericBorderWidth === bw
                                ? "bg-white text-slate-900 shadow-xs font-bold"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {bw}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="color"
                          value={genericBorderColor.startsWith("#") ? genericBorderColor : "#e2e8f0"}
                          onChange={(e) => handleGenericBorderColorChange(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 bg-transparent p-0.5 shrink-0"
                          title="Border Color"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

            {/* Actions: Duplicate, Move Up, Move Down, Delete */}
            <div className="flex items-center gap-0.5">
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  title="Duplicate Element"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Element Up"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Move Element Down"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
                  title="Delete Element"
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
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
            className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </>
  );
}
