"use client";

import { SECTION, TYPE } from "@/constants/tokens";
import { useCounter } from "@/hooks/useCounter";
import { cn } from "@/lib/cn";

/**
 * The numbers band.
 *
 * Every figure here is something the product can actually be held to — five
 * templates seeded, thirty section layouts in the library, a two-second
 * autosave debounce, fifty versions retained per section. No invented
 * "10,000+ happy customers": a statistic nobody can check is the fastest way to
 * make a landing page read as boilerplate.
 */
const STATS = [
  { value: 5, suffix: "", label: "Designs, each with a live demo" },
  { value: 30, suffix: "", label: "Section layouts in the library" },
  { value: 2, suffix: "s", label: "From last keystroke to saved" },
  { value: 50, suffix: "", label: "Versions kept, per section" },
] as const;

export function Stats() {
  return (
    <section className={cn(SECTION.paddingTight, "border-y border-brand-ink/8 bg-brand-mist/40")}>
      <div className={SECTION.container}>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </dl>
      </div>
    </section>
  );
}

function Stat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useCounter(value, suffix);

  return (
    <div>
      {/* The real figure, for assistive tech: a screen reader should hear
          "5 designs", not every integer on the way to five. */}
      <dt className="sr-only">{`${value}${suffix} — ${label}`}</dt>
      <dd>
        <span
          ref={ref}
          aria-hidden
          className={cn(TYPE.stat, "block text-brand-ink")}
        >
          {/* Server-rendered as the final value, so the number is correct
              before hydration and for anyone without JavaScript. */}
          {value}
          {suffix}
        </span>
        <span className="mt-4 block max-w-[14rem] text-sm leading-relaxed text-brand-ink/55">
          {label}
        </span>
      </dd>
    </div>
  );
}
