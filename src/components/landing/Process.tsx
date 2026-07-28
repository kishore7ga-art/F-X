"use client";

import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { SECTION, TYPE } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * How it works, in three steps.
 *
 * Numbered, and numbered honestly: this genuinely is a sequence — a college
 * answers two questions, picks a design, then edits — so the order carries
 * information the reader needs. Numbering a set of unordered features would be
 * decoration pretending to be structure.
 */
const STEPS = [
  {
    title: "Answer two questions",
    body: "Your college's name and what kind of institution it is. That is enough for us to choose a starting design and put your name across it.",
  },
  {
    title: "Pick a design, or let us",
    body: "Browse five designs with live demos, or take the one that suits your type of college. Either way you land in the editor with pages already built.",
  },
  {
    title: "Replace the words, publish",
    body: "Type over the starter copy. Nothing to save — it files itself two seconds after you stop. Publish when you decide, not before.",
  },
] as const;

export function Process() {
  const listRef = useReveal<HTMLOListElement>({
    children: "[data-step]",
    stagger: 0.12,
    distance: 32,
  });

  return (
    <section id="how" className={SECTION.padding}>
      <div className={SECTION.container}>
        <div className="max-w-3xl">
          <p className={cn(TYPE.eyebrow, "text-brand-ink/40")}>
            01 — How it works
          </p>
          <AnimatedHeading
            text="Three steps, and none of them is a meeting."
            className={cn(TYPE.h2, "mt-4 text-brand-ink")}
          />
        </div>

        <ol ref={listRef} className="mt-16 lg:mt-24">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              data-step
              className="group grid gap-4 border-t border-brand-ink/10 py-10 transition-colors duration-500 last:border-b hover:border-brand-ink/30 sm:grid-cols-[auto_1fr] sm:gap-10 lg:grid-cols-[6rem_1fr_1.2fr] lg:py-14"
            >
              <span className="text-sm font-bold tabular-nums text-brand-ink/30 transition-colors duration-500 group-hover:text-brand-ink">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={cn(TYPE.h3, "text-brand-ink")}>{step.title}</h3>
              <p className="max-w-xl text-[15px] leading-relaxed text-brand-ink/55 lg:text-base">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
