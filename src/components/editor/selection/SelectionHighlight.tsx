"use client";

/**
 * The outline around the selected element, drawn over the canvas rather than
 * on the element.
 *
 * Nothing is written to the element itself — no attribute, no inline outline —
 * because the section's code is read back out of the DOM on every commit, and
 * the sanitiser that strips editor marks from that read also clears `outline`,
 * `box-shadow` and `border-radius` on anything it finds marked. A card whose
 * shadow was just set would lose it on the same commit. So the highlight is a
 * fixed box that follows the element's rect and touches nothing.
 *
 * The element is resolved here, not passed in: it is re-looked-up on every
 * measure, so a canvas rebuild between two frames is invisible to it.
 */

import { useEffect, useState } from "react";
import type { ElementType } from "@/lib/editor/selection-store";
import { TOOLBAR_CONFIG } from "./toolbar-config";

const RING: Record<Exclude<ElementType, "section">, string> = {
  card: "#7c3aed",
  button: "#4f46e5",
  image: "#059669",
  text: "#d97706",
};

interface SelectionHighlightProps {
  type: ElementType | null;
  /** Looks up the live node for the selection; null when there is none. */
  resolveElement: () => HTMLElement | null;
  /** Changes whenever the selection or the canvas content does, to re-measure. */
  revision: string;
}

export function SelectionHighlight({ type, resolveElement, revision }: SelectionHighlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    let frame = 0;
    let observed: HTMLElement | null = null;
    const observer = new ResizeObserver(() => schedule());

    const measure = () => {
      frame = 0;
      const element = resolveElement();
      if (!element || !element.isConnected) {
        setRect(null);
        return;
      }
      if (observed !== element) {
        if (observed) observer.unobserve(observed);
        observer.observe(element);
        observed = element;
      }
      setRect(element.getBoundingClientRect());
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    schedule();
    observer.observe(document.documentElement);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [resolveElement, revision]);

  if (!rect || !type || type === "section") return null;
  const colour = RING[type];
  const label = TOOLBAR_CONFIG[type].badge;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[9998]"
      style={{
        top: rect.top - 2,
        left: rect.left - 2,
        width: rect.width + 4,
        height: rect.height + 4,
        border: `2px solid ${colour}`,
        borderRadius: 6,
        boxShadow: `0 0 0 3px ${colour}33`,
      }}
    >
      <span
        className="absolute -top-5 left-0 rounded px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white"
        style={{ background: colour }}
      >
        {label}
      </span>
    </div>
  );
}
