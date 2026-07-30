"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X, Sparkles } from "lucide-react";

import { SectionContentForm } from "@/components/editor/SectionContentForm";
import type { EditorSection } from "@/lib/editor/queries";
import { motion } from "motion/react";

const WIDTH = 520;
const MARGIN = 16;

export type PopupAnchor = { x: number; y: number };

export function SectionEditPopup({
  section,
  anchor,
  onClose,
}: {
  section: EditorSection;
  anchor: PopupAnchor;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(anchor);
  const [popupWidth, setPopupWidth] = useState(WIDTH);

  useLayoutEffect(() => {
    const currentWidth = Math.min(WIDTH, window.innerWidth - MARGIN * 2);
    setPopupWidth(currentWidth);

    const height = ref.current?.offsetHeight || 550;
    const maxX = Math.max(MARGIN, window.innerWidth - currentWidth - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - height - MARGIN);

    setPosition({
      x: Math.max(MARGIN, Math.min(anchor.x - currentWidth / 2, maxX)),
      y: Math.max(MARGIN, Math.min(anchor.y + 10, maxY)),
    });
  }, [anchor]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
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
      initial={{ opacity: 0, scale: 0.96, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      style={{ left: position.x, top: position.y, width: popupWidth }}
      className="fixed z-50 flex max-h-[calc(100vh-32px)] flex-col overflow-hidden rounded-3xl border border-[#26272B] bg-[#111113]/98 text-white shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl font-sans max-w-[calc(100vw-32px)]"
    >
      {/* Dark Glass Header bar */}
      <div className="flex items-center justify-between border-b border-[#26272B] bg-[#17171A] px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-md">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white tracking-tight truncate">
              {section.label}
            </h3>
            <p className="text-xs font-medium text-neutral-400 truncate">
              Section Editor &bull; {section.variantName}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 rounded-xl p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          title="Close editor popup (Esc)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <SectionContentForm section={section} onClose={onClose} />
      </div>
    </motion.div>
  );
}
