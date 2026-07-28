"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The trailing ring that follows the pointer.
 *
 * Position is written straight to the element's transform rather than held in
 * React state. A cursor updates on every mouse move — routing that through a
 * re-render would reconcile the component sixty times a second to move one
 * `div`, which is the single easiest way to lose the frame budget on a page
 * like this.
 *
 * It lerps towards the pointer instead of tracking it exactly. The lag *is* the
 * effect: a ring pinned to the cursor is invisible, a ring easing after it
 * reads as weight. React state holds only the two things that genuinely change
 * how it renders — whether it is over something interactive, and whether the
 * pointer has ever moved.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // No pointer, no cursor. Rendering it on a phone would leave a ring parked
    // in the corner of the screen forever.
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let frame = 0;

    const move = (event: MouseEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!visible) setVisible(true);

      // The dot is exact — it is the actual pointer position, and any easing on
      // it would read as input lag.
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;

      const target = event.target as HTMLElement | null;
      setActive(Boolean(target?.closest("a, button, [data-cursor]")));
    };

    const loop = () => {
      // 0.16 is the whole feel: lower drags, higher snaps.
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", move, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(frame);
    };
  }, [visible]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] hidden lg:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms" }}
    >
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-brand-ink"
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full border border-brand-ink/30 transition-[width,height,background-color,border-color] duration-300 ease-out"
        style={{
          width: active ? 56 : 30,
          height: active ? 56 : 30,
          backgroundColor: active ? "rgb(10 10 10 / 0.06)" : "transparent",
        }}
      />
    </div>
  );
}
