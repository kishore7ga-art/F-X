"use client";

import React, { useState, useRef, useEffect, useCallback, type KeyboardEvent, type FocusEvent } from "react";

export interface EditableTextProps {
  /** Initial text content */
  value: string;
  /** HTML tag to render (h1, h2, h3, h4, p, span, button, div, etc.) */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "button" | "div" | "label" | "strong" | "small";
  /** Callback fired when edit is committed (onBlur or Enter) */
  onSave?: (newValue: string) => void;
  /** Callback fired if edit is cancelled with Escape */
  onCancel?: () => void;
  /** Whether this element is single-line (Enter commits) or multiline (Enter inserts line break) */
  multiline?: boolean;
  /** Custom CSS classes (Tailwind or custom) - typography & layout are fully preserved */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Optional placeholder when empty */
  placeholder?: string;
  /** Whether inline editing is enabled (defaults to true) */
  editable?: boolean;
  /** Child nodes or fallback content */
  children?: React.ReactNode;
}

/**
 * EditableText Component
 * 
 * Allows users to double-click on any text element to edit inline:
 * - Single click: standard selection
 * - Double click: activates contentEditable="true" with active blue outline (#3b82f6) & focus glow
 * - Preserves font sizes, text gradients, weights, line heights, and alignments without layout shifts
 * - Enter: commits edit (single-line)
 * - Shift + Enter: inserts newline (multiline)
 * - Escape: cancels edit & reverts to original value
 * - Click outside (onBlur): commits edit and saves to store
 */
export const EditableText: React.FC<EditableTextProps> = ({
  value,
  as: Component = "span",
  onSave,
  onCancel,
  multiline = false,
  className = "",
  style = {},
  placeholder = "Type text...",
  editable = true,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const originalValueRef = useRef<string>(value);

  // Auto-detect multiline from tag if not explicitly set
  const isMultilineTag = multiline || ["p", "blockquote", "div"].includes(Component);

  // Synchronize when external value changes while not editing
  useEffect(() => {
    if (!isEditing && elementRef.current) {
      if (elementRef.current.innerText !== value && !children) {
        elementRef.current.innerText = value;
      }
    }
  }, [value, isEditing, children]);

  // Handle Double-Click Activation
  const handleDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!editable) return;
    e.stopPropagation();

    originalValueRef.current = elementRef.current?.innerText || value;
    setIsEditing(true);

    const clickX = e.clientX;
    const clickY = e.clientY;

    // Use requestAnimationFrame to place caret precisely at clicked coordinates
    requestAnimationFrame(() => {
      const el = elementRef.current;
      if (!el) return;

      el.focus();

      if (typeof document !== "undefined") {
        let range: Range | null = null;
        if ((document as any).caretRangeFromPoint) {
          range = (document as any).caretRangeFromPoint(clickX, clickY);
        } else if ((document as any).caretPositionFromPoint) {
          const pos = (document as any).caretPositionFromPoint(clickX, clickY);
          if (pos) {
            range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
          }
        }

        const sel = window.getSelection();
        if (range && sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (sel) {
          // Fallback: place caret at the end
          const r = document.createRange();
          r.selectNodeContents(el);
          r.collapse(false);
          sel.removeAllRanges();
          sel.addRange(r);
        }
      }
    });
  };

  // Handle Commit on Blur / Click Outside
  const handleBlur = useCallback((_e: FocusEvent<HTMLElement>) => {
    if (!isEditing) return;

    setIsEditing(false);
    const newText = elementRef.current?.innerText ?? value;

    if (newText !== originalValueRef.current) {
      onSave?.(newText);
    }
  }, [isEditing, onSave, value]);

  // Handle Keyboard Shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!isEditing) return;

    // Escape: Revert to original text & cancel
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();

      if (elementRef.current) {
        elementRef.current.innerText = originalValueRef.current;
      }
      setIsEditing(false);
      onCancel?.();
      return;
    }

    // Enter Key
    if (e.key === "Enter") {
      if (!isMultilineTag && !e.shiftKey) {
        // Single line: Commit & Blur
        e.preventDefault();
        e.stopPropagation();
        elementRef.current?.blur();
      }
    }
  };

  // Active Blue Visual Indicator Styles (#3b82f6)
  const isBlock = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div"].includes(Component);
  const activeEditingStyles: React.CSSProperties = isEditing
    ? {
        outline: "2px solid #3b82f6",
        outlineOffset: "3px",
        borderRadius: "4px",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2), 0 0 10px rgba(59, 130, 246, 0.25)",
        cursor: "text",
        userSelect: "text",
        WebkitUserSelect: "text",
        transition: "outline 0.15s ease, box-shadow 0.15s ease",
        minWidth: "1ch",
        display: style.display || (isBlock ? "block" : "inline-block"),
      }
    : {};

  return React.createElement(
    Component,
    {
      ref: elementRef,
      contentEditable: isEditing,
      suppressContentEditableWarning: true,
      onDoubleClick: handleDoubleClick,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      "data-editable-text": "true",
      "data-placeholder": placeholder,
      className: `${className} ${isEditing ? "xite-text-editing select-text" : ""}`.trim(),
      style: {
        ...style,
        ...activeEditingStyles,
      },
    },
    children || value
  );
};

export default EditableText;
