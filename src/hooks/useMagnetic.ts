"use client";

import { useEffect, useRef } from "react";

/**
 * Pulls an element gently towards the cursor while it is nearby.
 *
 * The effect that makes a button feel like an object rather than a rectangle.
 * Two details do most of the work:
 *
 * Movement is capped at a fraction of the distance travelled, so the element
 * leans rather than chases — a button that follows the pointer one-to-one feels
 * broken, because the thing you are aiming at keeps moving away from you.
 *
 * The listener sits on the element, not the window. A page with a dozen
 * magnetic elements would otherwise run a dozen handlers on every mouse move,
 * which is how a 60fps page becomes a 30fps one without any single thing
 * looking wrong.
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 0.35,
  radius = 90,
  disabled = false,
}: { strength?: number; radius?: number; disabled?: boolean } = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;

    // Pointer-follow means nothing without a pointer, and on a touch screen it
    // just costs battery.
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    let frame = 0;

    const move = (event: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = element.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);

        // Falls off with distance, so the pull eases in at the edge of the
        // radius rather than snapping on the moment the cursor crosses it.
        const distance = Math.hypot(dx, dy);
        const falloff = Math.max(0, 1 - distance / (radius + box.width / 2));

        element.style.transform = `translate3d(${dx * strength * falloff}px, ${
          dy * strength * falloff
        }px, 0)`;
      });
    };

    const reset = () => {
      cancelAnimationFrame(frame);
      element.style.transform = "translate3d(0, 0, 0)";
    };

    element.addEventListener("mousemove", move);
    element.addEventListener("mouseleave", reset);

    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("mousemove", move);
      element.removeEventListener("mouseleave", reset);
    };
  }, [strength, radius, disabled]);

  return ref;
}
