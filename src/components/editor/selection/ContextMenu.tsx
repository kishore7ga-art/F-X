"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Edit3,
  X,
  Video,
  Image as ImageIcon,
  Star,
  Type,
  AlignLeft,
  Square,
  ChevronRight,
  Palette,
  Layout,
  Maximize2,
  Sparkles,
  Sliders,
  Check,
  RefreshCw,
  Link as LinkIcon,
  Scissors,
  ClipboardCheck,
} from "lucide-react";
import { Youtube } from "./YouTubeIcon";
import type { ElementType, SelectionAncestor } from "@/lib/editor/selection-store";
import type { HeadingLevel } from "@/lib/editor/element-resolver";
import { TOOLBAR_CONFIG } from "./toolbar-config";

export interface StyleClipboard {
  [key: string]: unknown;
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: string;
  boxShadow?: string;
  borderColor?: string;
  borderWidth?: string;
  opacity?: number;
}

let globalStyleClipboard: StyleClipboard | null = null;

export interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  elementType: ElementType | null;
  elementId?: string | null;
  tag?: string;
  elementMeta?: Record<string, unknown>;
  ancestors?: SelectionAncestor[];
  onClose: () => void;
  onEdit?: () => void;
  onUpdateProps?: (props: Record<string, unknown>) => void;
  onChangeHeadingLevel?: (level: HeadingLevel) => void;
  onChangeIcon?: (iconName: string) => void;
  onReplaceMedia?: (targetType: "image" | "video" | "youtube") => void;
  onReplacePlus?: (targetType: "image" | "video" | "youtube" | "icon" | "button") => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onSelectAncestor?: (path: string, type: ElementType) => void;
  onAddMediaToCard?: (
    mediaType: "image" | "video" | "youtube",
    initialProps?: Record<string, unknown>,
    position?: "top" | "bottom" | "left" | "right",
  ) => void;
  onRemoveMediaFromCard?: () => void;
  onInsertChildIntoCard?: (childType: "heading" | "text" | "button") => void;
  // Section specific
  onSwapVariant?: () => void;
  onDuplicateSection?: () => void;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  onDeleteSection?: () => void;
  onPatchSection?: (patch: Record<string, unknown>) => void;
  onOpenSectionToolbar?: () => void;
}

export function ContextMenu({
  isOpen,
  position,
  elementType,
  elementId,
  tag,
  elementMeta = {},
  ancestors = [],
  onClose,
  onEdit,
  onUpdateProps,
  onChangeHeadingLevel,
  onChangeIcon,
  onReplaceMedia,
  onReplacePlus,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSelectAncestor,
  onAddMediaToCard,
  onRemoveMediaFromCard,
  onInsertChildIntoCard,
  onSwapVariant,
  onDuplicateSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onDeleteSection,
  onPatchSection,
  onOpenSectionToolbar,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [copiedStyle, setCopiedStyle] = useState(false);
  const [customHex, setCustomHex] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setActiveSubmenu(null);
      setCopiedStyle(false);
      return;
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !elementType) return null;

  const config = TOOLBAR_CONFIG[elementType] || {
    badge: elementType.toUpperCase(),
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    tabs: [],
    deleteLabel: "element",
  };

  const winWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const winHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  // Clamped position for main menu
  const adjustedX = Math.min(position.x, winWidth - 230);
  const adjustedY = Math.min(position.y, winHeight - 380);

  // Submenu placement (open left if near right edge)
  const openSubmenuLeft = adjustedX + 230 + 260 > winWidth;

  const immediateParent = ancestors.length > 1 ? ancestors[ancestors.length - 1] : null;

  const handleCopyStyle = () => {
    globalStyleClipboard = {
      backgroundColor: typeof elementMeta.backgroundColor === "string" ? elementMeta.backgroundColor : undefined,
      color: typeof elementMeta.color === "string" ? elementMeta.color : undefined,
      borderRadius: typeof elementMeta.borderRadius === "string" ? elementMeta.borderRadius : undefined,
      padding: typeof elementMeta.padding === "string" ? elementMeta.padding : undefined,
      margin: typeof elementMeta.margin === "string" ? elementMeta.margin : undefined,
      fontSize: typeof elementMeta.fontSize === "string" ? elementMeta.fontSize : undefined,
      fontWeight: typeof elementMeta.fontWeight === "string" ? elementMeta.fontWeight : undefined,
      fontFamily: typeof elementMeta.fontFamily === "string" ? elementMeta.fontFamily : undefined,
      textAlign: typeof elementMeta.textAlign === "string" ? elementMeta.textAlign : undefined,
      boxShadow: typeof elementMeta.boxShadow === "string" ? elementMeta.boxShadow : undefined,
      borderColor: typeof elementMeta.borderColor === "string" ? elementMeta.borderColor : undefined,
      borderWidth: typeof elementMeta.borderWidth === "string" ? elementMeta.borderWidth : undefined,
      opacity: typeof elementMeta.opacity === "number" ? elementMeta.opacity : undefined,
    };
    setCopiedStyle(true);
    setTimeout(() => {
      onClose();
    }, 350);
  };

  const handlePasteStyle = () => {
    if (!globalStyleClipboard) return;
    if (elementType === "section" && onPatchSection) {
      if (globalStyleClipboard.backgroundColor) {
        onPatchSection({ backgroundColor: globalStyleClipboard.backgroundColor });
      }
    } else if (onUpdateProps) {
      onUpdateProps(globalStyleClipboard);
    }
    onClose();
  };

  const applyProp = (key: string, value: unknown) => {
    if (elementType === "section" && onPatchSection) {
      onPatchSection({ [key]: value });
    } else if (onUpdateProps) {
      onUpdateProps({ [key]: value });
    }
  };

  /* ── Submenu Content Renderer ─────────────────────────────────────────── */
  const renderSubmenu = () => {
    if (!activeSubmenu) return null;

    return (
      <div
        className={`absolute top-0 z-[100001] w-64 rounded-xl border border-slate-200/95 bg-white/95 p-2 shadow-2xl backdrop-blur-md text-[11.5px] text-slate-700 animate-in fade-in duration-100 ${
          openSubmenuLeft ? "-left-[262px]" : "left-[228px]"
        }`}
        style={{ maxHeight: "420px", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* === Typography Submenu === */}
        {activeSubmenu === "typography" && (
          <div className="space-y-2.5">
            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Font Family
              </div>
              <div className="grid grid-cols-1 gap-0.5">
                {[
                  { name: "Inter (Modern Sans)", value: "var(--font-inter), sans-serif" },
                  { name: "Plus Jakarta (Clean)", value: "'Plus Jakarta Sans', sans-serif" },
                  { name: "Outfit (Editorial)", value: "'Outfit', sans-serif" },
                  { name: "Playfair (Serif)", value: "'Playfair Display', serif" },
                  { name: "Monospace (Code)", value: "ui-monospace, monospace" },
                ].map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => {
                      applyProp("fontFamily", f.value);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded px-2 py-1 hover:bg-slate-100 text-left cursor-pointer"
                  >
                    <span>{f.name}</span>
                    {elementMeta.fontFamily === f.value && <Check className="h-3 w-3 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Font Size
              </div>
              <div className="flex flex-wrap gap-1">
                {["12px", "14px", "16px", "18px", "20px", "24px", "32px", "40px", "48px", "64px"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      applyProp("fontSize", sz);
                      onClose();
                    }}
                    className={`px-2 py-0.5 rounded border text-[10.5px] font-semibold cursor-pointer ${
                      elementMeta.fontSize === sz
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Font Weight
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: "Light 300", val: "300" },
                  { label: "Regular 400", val: "400" },
                  { label: "Medium 500", val: "500" },
                  { label: "SemiBold 600", val: "600" },
                  { label: "Bold 700", val: "700" },
                  { label: "Black 900", val: "900" },
                ].map((w) => (
                  <button
                    key={w.val}
                    type="button"
                    onClick={() => {
                      applyProp("fontWeight", w.val);
                      onClose();
                    }}
                    className={`px-2 py-1 rounded border text-[10.5px] font-medium cursor-pointer text-center ${
                      elementMeta.fontWeight === w.val
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Text Color
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {[
                  { hex: "#0f172a", name: "Dark" },
                  { hex: "#475569", name: "Slate" },
                  { hex: "#ffffff", name: "White" },
                  { hex: "#2563eb", name: "Blue" },
                  { hex: "#059669", name: "Emerald" },
                  { hex: "#dc2626", name: "Red" },
                  { hex: "#d97706", name: "Amber" },
                  { hex: "#7c3aed", name: "Violet" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      applyProp("color", c.hex);
                      onClose();
                    }}
                    title={c.name}
                    className="h-5 w-5 rounded-full border border-slate-300 shadow-sm cursor-pointer hover:scale-110 transition"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Text Transform
              </div>
              <div className="grid grid-cols-2 gap-1">
                {["none", "uppercase", "lowercase", "capitalize"].map((tt) => (
                  <button
                    key={tt}
                    type="button"
                    onClick={() => {
                      applyProp("textTransform", tt);
                      onClose();
                    }}
                    className={`px-2 py-0.5 rounded border text-[10.5px] font-medium cursor-pointer text-center ${
                      elementMeta.textTransform === tt
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {tt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === Alignment Submenu === */}
        {activeSubmenu === "alignment" && (
          <div className="space-y-1">
            <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
              Text Alignment
            </div>
            {[
              { label: "Align Left", value: "left" },
              { label: "Align Center", value: "center" },
              { label: "Align Right", value: "right" },
              { label: "Justify", value: "justify" },
            ].map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => {
                  applyProp("textAlign", a.value);
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-slate-100 text-left cursor-pointer"
              >
                <span>{a.label}</span>
                {elementMeta.textAlign === a.value && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </button>
            ))}
          </div>
        )}

        {/* === Heading Level Submenu === */}
        {activeSubmenu === "heading-level" && onChangeHeadingLevel && (
          <div className="space-y-1">
            <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
              Heading Tag
            </div>
            {(["h1", "h2", "h3", "h4", "h5", "h6"] as HeadingLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  onChangeHeadingLevel(lvl);
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-slate-100 text-left cursor-pointer"
              >
                <span className="font-mono font-bold uppercase">{lvl}</span>
                {elementMeta.level === lvl && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </button>
            ))}
          </div>
        )}

        {/* === Style Submenu === */}
        {activeSubmenu === "style" && (
          <div className="space-y-2.5">
            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Background Color
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {[
                  { hex: "transparent", name: "Transparent" },
                  { hex: "#ffffff", name: "White" },
                  { hex: "#f8fafc", name: "Light Gray" },
                  { hex: "#0f172a", name: "Navy Dark" },
                  { hex: "#000000", name: "Pure Black" },
                  { hex: "#2563eb", name: "Blue" },
                  { hex: "#059669", name: "Emerald" },
                  { hex: "#fffbeb", name: "Warm Amber" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      applyProp("backgroundColor", c.hex);
                      onClose();
                    }}
                    title={c.name}
                    className="h-5 w-5 rounded-full border border-slate-300 shadow-sm cursor-pointer hover:scale-110 transition"
                    style={{ backgroundColor: c.hex === "transparent" ? "#ffffff" : c.hex }}
                  />
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                <input
                  type="text"
                  placeholder="#hex code"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="flex-1 px-2 py-0.5 text-[10.5px] border border-slate-200 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customHex) {
                      applyProp("backgroundColor", customHex.startsWith("#") ? customHex : `#${customHex}`);
                      onClose();
                    }
                  }}
                  className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Border Radius
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: "None", val: "0px" },
                  { label: "Small", val: "8px" },
                  { label: "Normal", val: "16px" },
                  { label: "Max", val: "9999px" },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => {
                      applyProp("borderRadius", r.val);
                      onClose();
                    }}
                    className={`px-1.5 py-1 rounded border text-[10.5px] font-semibold cursor-pointer text-center ${
                      elementMeta.borderRadius === r.val
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Shadow
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: "None", val: "none" },
                  { label: "Subtle (sm)", val: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
                  { label: "Medium (md)", val: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
                  { label: "Elevated (xl)", val: "0 20px 25px -5px rgb(0 0 0 / 0.1)" },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      applyProp("boxShadow", s.val);
                      onClose();
                    }}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[10px] font-medium cursor-pointer text-center"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {elementType === "image" && (
              <>
                <div className="h-px bg-slate-100" />
                <div>
                  <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                    Opacity
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 0.85, 0.65, 0.4].map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => {
                          applyProp("opacity", op);
                          onClose();
                        }}
                        className={`px-1.5 py-1 rounded border text-[10.5px] font-medium cursor-pointer text-center ${
                          elementMeta.opacity === op
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {Math.round(op * 100)}%
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* === Spacing Submenu === */}
        {activeSubmenu === "spacing" && (
          <div className="space-y-2.5">
            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Padding
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: "None 0", val: "0px" },
                  { label: "Compact 8px", val: "8px" },
                  { label: "Normal 16px", val: "16px" },
                  { label: "Spacious 24px", val: "24px" },
                  { label: "Large 36px", val: "36px" },
                  { label: "Extra 48px", val: "48px" },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => {
                      applyProp("padding", p.val);
                      onClose();
                    }}
                    className={`px-1.5 py-1 rounded border text-[10px] font-medium cursor-pointer text-center ${
                      elementMeta.padding === p.val
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Margin
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: "None 0", val: "0px" },
                  { label: "Small 8px", val: "8px" },
                  { label: "Medium 16px", val: "16px" },
                  { label: "Large 24px", val: "24px" },
                ].map((m) => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => {
                      applyProp("margin", m.val);
                      onClose();
                    }}
                    className={`px-1.5 py-1 rounded border text-[10px] font-medium cursor-pointer text-center ${
                      elementMeta.margin === m.val
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === Layout Submenu (Card / Container) === */}
        {activeSubmenu === "layout" && (
          <div className="space-y-2.5">
            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Direction / Flow
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: "Vertical (Column)", val: "column" },
                  { label: "Horizontal (Row)", val: "row" },
                  { label: "Split Right (Reverse)", val: "row-reverse" },
                ].map((d) => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => {
                      applyProp("flexDirection", d.val);
                      onClose();
                    }}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[10.5px] font-medium cursor-pointer text-center"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Align Items
              </div>
              <div className="grid grid-cols-2 gap-1">
                {["flex-start", "center", "flex-end", "stretch"].map((al) => (
                  <button
                    key={al}
                    type="button"
                    onClick={() => {
                      applyProp("alignItems", al);
                      onClose();
                    }}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[10px] font-medium cursor-pointer text-center"
                  >
                    {al.replace("flex-", "")}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Gap
              </div>
              <div className="flex flex-wrap gap-1">
                {["0px", "8px", "16px", "24px", "32px"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      applyProp("gap", g);
                      onClose();
                    }}
                    className="px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-50 text-[10.5px] font-medium cursor-pointer"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === Media & Ratio Submenu (Image / Video) === */}
        {activeSubmenu === "ratio-fit" && (
          <div className="space-y-2.5">
            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Aspect Ratio
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: "Auto", val: "auto" },
                  { label: "1:1 Square", val: "1/1" },
                  { label: "4:3 Standard", val: "4/3" },
                  { label: "16:9 Wide", val: "16/9" },
                  { label: "21:9 Cinema", val: "21/9" },
                  { label: "3:4 Portrait", val: "3/4" },
                ].map((ar) => (
                  <button
                    key={ar.val}
                    type="button"
                    onClick={() => {
                      applyProp("aspectRatio", ar.val);
                      onClose();
                    }}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[10.5px] font-medium cursor-pointer text-center"
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Object Fit
              </div>
              <div className="grid grid-cols-3 gap-1">
                {["cover", "contain", "fill"].map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => {
                      applyProp("objectFit", fit);
                      onClose();
                    }}
                    className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[10.5px] font-medium cursor-pointer text-center capitalize"
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === Button Content & Link Submenu === */}
        {activeSubmenu === "button-content" && (
          <div className="space-y-2">
            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Button Text
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Button label..."
                  defaultValue={typeof elementMeta.text === "string" ? elementMeta.text : ""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applyProp("text", (e.target as HTMLInputElement).value);
                      onClose();
                    }
                  }}
                  id="ctx-btn-text"
                  className="flex-1 px-2 py-1 text-[11px] border border-slate-200 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("ctx-btn-text") as HTMLInputElement;
                    if (input) {
                      applyProp("text", input.value);
                      onClose();
                    }
                  }}
                  className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
                Target Link URL
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="https://..."
                  defaultValue={typeof elementMeta.url === "string" ? elementMeta.url : ""}
                  id="ctx-btn-url"
                  className="flex-1 px-2 py-1 text-[11px] border border-slate-200 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("ctx-btn-url") as HTMLInputElement;
                    if (input) {
                      applyProp("url", input.value);
                      onClose();
                    }
                  }}
                  className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  Set
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <button
                type="button"
                onClick={() => {
                  applyProp("newTab", !elementMeta.newTab);
                  onClose();
                }}
                className="flex w-full items-center justify-between px-2 py-1 hover:bg-slate-100 rounded cursor-pointer"
              >
                <span>Open in New Tab</span>
                <span className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${elementMeta.newTab ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"}`}>
                  {Boolean(elementMeta.newTab) && <Check className="h-2.5 w-2.5" />}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* === Section Layout Submenu === */}
        {activeSubmenu === "section-layout" && (
          <div className="space-y-1">
            <div className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1 px-1">
              Section Actions
            </div>
            {onSwapVariant && (
              <button
                type="button"
                onClick={() => {
                  onSwapVariant();
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-100 text-left cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
                <span>Swap Variant Layout</span>
              </button>
            )}
            {onDuplicateSection && (
              <button
                type="button"
                onClick={() => {
                  onDuplicateSection();
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-100 text-left cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5 text-emerald-500" />
                <span>Duplicate Section</span>
              </button>
            )}
            {onMoveSectionUp && (
              <button
                type="button"
                onClick={() => {
                  onMoveSectionUp();
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-100 text-left cursor-pointer"
              >
                <ArrowUp className="h-3.5 w-3.5 text-slate-500" />
                <span>Move Section Up</span>
              </button>
            )}
            {onMoveSectionDown && (
              <button
                type="button"
                onClick={() => {
                  onMoveSectionDown();
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-100 text-left cursor-pointer"
              >
                <ArrowDown className="h-3.5 w-3.5 text-slate-500" />
                <span>Move Section Down</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`${config.badge} Context Menu`}
      data-xite-context-menu=""
      data-xite-toolbar=""
      className="fixed z-[100000] w-56 rounded-xl border border-slate-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 select-none"
      style={{ top: adjustedY, left: adjustedX }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header with badge and tag */}
      <div className="flex items-center justify-between border-b border-slate-100 px-2.5 py-1.5 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`rounded px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider border ${config.badgeClass}`}
          >
            {config.badge}
          </span>
          {tag && <span className="font-mono text-[10px] text-slate-400 truncate">&lt;{tag}&gt;</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 rounded p-0.5 cursor-pointer"
          aria-label="Close menu"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Flyout Submenu Rendering */}
      {renderSubmenu()}

      {/* Category Tools & Quick Actions */}
      <div className="space-y-0.5 text-[11.5px] font-medium text-slate-700">
        {/* Quick text editing */}
        {(elementType === "heading" || elementType === "text") && onEdit && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5 text-indigo-500" />
            <span>Edit Text Directly</span>
          </button>
        )}

        {/* ── Heading Tag Category ── */}
        {elementType === "heading" && onChangeHeadingLevel && (
          <button
            type="button"
            onClick={() => setActiveSubmenu(activeSubmenu === "heading-level" ? null : "heading-level")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Type className="h-3.5 w-3.5 text-pink-500" />
              <span>Heading Tag</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </button>
        )}

        {/* ── Typography Category ── */}
        {(elementType === "heading" || elementType === "text" || elementType === "button") && (
          <button
            type="button"
            onClick={() => setActiveSubmenu(activeSubmenu === "typography" ? null : "typography")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-purple-500" />
              <span>Typography</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </button>
        )}

        {/* ── Alignment Category ── */}
        {(elementType === "heading" || elementType === "text") && (
          <button
            type="button"
            onClick={() => setActiveSubmenu(activeSubmenu === "alignment" ? null : "alignment")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AlignLeft className="h-3.5 w-3.5 text-amber-500" />
              <span>Alignment</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </button>
        )}

        {/* ── Button Content & Link Category ── */}
        {elementType === "button" && (
          <button
            type="button"
            onClick={() => setActiveSubmenu(activeSubmenu === "button-content" ? null : "button-content")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LinkIcon className="h-3.5 w-3.5 text-indigo-500" />
              <span>Content & Link</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </button>
        )}

        {/* ── Layout Category (Card / Container) ── */}
        {(elementType === "card" || elementType === "container") && (
          <button
            type="button"
            onClick={() => setActiveSubmenu(activeSubmenu === "layout" ? null : "layout")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layout className="h-3.5 w-3.5 text-blue-500" />
              <span>Layout & Flow</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </button>
        )}

        {/* ── Section Layout Category ── */}
        {elementType === "section" && (
          <>
            {onOpenSectionToolbar && (
              <button
                type="button"
                onClick={() => {
                  onOpenSectionToolbar();
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
              >
                <Palette className="h-3.5 w-3.5 text-blue-500" />
                <span>Open Section Background Settings</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveSubmenu(activeSubmenu === "section-layout" ? null : "section-layout")}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layout className="h-3.5 w-3.5 text-cyan-500" />
                <span>Section Layout</span>
              </div>
              <ChevronRight className="h-3 w-3 text-slate-400" />
            </button>
          </>
        )}

        {/* ── Style (Background, Radius, Shadow) Category ── */}
        <button
          type="button"
          onClick={() => setActiveSubmenu(activeSubmenu === "style" ? null : "style")}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Style & Shape</span>
          </div>
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </button>

        {/* ── Spacing (Padding, Margin) Category ── */}
        {elementType !== "section" && (
          <button
            type="button"
            onClick={() => setActiveSubmenu(activeSubmenu === "spacing" ? null : "spacing")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-emerald-500" />
              <span>Spacing</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </button>
        )}

        {/* ── Ratio & Fit Category (Image / Video) ── */}
        {(elementType === "image" || elementType === "video" || elementType === "youtube") && (
          <button
            type="button"
            onClick={() => setActiveSubmenu(activeSubmenu === "ratio-fit" ? null : "ratio-fit")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Maximize2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Ratio & Fit</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </button>
        )}

        {/* ── Card Add Children Items ── */}
        {elementType === "card" && (
          <>
            <div className="h-px bg-slate-100 my-1" />
            {onAddMediaToCard && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onAddMediaToCard("image", undefined, "left");
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-emerald-700"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Add Image (Split Left)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddMediaToCard("image", undefined, "top");
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-emerald-700"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Add Image (Top)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddMediaToCard("video", undefined, "left");
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-cyan-700"
                >
                  <Video className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Add Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddMediaToCard("youtube", undefined, "top");
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-rose-700"
                >
                  <Youtube className="h-3.5 w-3.5 text-rose-500" />
                  <span>Add YouTube</span>
                </button>
              </>
            )}

            {onInsertChildIntoCard && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onInsertChildIntoCard("heading");
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-pink-700"
                >
                  <Type className="h-3.5 w-3.5 text-pink-500" />
                  <span>Add Heading</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onInsertChildIntoCard("text");
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-amber-700"
                >
                  <AlignLeft className="h-3.5 w-3.5 text-amber-500" />
                  <span>Add Paragraph</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onInsertChildIntoCard("button");
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-indigo-700"
                >
                  <Square className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Add Button</span>
                </button>
              </>
            )}

            {onRemoveMediaFromCard && (
              <button
                type="button"
                onClick={() => {
                  onRemoveMediaFromCard();
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 transition text-left cursor-pointer font-medium"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                <span>Remove Card Media</span>
              </button>
            )}
          </>
        )}

        {/* ── Media Quick Actions for Image/Video ── */}
        {elementType === "image" && onReplaceMedia && (
          <>
            <div className="h-px bg-slate-100 my-1" />
            <button
              type="button"
              onClick={() => {
                onReplaceMedia("video");
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-cyan-700"
            >
              <Video className="h-3.5 w-3.5 text-cyan-500" />
              <span>Replace with Video</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onReplaceMedia("youtube");
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-rose-700"
            >
              <Youtube className="h-3.5 w-3.5 text-rose-500" />
              <span>Replace with YouTube</span>
            </button>
          </>
        )}

        {elementType === "plus" && onReplacePlus && (
          <>
            <div className="h-px bg-slate-100 my-1" />
            <button
              type="button"
              onClick={() => {
                onReplacePlus("image");
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-emerald-700"
            >
              <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
              <span>Insert Image</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onReplacePlus("video");
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-cyan-700"
            >
              <Video className="h-3.5 w-3.5 text-cyan-500" />
              <span>Insert Video</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onReplacePlus("youtube");
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-rose-700"
            >
              <Youtube className="h-3.5 w-3.5 text-rose-500" />
              <span>Insert YouTube</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onReplacePlus("icon");
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition text-left cursor-pointer text-purple-700"
            >
              <Star className="h-3.5 w-3.5 text-purple-500" />
              <span>Insert Icon</span>
            </button>
          </>
        )}

        {/* ── Standard Common Actions ── */}
        <div className="h-px bg-slate-100 my-1" />

        {/* Duplicate */}
        {(onDuplicate || onDuplicateSection) && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              if (elementType === "section" && onDuplicateSection) {
                onDuplicateSection();
              } else if (onDuplicate) {
                onDuplicate();
              }
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5 text-emerald-500" />
            <span>Duplicate {config.badge.toLowerCase()}</span>
          </button>
        )}

        {/* Copy Style */}
        <button
          type="button"
          onClick={handleCopyStyle}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Scissors className="h-3.5 w-3.5 text-blue-500" />
            <span>Copy Style</span>
          </div>
          {copiedStyle && <Check className="h-3 w-3 text-emerald-600" />}
        </button>

        {/* Paste Style */}
        {globalStyleClipboard && (
          <button
            type="button"
            onClick={handlePasteStyle}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer text-indigo-700 font-semibold"
          >
            <ClipboardCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Paste Style</span>
          </button>
        )}

        {/* Move Up */}
        {(onMoveUp || onMoveSectionUp) && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              if (elementType === "section" && onMoveSectionUp) {
                onMoveSectionUp();
              } else if (onMoveUp) {
                onMoveUp();
              }
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <ArrowUp className="h-3.5 w-3.5 text-slate-500" />
            <span>Move Up</span>
          </button>
        )}

        {/* Move Down */}
        {(onMoveDown || onMoveSectionDown) && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              if (elementType === "section" && onMoveSectionDown) {
                onMoveSectionDown();
              } else if (onMoveDown) {
                onMoveDown();
              }
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <ArrowDown className="h-3.5 w-3.5 text-slate-500" />
            <span>Move Down</span>
          </button>
        )}

        {/* Parent Ancestor Selector */}
        {immediateParent && onSelectAncestor && (
          <>
            <div className="h-px bg-slate-100 my-1" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onSelectAncestor(immediateParent.path, immediateParent.type);
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer text-slate-600"
            >
              <Layers className="h-3.5 w-3.5 text-violet-500" />
              <span>Select {immediateParent.label}</span>
            </button>
          </>
        )}

        {/* Delete */}
        {(onDelete || onDeleteSection) && (
          <>
            <div className="h-px bg-slate-100 my-1" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                if (elementType === "section" && onDeleteSection) {
                  onDeleteSection();
                } else if (onDelete) {
                  onDelete();
                }
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              <span>Delete {config.badge.toLowerCase()}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
