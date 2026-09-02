"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import type { CanvasElement } from "@/stores/useVisualCanvasStore";

interface EditableTextNodeProps {
  element: CanvasElement;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onFinishEdit: (newContent: string) => void;
  onCancelEdit: () => void;
}

export function EditableTextNode({
  element,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
}: EditableTextNodeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const initialContentRef = useRef(element.content);

  // Keep track of content
  useEffect(() => {
    if (!isEditing && contentRef.current) {
      contentRef.current.innerText = element.content;
      initialContentRef.current = element.content;
    }
  }, [element.content, isEditing]);

  // Focus and position caret on double click
  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      try {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch {}
    }
  }, [isEditing]);

  // Single-Click Selection Handler
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onSelect();
    }
  };

  // Double-Click Live Inline Edit Activation
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    initialContentRef.current = contentRef.current?.innerText || element.content;
    onStartEdit();

    // Programmatically set contentEditable and focus
    if (contentRef.current) {
      contentRef.current.contentEditable = "true";
      contentRef.current.focus();
    }

    // Place caret at mouse point if supported
    if (typeof document !== "undefined") {
      const clickX = e.clientX;
      const clickY = e.clientY;
      let range: Range | null = null;
      if ((document as any).caretRangeFromPoint) {
        range = (document as any).caretRangeFromPoint(clickX, clickY);
      }
      if (range) {
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  // Blur / Click-Outside Commit
  const handleBlur = () => {
    if (isEditing && contentRef.current) {
      const updatedText = contentRef.current.innerText.trim();
      onFinishEdit(updatedText || element.content);
    }
  };

  // Key Event Handling (Enter, Shift+Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditing) return;

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (contentRef.current) {
        contentRef.current.innerText = initialContentRef.current;
      }
      onCancelEdit();
      return;
    }

    const isSingleLine = ["heading", "subheading", "button", "badge"].includes(element.type);

    if (e.key === "Enter") {
      if (isSingleLine && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleBlur();
        return;
      }

      if (e.shiftKey || !isSingleLine) {
        // Standard multiline break injection
        return;
      }
    }
  };

  const isSingleLine = ["heading", "subheading", "button", "badge"].includes(element.type);

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`relative group ${isEditing ? "cursor-text" : "cursor-move"}`}
      style={{
        width: typeof element.dimensions.width === "number" ? `${element.dimensions.width}px` : "auto",
        maxWidth: "100%",
      }}
    >
      {/* 1. The Real Editable Content Node */}
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`transition-all select-none outline-none ${
          isEditing ? "select-text ring-2 ring-blue-600 rounded-[4px] shadow-sm" : ""
        }`}
        style={{
          ...element.styles,
          outline: isEditing ? "2px solid #2563eb" : "none",
          outlineOffset: isEditing ? "2px" : "0",
          borderRadius: isEditing ? "4px" : (element.styles.borderRadius as string) || "0px",
          whiteSpace: isSingleLine ? "nowrap" : "pre-wrap",
          wordBreak: "break-word",
          display: element.type === "badge" || element.type === "button" ? "inline-block" : "block",
        }}
      >
        {element.content}
      </div>

      {/* 2. Selection Bounding Box & 8 Transformation Node Handles (Shown when Selected & Not Editing) */}
      {isSelected && !isEditing && (
        <div className="absolute -inset-1 border-2 border-blue-500 rounded-[3px] pointer-events-none z-30">
          {/* Corner Node Handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm shadow-sm" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm shadow-sm" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm shadow-sm" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm shadow-sm" />

          {/* Edge Midpoint Node Handles */}
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-sm" />
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-sm" />
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-sm" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-sm" />

          {/* Type Badge */}
          <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[8.5px] uppercase tracking-wider shadow-sm pointer-events-none">
            {element.type}
          </div>
        </div>
      )}
    </div>
  );
}
