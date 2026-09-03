"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Palette,
  Highlighter,
  X,
  Check,
  Move,
} from "lucide-react";

// ============================================================================
// 1. Types & Interfaces
// ============================================================================

export interface InlineEditableElementProps {
  /** Unique element identifier */
  id: string;
  /** Initial or current HTML/text content */
  initialHtml: string;
  /** Tag type for the element root container when not editing */
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span" | "blockquote";
  /** Emitted when text editing concludes and valid sanitized content is saved */
  onTextUpdate?: (id: string, newHtmlContent: string) => void;
  /** Whether the element's bounding box is currently selected by the builder */
  isSelected?: boolean;
  /** Callback to notify parent builder that this element was single-clicked/selected */
  onSelect?: (id: string, e: React.MouseEvent) => void;
  /** Drag start handler for builder's element movement */
  onDragStart?: (id: string, e: React.MouseEvent) => void;
  /** Additional CSS class names to preserve layout */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** If true, editing and selection are disabled */
  disabled?: boolean;
  /** Custom portal container for floating toolbar (defaults to document.body) */
  portalContainer?: HTMLElement;
}

export type HeadingLevel = "p" | "h1" | "h2" | "h3";
export type TextAlign = "left" | "center" | "right";

interface ToolbarPosition {
  top: number;
  left: number;
  placement: "top" | "bottom";
}

// Preset color options for quick styling
const TEXT_COLORS = [
  "#000000",
  "#374151",
  "#6b7280",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#16a34a",
  "#0284c7",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ffffff",
];

const HIGHLIGHT_COLORS = [
  "transparent",
  "#fef08a", // yellow
  "#bbf7d0", // green
  "#bae6fd", // blue
  "#fbcfe8", // pink
  "#fed7aa", // orange
  "#e9d5ff", // purple
];

// ============================================================================
// 2. HTML Sanitization Helper (XSS Protection)
// ============================================================================

/**
 * Lightweight client-side DOM sanitizer that strips dangerous tags,
 * `javascript:` protocols, and inline script attributes (`onerror`, `onclick`, etc.).
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (typeof window === "undefined") return dirtyHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(dirtyHtml, "text/html");

  // Elements to unconditionally remove
  const disallowedTags = [
    "script",
    "iframe",
    "object",
    "embed",
    "base",
    "form",
    "input",
    "button",
    "textarea",
    "meta",
    "link",
  ];

  disallowedTags.forEach((tag) => {
    const elements = doc.querySelectorAll(tag);
    elements.forEach((el) => el.remove());
  });

  // Whitelist safe elements and strip dangerous attributes
  const allElements = doc.body.querySelectorAll("*");
  allElements.forEach((el) => {
    const element = el as HTMLElement;

    // Remove event handlers and javascript: execution paths
    const attributes = Array.from(element.attributes);
    for (const attr of attributes) {
      const name = attr.name.toLowerCase();
      const val = attr.value.toLowerCase().trim();

      if (name.startsWith("on") || val.startsWith("javascript:") || val.startsWith("data:text/html")) {
        element.removeAttribute(attr.name);
      }
    }

    // Ensure links open safely
    if (element.tagName.toLowerCase() === "a") {
      element.setAttribute("rel", "noopener noreferrer");
      if (!element.getAttribute("target")) {
        element.setAttribute("target", "_blank");
      }
    }
  });

  return doc.body.innerHTML;
}

// ============================================================================
// 3. Floating Formatting Toolbar Component
// ============================================================================

interface FloatingToolbarProps {
  targetElement: HTMLElement | null;
  onApplyFormat: (command: string, value?: string) => void;
  onApplyTag: (tag: HeadingLevel) => void;
  onClose: () => void;
  currentTag: HeadingLevel;
  portalContainer?: HTMLElement;
}

function FloatingToolbar({
  targetElement,
  onApplyFormat,
  onApplyTag,
  currentTag,
  portalContainer,
}: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<ToolbarPosition | null>(null);

  // Submenu states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Active formatting button states (queried from document selection)
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<TextAlign>("left");

  // Query formatting state of current selection
  const updateSelectionState = useCallback(() => {
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));

      if (document.queryCommandState("justifyCenter")) {
        setTextAlign("center");
      } else if (document.queryCommandState("justifyRight")) {
        setTextAlign("right");
      } else {
        setTextAlign("left");
      }
    } catch {
      // document.queryCommandState can fail in some edge iframe cases
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateSelectionState);
    return () => document.removeEventListener("selectionchange", updateSelectionState);
  }, [updateSelectionState]);

  // Position calculation based on getBoundingClientRect()
  const calculatePosition = useCallback(() => {
    if (!targetElement) return;

    // If there's a specific text selection range, prioritize anchoring to the selected text;
    // otherwise, anchor to the active target element.
    const selection = window.getSelection();
    let targetRect = targetElement.getBoundingClientRect();

    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const rangeRect = selection.getRangeAt(0).getBoundingClientRect();
      if (rangeRect.width > 0 && rangeRect.height > 0) {
        targetRect = rangeRect;
      }
    }

    const toolbarWidth = toolbarRef.current?.offsetWidth || 480;
    const toolbarHeight = toolbarRef.current?.offsetHeight || 44;
    const margin = 10;

    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Horizontally center above element
    let left = targetRect.left + scrollX + targetRect.width / 2 - toolbarWidth / 2;

    // Viewport edge collision protection
    const minLeft = 12 + scrollX;
    const maxLeft = window.innerWidth - toolbarWidth - 12 + scrollX;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    // Determine top vs bottom placement based on top viewport boundary
    let top = targetRect.top + scrollY - toolbarHeight - margin;
    let placement: "top" | "bottom" = "top";

    if (targetRect.top - toolbarHeight - margin < 12) {
      // Flip below if too close to ceiling
      top = targetRect.bottom + scrollY + margin;
      placement = "bottom";
    }

    setPos({ top, left, placement });
  }, [targetElement]);

  useLayoutEffect(() => {
    calculatePosition();
    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);
    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [calculatePosition]);

  // Focus link input when opened
  useEffect(() => {
    if (showLinkInput) {
      setTimeout(() => linkInputRef.current?.focus(), 50);
    }
  }, [showLinkInput]);

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      let formattedUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith("#") && !formattedUrl.startsWith("/")) {
        formattedUrl = `https://${formattedUrl}`;
      }
      onApplyFormat("createLink", formattedUrl);
    } else {
      onApplyFormat("unlink");
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  if (!targetElement) return null;

  const toolbarContent = (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Text Formatting Toolbar"
      className="fixed z-[99999] flex items-center gap-0.5 rounded-lg bg-slate-900/95 text-white px-2 py-1.5 shadow-2xl backdrop-blur-md border border-slate-700/80 transition-opacity duration-150 animate-in fade-in zoom-in-95 select-none"
      style={{
        top: pos ? `${pos.top}px` : "-9999px",
        left: pos ? `${pos.left}px` : "-9999px",
        pointerEvents: pos ? "auto" : "none",
      }}
      onMouseDown={(e) => {
        // Crucial: Prevent toolbar clicks from causing contentEditable blur / lost focus
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Heading / Tag Selector */}
      <div className="flex items-center bg-slate-800/80 rounded-md p-0.5 mr-1 border border-slate-700">
        <button
          type="button"
          title="Paragraph"
          onClick={() => onApplyTag("p")}
          className={`p-1.5 rounded hover:bg-slate-700 transition ${
            currentTag === "p" ? "bg-blue-600 text-white" : "text-slate-300"
          }`}
        >
          <Pilcrow className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Heading 1"
          onClick={() => onApplyTag("h1")}
          className={`p-1.5 rounded hover:bg-slate-700 transition ${
            currentTag === "h1" ? "bg-blue-600 text-white" : "text-slate-300"
          }`}
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Heading 2"
          onClick={() => onApplyTag("h2")}
          className={`p-1.5 rounded hover:bg-slate-700 transition ${
            currentTag === "h2" ? "bg-blue-600 text-white" : "text-slate-300"
          }`}
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Heading 3"
          onClick={() => onApplyTag("h3")}
          className={`p-1.5 rounded hover:bg-slate-700 transition ${
            currentTag === "h3" ? "bg-blue-600 text-white" : "text-slate-300"
          }`}
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-700 mx-0.5" />

      {/* Bold, Italic, Underline */}
      <button
        type="button"
        title="Bold (Ctrl+B)"
        onClick={() => onApplyFormat("bold")}
        className={`p-1.5 rounded hover:bg-slate-800 transition ${
          isBold ? "bg-blue-600/90 text-white font-bold" : "text-slate-200"
        }`}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="Italic (Ctrl+I)"
        onClick={() => onApplyFormat("italic")}
        className={`p-1.5 rounded hover:bg-slate-800 transition ${
          isItalic ? "bg-blue-600/90 text-white italic" : "text-slate-200"
        }`}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="Underline (Ctrl+U)"
        onClick={() => onApplyFormat("underline")}
        className={`p-1.5 rounded hover:bg-slate-800 transition ${
          isUnderline ? "bg-blue-600/90 text-white underline" : "text-slate-200"
        }`}
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-5 bg-slate-700 mx-0.5" />

      {/* Text Alignment */}
      <button
        type="button"
        title="Align Left"
        onClick={() => onApplyFormat("justifyLeft")}
        className={`p-1.5 rounded hover:bg-slate-800 transition ${
          textAlign === "left" ? "bg-blue-600/90 text-white" : "text-slate-200"
        }`}
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="Align Center"
        onClick={() => onApplyFormat("justifyCenter")}
        className={`p-1.5 rounded hover:bg-slate-800 transition ${
          textAlign === "center" ? "bg-blue-600/90 text-white" : "text-slate-200"
        }`}
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="Align Right"
        onClick={() => onApplyFormat("justifyRight")}
        className={`p-1.5 rounded hover:bg-slate-800 transition ${
          textAlign === "right" ? "bg-blue-600/90 text-white" : "text-slate-200"
        }`}
      >
        <AlignRight className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-5 bg-slate-700 mx-0.5" />

      {/* Text Color Picker Trigger */}
      <div className="relative">
        <button
          type="button"
          title="Text Color"
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowHighlightPicker(false);
            setShowLinkInput(false);
          }}
          className={`p-1.5 rounded hover:bg-slate-800 transition flex items-center gap-1 ${
            showColorPicker ? "bg-slate-800 text-blue-400" : "text-slate-200"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {showColorPicker && (
          <div
            className="absolute top-full left-0 mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl grid grid-cols-6 gap-1.5 z-50"
            onMouseDown={(e) => e.preventDefault()}
          >
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="w-5 h-5 rounded-full border border-slate-600 hover:scale-115 transition"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onApplyFormat("foreColor", color);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Background Highlight Picker Trigger */}
      <div className="relative">
        <button
          type="button"
          title="Highlight Background"
          onClick={() => {
            setShowHighlightPicker(!showHighlightPicker);
            setShowColorPicker(false);
            setShowLinkInput(false);
          }}
          className={`p-1.5 rounded hover:bg-slate-800 transition flex items-center gap-1 ${
            showHighlightPicker ? "bg-slate-800 text-yellow-300" : "text-slate-200"
          }`}
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        {showHighlightPicker && (
          <div
            className="absolute top-full left-0 mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl flex gap-1.5 z-50"
            onMouseDown={(e) => e.preventDefault()}
          >
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="w-5 h-5 rounded-full border border-slate-600 hover:scale-115 transition flex items-center justify-center text-slate-400"
                style={{ backgroundColor: color === "transparent" ? "#334155" : color }}
                title={color === "transparent" ? "Clear Highlight" : color}
                onClick={() => {
                  onApplyFormat("hiliteColor", color);
                  setShowHighlightPicker(false);
                }}
              >
                {color === "transparent" && <X className="w-3 h-3 text-red-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-slate-700 mx-0.5" />

      {/* Link Insertion */}
      <div className="relative">
        <button
          type="button"
          title="Insert Link"
          onClick={() => {
            setShowLinkInput(!showLinkInput);
            setShowColorPicker(false);
            setShowHighlightPicker(false);
          }}
          className={`p-1.5 rounded hover:bg-slate-800 transition ${
            showLinkInput ? "bg-slate-800 text-blue-400" : "text-slate-200"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        {showLinkInput && (
          <form
            onSubmit={handleLinkSubmit}
            className="absolute top-full right-0 mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl flex items-center gap-1.5 z-50 min-w-[240px]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              ref={linkInputRef}
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="px-2 py-1 text-xs bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500 flex-1"
            />
            <button
              type="submit"
              className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition"
              title="Apply Link"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyFormat("unlink");
                setShowLinkInput(false);
              }}
              className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
              title="Remove Link"
            >
              <Unlink className="w-3 h-3" />
            </button>
          </form>
        )}
      </div>
    </div>
  );

  const container = portalContainer || (typeof document !== "undefined" ? document.body : null);
  if (!container) return null;

  return createPortal(toolbarContent, container);
}

// ============================================================================
// 4. Main InlineEditableElement Component
// ============================================================================

export function InlineEditableElement({
  id,
  initialHtml,
  as: ComponentTag = "div",
  onTextUpdate,
  isSelected = false,
  onSelect,
  onDragStart,
  className = "",
  style,
  disabled = false,
  portalContainer,
}: InlineEditableElementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState<HeadingLevel>(
    (["h1", "h2", "h3", "p"].includes(ComponentTag) ? ComponentTag : "p") as HeadingLevel
  );

  const elementRef = useRef<HTMLElement | null>(null);
  const originalHtmlRef = useRef<string>(initialHtml);

  // Synchronize initialHtml when prop changes externally and not in editing mode
  useEffect(() => {
    if (!isEditing && elementRef.current) {
      if (elementRef.current.innerHTML !== initialHtml) {
        elementRef.current.innerHTML = initialHtml;
      }
      originalHtmlRef.current = initialHtml;
    }
  }, [initialHtml, isEditing]);

  /**
   * Save content, sanitize HTML, and emit onTextUpdate
   */
  const commitChanges = useCallback(() => {
    if (!elementRef.current) return;

    const rawHtml = elementRef.current.innerHTML;
    const clean = sanitizeHtml(rawHtml);

    // Only emit if content actually changed
    if (clean !== originalHtmlRef.current) {
      originalHtmlRef.current = clean;
      onTextUpdate?.(id, clean);
    }

    setIsEditing(false);
  }, [id, onTextUpdate]);

  /**
   * Revert content to pre-edit state
   */
  const cancelChanges = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.innerHTML = originalHtmlRef.current;
    }
    setIsEditing(false);
  }, []);

  /**
   * Activate inline edit mode on double-click
   */
  const handleDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;

    // Requirement 4: Stop event propagation to avoid triggering section / parent overlays
    e.preventDefault();
    e.stopPropagation();

    setIsEditing(true);
    originalHtmlRef.current = elementRef.current?.innerHTML || "";

    // Place caret at click position
    setTimeout(() => {
      if (!elementRef.current) return;
      elementRef.current.focus();

      const clientX = e.clientX;
      const clientY = e.clientY;

      try {
        if ((document as any).caretRangeFromPoint) {
          const range = (document as any).caretRangeFromPoint(clientX, clientY);
          if (range) {
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }
      } catch {
        // Fallback: select all or place caret at end
      }
    }, 10);
  };

  /**
   * Single-click selection for builder movement
   */
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isEditing) {
      // Isolate click events while editing so parent selection handlers don't take over
      e.stopPropagation();
      return;
    }

    if (onSelect) {
      e.stopPropagation();
      onSelect(id, e);
    }
  };

  /**
   * Keyboard shortcuts & typing isolation inside contentEditable
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!isEditing) return;

    // Requirement 1 & 4: Isolate typing (Space, Backspace, arrows) from builder hotkeys
    e.stopPropagation();

    // Requirement 5: Esc to exit
    if (e.key === "Escape") {
      e.preventDefault();
      cancelChanges();
      return;
    }

    // Requirement 5: Shift+Enter for line break (<br>), Enter for new line / paragraph
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Standard line break
        e.preventDefault();
        document.execCommand("insertLineBreak");
      } else {
        // Single-line headings: pressing Enter commits changes
        if (["h1", "h2", "h3"].includes(currentTag)) {
          e.preventDefault();
          commitChanges();
        }
      }
    }
  };

  /**
   * Requirement 3: Click-away / Blur handling
   */
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (elementRef.current && !elementRef.current.contains(target)) {
        commitChanges();
      }
    };

    // Use capture phase to ensure click outside is intercepted cleanly
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isEditing, commitChanges]);

  /**
   * Apply rich text execCommands while keeping selection
   */
  const handleApplyFormat = (command: string, value: string = "") => {
    if (!isEditing || !elementRef.current) return;
    elementRef.current.focus();
    document.execCommand(command, false, value);
  };

  /**
   * Format block tags (H1, H2, H3, P)
   */
  const handleApplyTag = (tag: HeadingLevel) => {
    if (!isEditing || !elementRef.current) return;
    elementRef.current.focus();

    // Use formatBlock for active selection/block
    const blockTag = tag === "p" ? "<p>" : `<${tag}>`;
    document.execCommand("formatBlock", false, blockTag);
    setCurrentTag(tag);
  };

  const ElementTag = ComponentTag as any;

  return (
    <div
      className={`relative group inline-block ${className}`}
      style={style}
      data-editable-id={id}
    >
      {/* 
        Selected Bounding Box & Drag Handle (Requirement 1 & 3):
        Visible only when selected AND NOT currently editing
      */}
      {isSelected && !isEditing && (
        <div
          className="absolute -inset-1 border-2 border-blue-500 border-dashed rounded pointer-events-none z-30"
          aria-hidden="true"
        >
          {onDragStart && (
            <div
              className="absolute -top-3 -left-3 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md pointer-events-auto"
              title="Drag element"
              onMouseDown={(e) => {
                e.stopPropagation();
                onDragStart(id, e);
              }}
            >
              <Move className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="absolute -top-5 right-0 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
            {currentTag}
          </span>
        </div>
      )}

      {/* The Editable Text Node */}
      <ElementTag
        ref={elementRef}
        contentEditable={isEditing && !disabled}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`outline-none transition-all duration-150 ${
          isEditing
            ? "cursor-text ring-2 ring-blue-500 ring-offset-2 rounded px-1 py-0.5 bg-blue-50/10"
            : isSelected
            ? "cursor-pointer"
            : "hover:outline-1 hover:outline-dashed hover:outline-slate-300"
        }`}
        style={{
          minWidth: "1ch",
          minHeight: "1.2em",
          userSelect: isEditing ? "text" : undefined,
          WebkitUserSelect: isEditing ? "text" : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: initialHtml }}
      />

      {/* Floating Formatting Toolbar */}
      {isEditing && (
        <FloatingToolbar
          targetElement={elementRef.current}
          onApplyFormat={handleApplyFormat}
          onApplyTag={handleApplyTag}
          onClose={commitChanges}
          currentTag={currentTag}
          portalContainer={portalContainer}
        />
      )}
    </div>
  );
}

export default InlineEditableElement;
