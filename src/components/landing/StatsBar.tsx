"use client";

import { SECTION } from "@/constants/tokens";
import { useCounter } from "@/hooks/useCounter";
import { cn } from "@/lib/cn";

/**
 * The dark band of numbers between two light sections.
 *
 * It is here as much for rhythm as for content — three light sections in a row
 * read as one long section, and a full-bleed dark band is what tells the eye
 * where one argument ended and the next began.
 *
 * Every figure is countable in the database or the code. Five templates seeded,
 * thirty section layouts in the variant library, four pages provisioned with
 * every new site, fifty versions retained per section before the oldest is
 * dropped. There is no "3.5M sites published" line, because there is no number
 * behind one — and an unverifiable statistic is the fastest way to make a
 * launch read as boilerplate.
 */
const STATS = [
  { value: 5, suffix: "", label: "Designs, each with a live demo" },
  { value: 30, suffix: "", label: "Section layouts in the library" },
  { value: 4, suffix: "", label: "Pages built with every new site" },
  { value: 50, suffix: "", label: "Versions kept, per section" },
] as const;

export function StatsBar() {
  return (
    <section className="bg-night py-20 lg:py-24">
      <div className={SECTION.container}>
        <dl className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
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
      {/* The real figure for assistive tech: a screen reader should hear
          "5 designs", not every integer on the way to five. */}
      <dt className="sr-only">{`${value}${suffix} — ${label}`}</dt>
      <dd>
        <span
          ref={ref}
          aria-hidden
          className={cn(
            "block text-[clamp(2.5rem,4.5vw,3.5rem)] font-bold leading-none",
            "tabular-nums tracking-[-0.02em] text-chalk",
          )}
        >
          {/* Server-rendered at the final value, so the number is right before
              hydration and for anyone without JavaScript. */}
          {value}
          {suffix}
        </span>
        <span className="mt-4 block max-w-[13rem] text-sm leading-[1.6] text-chalk-dim">
          {label}
        </span>
      </dd>
    </div>
  );
}
