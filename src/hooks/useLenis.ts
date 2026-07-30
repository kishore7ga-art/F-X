"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Smooth scrolling, driven from GSAP's ticker rather than its own loop.
 *
 * Lenis and ScrollTrigger both want to run every frame, and left alone they run
 * on two different clocks — Lenis on its own requestAnimationFrame, GSAP on
 * `gsap.ticker`. The result is a pinned section that lags a frame behind the
 * scroll position driving it, which reads as jitter rather than as a bug and is
 * miserable to chase later. One ticker, one frame, both in step.
 *
 * Returns nothing: everything downstream reads scroll position through
 * ScrollTrigger, so handing the instance around would only invite a second
 * component to start driving it.
 */
export type LenisFeel = {
  /** Longer reads as heavier. */
  duration?: number;
  /** Below 1 slows the wheel down without making it feel laggy. */
  wheelMultiplier?: number;
  touchMultiplier?: number;
};

/**
 * The landing page's tuning, which was arrived at by feel and is worth keeping.
 *
 * These are the values `SmoothScrollProvider` was running with before it was
 * folded into this hook — "slow, ultra-smooth, luxurious", per its own comment.
 * They are the default rather than the hook's older 1.15/1.6 pair specifically so
 * that unifying the two implementations changed how the page is *wired* without
 * changing how it *feels*; a scroll that suddenly moves differently would look
 * like the regression rather than the fix.
 */
const DEFAULT_FEEL: Required<LenisFeel> = {
  duration: 2.2,
  wheelMultiplier: 0.65,
  touchMultiplier: 1.2,
};

export function useLenis(enabled = true, feel: LenisFeel = {}) {
  const { duration, wheelMultiplier, touchMultiplier } = {
    ...DEFAULT_FEEL,
    ...feel,
  };

  useEffect(() => {
    if (!enabled) return;

    // Someone who has asked their OS for less motion has asked for this too.
    // Hijacking their scroll is the single most intrusive thing on the page.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    let cancelled = false;

    // Imported here rather than at module scope: ScrollTrigger touches
    // `document` on import, and this hook is the only place that knows we are
    // past the server render.
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier,
        // Touch devices already have momentum scrolling that people know; a
        // second one layered on top fights their thumb.
        touchMultiplier,
      });

      lenis.on("scroll", ScrollTrigger.update);

      // GSAP's ticker reports seconds; Lenis wants milliseconds.
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      // Lag smoothing exists to skip animation after a stalled tab. With scroll
      // position as the input, skipping means teleporting.
      gsap.ticker.lagSmoothing(0);
    })();

    return () => {
      cancelled = true;
      void import("gsap").then(({ default: gsap }) => {
        if (tick) gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
      });
      lenis?.destroy();
    };
  }, [enabled, duration, wheelMultiplier, touchMultiplier]);
}
