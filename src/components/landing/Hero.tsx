"use client";

import Link from "next/link";

import { GradientButton } from "@/components/ui/GradientButton";
import { SECTION } from "@/constants/tokens";
import { useMagnetic } from "@/hooks/useMagnetic";


/**
 * A thesis, not a feature list.
 *
 * Two lines, because the product's whole argument fits in two: you can change
 * the design as often as you like, and the words you wrote do not move. That is
 * the guarantee the section editor actually makes — content is stored keyed by
 * section type rather than by template — so the headline is a promise the code
 * keeps rather than a claim the copy makes.
 *
 * One button. A second would imply the first was not the point.
 */
export function Hero({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  // The page's single magnetic element, on the page's single primary action.
  const magneticRef = useMagnetic<HTMLDivElement>({ strength: 0.28, radius: 80 });

  return (
    <section className="relative flex min-h-[86svh] items-center overflow-hidden pt-32 sm:min-h-svh sm:pt-36">
      <div className={SECTION.container}>
        <h1 className="text-[clamp(2.6rem,8.4vw,7.75rem)] font-extrabold leading-[0.92] tracking-[-0.045em] text-chalk">
          <span className="sr-only">Change the design. Keep every word.</span>
          {["Change the design.", "Keep every word."].map((line, index) => (
            <span key={line} aria-hidden className="block overflow-hidden">
              <span
                className="block will-change-transform"
                style={{
                  animation: `heroLine 1.15s cubic-bezier(0.16,1,0.3,1) ${
                    0.15 + index * 0.1
                  }s both`,
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[1fr_auto] lg:items-end">
          <div
            className="max-w-xl"
            style={{ animation: "rise 1s cubic-bezier(0.16,1,0.3,1) 0.55s both" }}
          >
            {/* The credibility line. Every figure in it is countable in the
                database: five templates seeded, thirty section layouts in the
                variant library, three screens from signing up to a live site. */}
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-chalk-dim/70">
              <span>5 templates</span>
              <span className="text-accent">·</span>
              <span>30 section layouts</span>
              <span className="text-accent">·</span>
              <span>3 screens to live</span>
            </p>

            {/* The page's point of view, and the strongest sentence on it.
                It had a section of its own, which was the headline restated at
                length — it does more work here, where it is the reason the
                headline is true rather than a paraphrase of it. */}
            <p className="mt-6 text-[clamp(1.05rem,1.4vw,1.3rem)] leading-relaxed text-chalk-dim">
              A college website is not a design project. It is a few hundred
              sentences that need to be correct and current — and the design is
              the disposable part.
            </p>
          </div>

          <div
            ref={magneticRef}
            className="inline-block will-change-transform"
            style={{ animation: "rise 1s cubic-bezier(0.16,1,0.3,1) 0.68s both" }}
          >
            <GradientButton asChild variant="gradient">
              <Link href={ctaHref}>
                {ctaLabel}
                <span
                  aria-hidden
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </GradientButton>
          </div>
        </div>
      </div>
    </section>
  );
}
