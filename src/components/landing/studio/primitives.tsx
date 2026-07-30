"use client";

import type { ReactNode } from "react";

import { useReveal } from "@/hooks/useReveal";

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

/** Fades and lifts its children as they arrive. Staggers direct children. */
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
  // Reveals its own children rather than itself, so a heading and the paragraph
  // under it arrive in sequence instead of together.
  const ref = useReveal({ children: ":scope > *", stagger, delay, distance });
  return (
    <div ref={ref as unknown as React.Ref<HTMLDivElement>} className={className}>
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
