"use client";

import { useEffect, useRef, useState } from "react";

import { addSection } from "@/app/actions/sections";
import { useEditor } from "@/components/editor/EditorContext";

/**
 * The + button. Spec §8 left this open — this opens a picker of the section
 * types the template offers, rather than auto-adding a fixed next section.
 */
export function AddSectionMenu({ afterOrder }: { afterOrder: number }) {
  const { pageId, addableSections, run } = useEditor();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        title="Add a section below"
        aria-label="Add a section below"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-base font-bold text-black/70 shadow ring-1 ring-black/10 transition hover:bg-white hover:text-black"
      >
        +
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/10">
          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/40">
            Add section
          </p>
          {addableSections.map((section) => (
            <button
              key={section.sectionId}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                run(() =>
                  addSection({
                    pageId,
                    sectionId: section.sectionId,
                    afterOrder,
                  }),
                );
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5"
            >
              {section.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
