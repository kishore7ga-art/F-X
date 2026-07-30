"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, LayoutGrid } from "lucide-react";

import { addSection } from "@/app/actions/sections";
import { useEditor } from "@/components/editor/EditorContext";
import { motion, AnimatePresence } from "motion/react";

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
    <div ref={containerRef} className="relative flex justify-center py-2">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        title="Add Section"
        aria-label="Add Section"
        aria-expanded={open}
        className="group flex items-center gap-2 rounded-full border border-[#26272B] bg-[#111113] px-4 py-2 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-black active:scale-95"
      >
        <Plus className="h-4 w-4 text-neutral-400 group-hover:text-black transition-colors" />
        <span>+ Add Section</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 z-50 w-72 overflow-hidden rounded-2xl border border-[#26272B] bg-[#111113]/98 p-3 text-white shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2 border-b border-[#26272B] pb-2.5 mb-2 px-1">
              <LayoutGrid className="h-4 w-4 text-white" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Select Section
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto pr-1">
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
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-[#17171A] hover:text-white hover:border hover:border-neutral-700 text-left"
                >
                  <span>{section.label}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">+ Insert</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
