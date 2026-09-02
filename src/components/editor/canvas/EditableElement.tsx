"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

export type EditableTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "button"
  | "div"
  | "label"
  | "strong"
  | "small"
  | "a"
  | "li";

export interface EditableElementProps {
  id?: string;
  initialText?: string;
  tag?: EditableTag;
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
  onSelect?: () => void;
  onSave?: (newText: string) => void;
  onDragEnd?: (finalPos: { x: number; y: number }) => void;
  multiline?: boolean;
  children?: React.ReactNode;
}

export function EditableElement({
  id,
  initialText = "",
  tag = "div",
  className = "",
  style = {},
  isSelected = false,
  onSelect,
  onSave,
  onDragEnd,
  multiline = false,
  children,
}: EditableElementProps) {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, initialDeltaX: 0, initialDeltaY: 0 });
  const originalTextRef = useRef(initialText);

  // Synchronize text when initialText prop changes and not currently editing
  useEffect(() => {
    if (!isEditing) {
      setText(initialText);
      originalTextRef.current = initialText;
    }
  }, [initialText, isEditing]);

  // Programmatically focus element and place cursor at end on editing activation
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(textRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch {}
    }
  }, [isEditing]);

  // 1. Single-Click Selection Handler
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing && onSelect) {
      onSelect();
    }
  };

  // 2. Direct Double-Click to Type (contentEditable)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (textRef.current) {
      originalTextRef.current = textRef.current.innerText || text;
    }
    setIsEditing(true);
  };

  // onBlur: Commit and Save Text
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsEditing(false);
    const updated = (e.currentTarget.innerText || "").trim();
    setText(updated || originalTextRef.current);
    if (onSave) {
      onSave(updated || originalTextRef.current);
    }
  };

  // onKeyDown: Enter commits single-line, Escape reverts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!isEditing) return;

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (textRef.current) {
        textRef.current.innerText = originalTextRef.current;
      }
      setText(originalTextRef.current);
      setIsEditing(false);
      return;
    }

    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.blur();
    }
  };

  // 3. Pointer Drag to Move (when isEditing === false)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditing) return; // Allow dragging only when not currently in inline editing mode
    if (e.button !== 0) return; // Primary button only

    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialDeltaX: dragOffset.x,
      initialDeltaY: dragOffset.y,
    };

    let rafId: number | null = null;
    let latestEvt: PointerEvent | null = null;

    const processDrag = () => {
      rafId = null;
      if (!latestEvt) return;
      const dx = latestEvt.clientX - dragStartRef.current.x;
      const dy = latestEvt.clientY - dragStartRef.current.y;
      setDragOffset({
        x: dragStartRef.current.initialDeltaX + dx,
        y: dragStartRef.current.initialDeltaY + dy,
      });
    };

    const handlePointerMove = (moveEvt: PointerEvent) => {
      latestEvt = moveEvt;
      if (!rafId) {
        rafId = requestAnimationFrame(processDrag);
      }
    };

    const handlePointerUp = (upEvt: PointerEvent) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      setIsDragging(false);
      const finalDx = upEvt.clientX - dragStartRef.current.x;
      const finalDy = upEvt.clientY - dragStartRef.current.y;
      const finalPos = {
        x: dragStartRef.current.initialDeltaX + finalDx,
        y: dragStartRef.current.initialDeltaY + finalDy,
      };
      if (onDragEnd) {
        onDragEnd(finalPos);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      ref={containerRef}
      id={id}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      className={`relative group inline-block transition-none ${
        isEditing ? "cursor-text" : "cursor-move"
      } ${className}`}
      style={{
        ...style,
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
        userSelect: isDragging ? "none" : isEditing ? "text" : "auto",
        WebkitUserSelect: isDragging ? "none" : isEditing ? "text" : "auto",
        zIndex: isDragging ? 1000 : isSelected ? 50 : "auto",
      }}
    >
      {/* The Editable Element Node */}
      {React.createElement(
        tag,
        {
          ref: textRef as any,
          contentEditable: isEditing,
          suppressContentEditableWarning: true,
          onBlur: handleBlur,
          onKeyDown: handleKeyDown,
          className: `outline-none transition-all ${
            isEditing
              ? "outline-[2px] outline-blue-600 outline-offset-[2px] rounded-[4px] shadow-sm ring-2 ring-blue-500/20"
              : ""
          }`,
          style: {
            outline: isEditing ? "2px solid #2563eb" : "none",
            outlineOffset: isEditing ? "2px" : "0",
            borderRadius: isEditing ? "4px" : undefined,
            minWidth: isEditing ? "1rem" : undefined,
          },
        },
        children || text
      )}

      {/* Selection Bounding Box & 4 Corner Anchor Dots */}
      {isSelected && !isEditing && (
        <div className="absolute -inset-1 border border-blue-600 ring-1 ring-blue-500/30 rounded-[2px] pointer-events-none z-30">
          {/* 4 Corner Anchor Dots */}
          <div className="absolute -left-1 -top-1 w-[7px] h-[7px] bg-white border-[1.5px] border-blue-600 rounded-[1px] shadow-xs" />
          <div className="absolute -right-1 -top-1 w-[7px] h-[7px] bg-white border-[1.5px] border-blue-600 rounded-[1px] shadow-xs" />
          <div className="absolute -left-1 -bottom-1 w-[7px] h-[7px] bg-white border-[1.5px] border-blue-600 rounded-[1px] shadow-xs" />
          <div className="absolute -right-1 -bottom-1 w-[7px] h-[7px] bg-white border-[1.5px] border-blue-600 rounded-[1px] shadow-xs" />
        </div>
      )}
    </div>
  );
}

// Backward-compatible alias
export { EditableElement as EditableTextNode };
