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
export function useLenis(enabled = true) {
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
        // Long enough to feel weighted, short enough that a flick still lands.
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // Touch devices already have momentum scrolling that people know; a
        // second one layered on top fights their thumb.
        smoothWheel: true,
        touchMultiplier: 1.6,
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
  }, [enabled]);
}
