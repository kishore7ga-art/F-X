"use client";

import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { SECTION } from "@/constants/tokens";
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
    body: "Take the one that suits your type of college, or browse them yourself. Either way you land in the editor with four pages already built — home, about, admissions, contact.",
  },
  {
    title: "Replace the words, publish",
    body: "Type over the starter copy. Your address is live at /site/your-college the moment you publish, and not one second before.",
  },
] as const;

export function Process() {
  const listRef = useReveal<HTMLOListElement>({
    children: "[data-step]",
    stagger: 0.12,
    distance: 32,
  });

  return (
    <section id="how" className={cn(SECTION.padding, "border-t border-night-line")}>
      <div className={SECTION.container}>
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
            How it works
          </p>
          <AnimatedHeading
            text="Two questions, one design, and you are editing."
            className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.035em] text-chalk"
          />
        </div>

        <ol ref={listRef} className="mt-16 lg:mt-24">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              data-step
              className="group grid gap-4 border-t border-night-line py-10 transition-colors duration-500 last:border-b hover:border-chalk-dim/30 sm:grid-cols-[auto_1fr] sm:gap-10 lg:grid-cols-[6rem_1fr_1.2fr] lg:py-14"
            >
              <span className="text-sm font-bold tabular-nums text-chalk-dim/40 transition-colors duration-500 group-hover:text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[clamp(1.25rem,2.1vw,1.85rem)] font-bold leading-tight tracking-[-0.02em] text-chalk">{step.title}</h3>
              <p className="max-w-xl text-[15px] leading-relaxed text-chalk-dim lg:text-base">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
