"use client";

import { useEffect, useRef } from "react";

/**
 * Counts up to a number when it scrolls into view.
 *
 * Writes to the element rather than through React state. A counter ticking
 * sixty times a second through `setState` re-renders the component sixty times
 * to change one text node — on a page already spending its frame budget on
 * smooth scroll, a cursor and a dozen reveals, that is the difference between
 * 60fps and not. It is the same reason the cursor writes its own transform.
 *
 * Eased rather than linear, and driven by elapsed time rather than a fixed
 * increment per frame: a counter that adds a constant each tick runs at
 * whatever rate the display refreshes, so the same number takes half as long on
 * a 120Hz laptop as on a 60Hz monitor.
 */
export function useCounter(target: number, suffix = "", duration = 1600) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const write = (value: number) => {
      element.textContent = `${value}${suffix}`;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      write(target);
      return;
    }

    write(0);

    let frame = 0;
    let start = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        const step = (now: number) => {
          if (!start) start = now;
          const progress = Math.min(1, (now - start) / duration);
          // Ease-out quart: most of the distance early, a long settle at the
          // end, which is what makes the last few digits readable.
          const eased = 1 - Math.pow(1 - progress, 4);

          // Snapped to the target on the final frame — floating-point easing
          // lands at 4.999998 often enough that "5" would flicker to "4".
          write(progress === 1 ? target : Math.round(target * eased));
          if (progress < 1) frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, suffix, duration]);

  return ref;
}
