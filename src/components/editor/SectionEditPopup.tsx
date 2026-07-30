"use client";

import { useEffect, useRef } from "react";
import { X, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { SectionContentForm } from "@/components/editor/SectionContentForm";
import type { EditorSection } from "@/lib/editor/queries";

export type PopupAnchor = { x: number; y: number };

export function SectionEditPopup({
  section,
  onClose,
}: {
  section: EditorSection;
  anchor?: PopupAnchor;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-label={`Edit ${section.label}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 right-0 bottom-0 z-50 flex h-screen w-[420px] max-w-[calc(100vw-56px)] flex-col overflow-hidden bg-white text-slate-900 shadow-2xl border-l border-slate-200 font-sans select-none"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
              {section.label}
            </h3>
            <p className="text-xs font-medium text-slate-500 truncate">
              Section Editor &bull; {section.variantName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition"
          title="Close editor panel (Esc)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <SectionContentForm section={section} onClose={onClose} />
      </div>
    </motion.div>
  );
}
