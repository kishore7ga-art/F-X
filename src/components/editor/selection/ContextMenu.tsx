"use client";

import React, { useEffect, useRef } from "react";
import { Copy, Trash2, ArrowUp, ArrowDown, Layers, Edit3, X } from "lucide-react";
import type { ElementType, SelectionAncestor } from "@/lib/editor/selection-store";
import { TOOLBAR_CONFIG } from "./toolbar-config";

export interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  elementType: ElementType | null;
  tag?: string;
  ancestors?: SelectionAncestor[];
  onClose: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onSelectAncestor?: (path: string, type: ElementType) => void;
}

export function ContextMenu({
  isOpen,
  position,
  elementType,
  tag,
  ancestors = [],
  onClose,
  onEdit,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSelectAncestor,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

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

  const config = TOOLBAR_CONFIG[elementType];

  // Keep menu within viewport boundaries
  const adjustedX = Math.min(position.x, (typeof window !== "undefined" ? window.innerWidth : 1000) - 220);
  const adjustedY = Math.min(position.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 300);

  const immediateParent = ancestors.length > 1 ? ancestors[ancestors.length - 1] : null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`${config.badge} Context Menu`}
      data-xite-context-menu=""
      data-xite-toolbar=""
      className="fixed z-[100000] w-52 rounded-xl border border-slate-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 select-none"
      style={{ top: adjustedY, left: adjustedX }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header with badge */}
      <div className="flex items-center justify-between border-b border-slate-100 px-2.5 py-1.5 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`rounded px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider border ${config.badgeClass}`}
          >
            {config.badge}
          </span>
          {tag && <span className="font-mono text-[10px] text-slate-400">&lt;{tag}&gt;</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 rounded p-0.5"
          aria-label="Close menu"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-0.5 text-[11.5px] font-medium text-slate-700">
        {onEdit && (
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
            <span>Edit settings</span>
          </button>
        )}

        {onDuplicate && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDuplicate();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5 text-emerald-500" />
            <span>Duplicate {config.badge.toLowerCase()}</span>
          </button>
        )}

        {onMoveUp && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onMoveUp();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <ArrowUp className="h-3.5 w-3.5 text-slate-500" />
            <span>Move up</span>
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onMoveDown();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
          >
            <ArrowDown className="h-3.5 w-3.5 text-slate-500" />
            <span>Move down</span>
          </button>
        )}

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

        {onDelete && (
          <>
            <div className="h-px bg-slate-100 my-1" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onDelete();
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
