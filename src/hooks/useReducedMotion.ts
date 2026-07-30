"use client";

import { useEffect, useState } from "react";

/**
 * Whether the visitor has asked for less motion.
 *
 * The four places that already check this — `Hero`, `AnimatedHeading`,
 * `LayoutSphere`, `LiquidCursor` — read `.matches` once inside an effect and
 * never listen again. That is fine for a one-shot reveal: by the time the
 * preference changes, the animation has finished.
 *
 * A 3D scene is different. It runs for as long as the page is open, so a
 * preference switched mid-visit has to be honoured then rather than at the next
 * reload, and the render loop needs to be told rather than asked. Hence a hook
 * with a subscription instead of a fifth copy of the one-shot check.
 *
 * Starts `false` so the server and the first client render agree — reading
 * `matchMedia` during render would be a hydration mismatch, and there is no
 * media query on the server to read. The effect corrects it before anything
 * animates.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
