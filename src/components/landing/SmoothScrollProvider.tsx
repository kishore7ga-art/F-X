"use client";

import React, { useEffect } from "react";

import { useLenis } from "@/hooks/useLenis";

/**
 * Smooth scroll for the landing page, and the scroll backbone the 3D hero hangs
 * off.
 *
 * This used to own a second Lenis instance of its own, with its own
 * `requestAnimationFrame` loop and no connection to GSAP. That was the bug the
 * scroll-driven work needed fixed before it could start, and it was live: the
 * footer (`CinematicFooter`) registers ScrollTrigger and animates against scroll
 * position, ScrollTrigger updates on `gsap.ticker`, and Lenis was driving the
 * actual scroll on a different clock — so nothing ever called
 * `ScrollTrigger.update` when Lenis moved the page. Anything scroll-linked
 * therefore trailed the scroll by a frame or more, which reads as jitter rather
 * than as a wiring mistake.
 *
 * `useLenis` already solved this correctly and was only being used by
 * `LandingPage.tsx`, which nothing imports. So this is now a thin wrapper over
 * that hook rather than a rival implementation: one instance, one ticker, and
 * `ScrollTrigger.update` on every Lenis scroll event.
 *
 * The hook also declines to hijack scrolling at all under
 * `prefers-reduced-motion`, which the old copy here did not.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLenis();

  /**
   * Land at the top on a refresh.
   *
   * Deliberate — see the commit that added it. Browsers restore the previous
   * offset on reload, which on a page whose first screen is an animated hero means
   * arriving halfway through it with the entrance already over.
   *
   * Its own effect, and not the hook's business: this has to happen whether or not
   * smooth scrolling is running, and under reduced motion the hook returns without
   * creating a Lenis at all. Plain `window.scrollTo` rather than `lenis.scrollTo`
   * for the same reason, and it runs before the hook's dynamic import resolves, so
   * Lenis reads a page already at zero when it initialises.
   */
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return <>{children}</>;
}
