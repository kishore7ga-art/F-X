"use client";

import React, { useState, useRef, useEffect } from "react";

export interface InlineEditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
}

export function InlineEditableText({
  value,
  onSave,
  as: Component = "span",
  className = "",
  style = {},
  placeholder = "Double click to edit text...",
  multiline = false,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(value);
  const elemRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setCurrentText(value);
  }, [value]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && elemRef.current) {
      const el = elemRef.current;
      el.contentEditable = "true";
      el.focus();

      // Select all text inside element for instant editing
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (err) {
        // ignore selection error
      }
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (!isEditing || !elemRef.current) return;
    const newText = elemRef.current.innerText.trim();
    elemRef.current.contentEditable = "false";
    setIsEditing(false);
    if (newText !== value) {
      setCurrentText(newText);
      onSave(newText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (!multiline || !e.shiftKey)) {
      e.preventDefault();
      elemRef.current?.blur();
    } else if (e.key === "Escape") {
      if (elemRef.current) {
        elemRef.current.innerText = value;
      }
      setIsEditing(false);
    }
  };

  return (
    <Component
      ref={elemRef as any}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`inline-editable-text ${isEditing ? "editing" : ""} ${className}`}
      style={{
        outline: isEditing ? "2px dashed #2563eb" : "none",
        outlineOffset: isEditing ? "4px" : "0px",
        borderRadius: isEditing ? "4px" : "0px",
        backgroundColor: isEditing ? "rgba(37, 99, 235, 0.08)" : "transparent",
        cursor: isEditing ? "text" : "pointer",
        userSelect: isEditing ? "text" : "auto",
        transition: "outline 0.15s ease, background-color 0.15s ease",
        ...style,
      }}
      title={isEditing ? "Editing... Press Enter or click outside to save" : "Double-click to edit inline"}
      suppressContentEditableWarning
    >
      {currentText || placeholder}
    </Component>
  );
}
