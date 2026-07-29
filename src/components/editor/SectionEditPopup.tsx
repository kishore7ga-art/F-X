"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { SectionContentForm } from "@/components/editor/SectionContentForm";
import type { EditorSection } from "@/lib/editor/queries";

const WIDTH = 380;
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

  useLayoutEffect(() => {
    const height = ref.current?.offsetHeight || 500;
    const maxX = Math.max(MARGIN, window.innerWidth - WIDTH - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - height - MARGIN);

    setPosition({
      x: Math.max(MARGIN, Math.min(anchor.x, maxX)),
      y: Math.max(MARGIN, Math.min(anchor.y, maxY)),
    });
  }, [anchor]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose();
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-label={`Edit ${section.label}`}
      style={{ left: position.x, top: position.y, width: WIDTH }}
      className="fixed z-50 flex max-h-[calc(100vh-32px)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-950/95"
    >
      <SectionContentForm section={section} onClose={onClose} />
    </div>
  );
}
