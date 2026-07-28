"use client";

import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { Marquee } from "@/components/ui/Marquee";
import { SECTION, TYPE } from "@/constants/tokens";
import { cn } from "@/lib/cn";

/**
 * The closing ask, with the marquee acting as a rule above it.
 *
 * The marquee carries the product's own vocabulary rather than logos of
 * companies that have not agreed to appear — a partner wall nobody can verify
 * is the same problem as an invented statistic, one section further down.
 */
const WORDS = [
  "Hero",
  "About",
  "Courses",
  "Faculty",
  "Contact",
  "Admissions",
  "Autosave",
  "Version history",
  "Live preview",
];

export function CTA({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="border-y border-brand-ink/8 py-8">
        <Marquee items={WORDS} speed={38} />
      </div>

      <div className={cn(SECTION.padding, SECTION.container, "text-center")}>
        <AnimatedHeading
          text="Your college deserves better than a PDF."
          className={cn(TYPE.h2, "mx-auto max-w-4xl text-brand-ink")}
        />
        <p
          className={cn(
            TYPE.body,
            "mx-auto mt-8 max-w-xl text-balance text-brand-ink/55",
          )}
        >
          Start with a design, replace the words, publish when you are ready.
          You can change your mind about the design afterwards — that is rather
          the point.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <AnimatedButton href={ctaHref}>{ctaLabel}</AnimatedButton>
          <AnimatedButton href="#templates" variant="outline">
            Look at the designs first
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
}
