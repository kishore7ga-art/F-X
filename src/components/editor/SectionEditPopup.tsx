"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { SectionContentForm } from "@/components/editor/SectionContentForm";
import type { EditorSection } from "@/lib/editor/queries";

const WIDTH = 360;
const MARGIN = 12;

export type PopupAnchor = { x: number; y: number };

/**
 * The section edit form, anchored where it was opened.
 *
 * Replaces the full-height right panel, which ate a third of the canvas and
 * stayed open until dismissed — so the thing you were editing was squeezed
 * while you edited it.
 *
 * Only the container changed. The form inside is the same component, reading
 * the same field descriptors, validated by the same Zod schema and saved
 * through the same queue.
 */
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

  // Measured before paint: placing it after would show one frame at the raw
  // cursor position, which reads as the popup jumping.
  useLayoutEffect(() => {
    const height = ref.current?.offsetHeight ?? 0;
    const maxX = window.innerWidth - WIDTH - MARGIN;
    const maxY = window.innerHeight - height - MARGIN;

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
    // Pointer, not click: a mousedown outside should dismiss immediately
    // rather than waiting for the button to come back up somewhere else.
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
      // Fixed, so the popup does not scroll away from the section it belongs to
      // while the form inside scrolls on its own.
      className="fixed z-50 max-h-[min(34rem,80vh)] overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl"
    >
      <SectionContentForm section={section} onClose={onClose} />
    </div>
  );
}
