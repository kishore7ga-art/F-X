"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The shared vocabulary of the landing page.
 *
 * Four things, defined once: how text enters, the small label above a section,
 * the hairline that separates them, and the two display sizes. Every section
 * below is built from these, which is the only reason a page this long reads as
 * one design rather than nine.
 *
 * The look is the studio-site genre — near-black surface, oversized tight-tracked
 * type, one accent, hairline rules, a lot of air. Nothing here is lifted from any
 * particular studio's site: the tokens are this project's own
 * (`--color-night`/`chalk`/`accent`, `#146ef5`), and the copy is XITE's.
 */

/**
 * Fades and lifts its direct children as they arrive.
 *
 * Deliberately not `useReveal`, and the reason is the bug that shipped a blank
 * page. That hook hides the children, then watches the *wrapper* with
 * `threshold: 0.15` — fine for the small blocks it was written for, and fatal
 * here. An element much taller than the viewport can never reach an intersection
 * ratio of 0.15: the five template rows are around 2000px, so on a 900px screen
 * the ratio tops out near 0.11, the observer never fires, and everything it hid
 * stays hidden. Most of this page sits inside one of these.
 *
 * Two changes make that class of failure impossible rather than merely unlikely:
 *
 *  - each child is observed on its own, with `threshold: 0`. Any sliver counts,
 *    so height cannot defeat the arithmetic, and a long list animates as it is
 *    read rather than all at once while most of it is off-screen.
 *  - a timer settles anything still hidden after two seconds. If an observer is
 *    never called — no IntersectionObserver, a transformed ancestor, something
 *    nobody has thought of — the content appears anyway. Invisible content is
 *    worse than content that arrives without its animation, so this fails
 *    towards visible.
 */
export function Reveal({
  children,
  stagger = 0.08,
  delay = 0,
  distance = 28,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const targets = Array.from(element.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
    if (!targets.length) return;

    const settle = (target: HTMLElement, order: number) => {
      const at = delay + order * stagger;
      target.style.transition =
        `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${at}s, ` +
        `transform 0.8s cubic-bezier(0.16,1,0.3,1) ${at}s`;
      target.style.opacity = "1";
      target.style.transform = "none";
    };

    // Somebody who asked for less motion gets the end state immediately, rather
    // than the same content behind an animation they asked not to see.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const target of targets) {
        target.style.opacity = "1";
        target.style.transform = "none";
      }
      return;
    }

    for (const target of targets) {
      target.style.opacity = "0";
      target.style.transform = `translate3d(0, ${distance}px, 0)`;
    }

    const observers = targets.map((target, order) => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer.disconnect();
            settle(target, order);
          }
        },
        // Zero, not a fraction. `rootMargin` pulls it in slightly so the movement
        // has finished by the time the line is actually being read.
        { threshold: 0, rootMargin: "0px 0px -6% 0px" },
      );
      observer.observe(target);
      return observer;
    });

    const failsafe = window.setTimeout(() => {
      for (const observer of observers) observer.disconnect();
      targets.forEach((target, order) => {
        if (target.style.opacity !== "1") settle(target, order);
      });
    }, 2000);

    return () => {
      window.clearTimeout(failsafe);
      for (const observer of observers) observer.disconnect();
    };
  }, [stagger, delay, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * The number-and-name pair above every section.
 *
 * Monospace and letter-spaced because it is signage, not prose — it tells you
 * where you are in the page, and at this size that reads faster than a word.
 */
export function Label({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.28em] text-chalk-dim/50">
      <span className="text-accent">{index}</span>
      <span className="h-px w-8 bg-night-line" aria-hidden="true" />
      {children}
    </p>
  );
}

/** A hairline. Used instead of boxes — the grid is implied, never drawn. */
export function Rule({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`h-px w-full bg-night-line ${className}`} />;
}

/**
 * The display sizes, as `clamp()` rather than breakpoints.
 *
 * Type this large has to scale with the viewport continuously or it breaks at
 * every width between the breakpoints somebody thought to check. `-0.04em`
 * tracking is what stops a 10rem headline reading as loose.
 */
export const DISPLAY = {
  hero: "text-[clamp(2.6rem,10.5vw,10.5rem)] leading-[0.92] tracking-[-0.045em]",
  section: "text-[clamp(1.9rem,5.6vw,4.6rem)] leading-[0.98] tracking-[-0.035em]",
  tile: "text-[clamp(1.4rem,2.6vw,2.2rem)] leading-[1.05] tracking-[-0.025em]",
} as const;

export const MEASURE = "max-w-[46ch] text-[15px] leading-relaxed text-chalk-dim";
