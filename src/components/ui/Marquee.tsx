"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

/**
 * An endlessly scrolling row.
 *
 * The track holds two identical copies of the content and translates by exactly
 * -50%, so the moment it resets, copy two is sitting precisely where copy one
 * began. That is what makes the loop seamless without measuring anything: the
 * seam is always off-screen, at any width, at any content length.
 *
 * Driven by a CSS animation rather than rAF, so it runs on the compositor and
 * costs the main thread nothing — this sits on a page already spending its
 * frame budget on scroll, cursor and reveals.
 */
export function Marquee({
  items,
  speed = 32,
  reverse = false,
  className,
}: {
  items: string[];
  /** Seconds for one full pass. Larger is slower. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // A permanently moving element is exactly what "reduce motion" is about.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) element.style.animation = "none";
  }, []);

  return (
    <div
      className={cn("relative flex overflow-hidden", className)}
      // Decorative repetition: read once by the DOM order, not twice.
      aria-hidden
    >
      <div
        ref={ref}
        className="flex shrink-0 items-center gap-10 whitespace-nowrap will-change-transform sm:gap-16"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[...items, ...items].map((item, index) => (
          <span key={index} className="flex items-center gap-10 sm:gap-16">
            <span className="text-[clamp(1.5rem,3.5vw,3rem)] font-extrabold tracking-[-0.03em] text-brand-ink/85">
              {item}
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-ink/25" />
          </span>
        ))}
      </div>
    </div>
  );
}
