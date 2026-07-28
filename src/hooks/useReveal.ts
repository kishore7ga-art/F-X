"use client";

import { useEffect, useRef } from "react";

import { DURATION, EASE, STAGGER } from "@/constants/tokens";

type RevealOptions = {
  /** Selector for children to stagger. Omit to animate the element itself. */
  children?: string;
  /** How far it travels, in px. */
  distance?: number;
  stagger?: number;
  delay?: number;
  /** Fraction of the element that must be visible before it fires. */
  threshold?: number;
};

/**
 * Reveals an element, or its children in sequence, as it enters the viewport.
 *
 * Built on IntersectionObserver rather than ScrollTrigger deliberately. Most of
 * this page is a fade-and-rise on entry, which needs to know *whether* an
 * element is visible and nothing more — ScrollTrigger computes a continuous
 * scroll position for each one, which is a great deal of per-frame work to
 * answer a yes/no question. ScrollTrigger is kept for what genuinely needs a
 * scrubbed position: parallax and pinning.
 *
 * It fires once and disconnects. Content that re-animates every time it
 * re-enters is a page that will not settle, and it makes scrolling back up to
 * re-read something faintly hostile.
 */
export function useReveal<T extends HTMLElement>({
  children,
  distance = 28,
  stagger = STAGGER.base,
  delay = 0,
  threshold = 0.15,
}: RevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const targets: HTMLElement[] = children
      ? Array.from(element.querySelectorAll<HTMLElement>(children))
      : [element];
    if (!targets.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // The end state, applied immediately, so the content is simply *there*
    // rather than hidden behind an animation somebody asked not to see.
    const settle = (target: HTMLElement) => {
      target.style.opacity = "1";
      target.style.transform = "none";
    };

    if (reduced.matches) {
      targets.forEach(settle);
      return;
    }

    for (const target of targets) {
      target.style.opacity = "0";
      target.style.transform = `translate3d(0, ${distance}px, 0)`;
      target.style.willChange = "opacity, transform";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();

          targets.forEach((target, index) => {
            target.style.transition =
              `opacity ${DURATION.slow}s ${EASE.expo} ${delay + index * stagger}s, ` +
              `transform ${DURATION.slow}s ${EASE.expo} ${delay + index * stagger}s`;
            settle(target);
            // Dropped once it has played: a permanent `will-change` keeps a
            // compositor layer alive for every revealed element on the page.
            window.setTimeout(
              () => (target.style.willChange = "auto"),
              (delay + index * stagger + DURATION.slow) * 1000,
            );
          });
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [children, distance, stagger, delay, threshold]);

  return ref;
}
