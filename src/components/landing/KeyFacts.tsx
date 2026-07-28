"use client";

import { SECTION } from "@/constants/tokens";
import { useCounter } from "@/hooks/useCounter";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * Proof by specific number.
 *
 * Every figure here is countable in the database or in the code, and that is
 * the whole test a fact had to pass to be on this page. Five templates seeded.
 * Thirty section layouts across the variant library. Three screens between
 * signing up and a live site. Fifty versions retained per section before the
 * oldest is dropped.
 *
 * There is no "10,000+ colleges" line, because there is no number behind one.
 * A statistic nobody can check is the fastest way to make a page read as
 * boilerplate, and it is the one thing a launch cannot afford.
 */
const FACTS = [
  { value: 5, suffix: "", label: "Templates, each with a live demo" },
  { value: 30, suffix: "", label: "Section layouts in the library" },
  { value: 3, suffix: "", label: "Screens from sign-up to live" },
  { value: 50, suffix: "", label: "Versions kept, per section" },
] as const;

export function KeyFacts() {
  const ref = useReveal<HTMLDListElement>({
    children: "[data-fact]",
    stagger: 0.09,
  });

  return (
    <section className={cn(SECTION.paddingTight, "border-t border-night-line")}>
      <div className={SECTION.container}>
        <dl ref={ref} className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact, index) => (
            <Fact key={fact.label} {...fact} index={index} />
          ))}
        </dl>
      </div>
    </section>
  );
}

function Fact({
  value,
  suffix,
  label,
  index,
}: {
  value: number;
  suffix: string;
  label: string;
  index: number;
}) {
  const ref = useCounter(value, suffix);

  return (
    <div data-fact className="border-t border-night-line pt-6">
      <span className="text-[11px] font-semibold tabular-nums text-accent">
        {String(index + 1).padStart(2, "0")}
      </span>
      {/* The real figure for assistive tech: a screen reader should hear
          "5 templates", not every integer on the way to five. */}
      <dt className="sr-only">{`${value}${suffix} — ${label}`}</dt>
      <dd>
        <span
          ref={ref}
          aria-hidden
          className="mt-3 block text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-[0.85] tracking-[-0.04em] tabular-nums text-chalk"
        >
          {/* Server-rendered at the final value, so the number is right before
              hydration and for anyone without JavaScript. */}
          {value}
          {suffix}
        </span>
        <span className="mt-5 block max-w-[13rem] text-sm leading-relaxed text-chalk-dim">
          {label}
        </span>
      </dd>
    </div>
  );
}
