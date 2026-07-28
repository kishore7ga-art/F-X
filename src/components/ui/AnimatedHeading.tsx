"use client";

import { useEffect, useRef, type ElementType } from "react";

import { DURATION, EASE, STAGGER } from "@/constants/tokens";
import { cn } from "@/lib/cn";

/**
 * A heading that rises into view a word at a time from behind a mask.
 *
 * Split by word, never by character. Splitting a heading into letters gives a
 * screen reader a heading spelled out one letter at a time, and breaks
 * selection, translation and search-in-page — all to gain a stagger nobody can
 * see at reading distance. Each word keeps its spaces, so the line still wraps
 * as text rather than as a row of boxes.
 *
 * The mask is a parent with `overflow: hidden` per line-word; the child starts
 * translated fully below it and slides up, so the letters appear to emerge from
 * an edge rather than fade in place.
 */
export function AnimatedHeading({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  once = true,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const words = Array.from(
      element.querySelectorAll<HTMLElement>("[data-word]"),
    );
    if (!words.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const show = (word: HTMLElement) => {
      word.style.transform = "translate3d(0, 0, 0)";
      word.style.opacity = "1";
    };

    if (reduced.matches) {
      words.forEach(show);
      return;
    }

    for (const word of words) {
      word.style.transform = "translate3d(0, 110%, 0)";
      word.style.opacity = "0";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (once) observer.disconnect();

          words.forEach((word, index) => {
            word.style.transition =
              `transform ${DURATION.slow}s ${EASE.expo} ${delay + index * STAGGER.tight}s, ` +
              `opacity ${DURATION.base}s ${EASE.expo} ${delay + index * STAGGER.tight}s`;
            show(word);
          });
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [text, delay, once]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {/* One accessible copy of the heading. Everything visible is aria-hidden,
          so assistive tech reads a sentence rather than a list of words. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline">
        {text.split(" ").map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="inline-block overflow-hidden align-bottom"
          >
            <span data-word className="inline-block will-change-transform">
              {word}
            </span>
            {/* A real space, outside the mask, so words do not run together. */}
            {index < text.split(" ").length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}
