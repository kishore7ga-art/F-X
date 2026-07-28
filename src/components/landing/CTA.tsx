"use client";

import Link from "next/link";

import { SECTION } from "@/constants/tokens";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * The ask, restated once and then stopped.
 *
 * Same button as the hero, same words, same colour — the page has one action,
 * and offering a second here would suggest the first was negotiable. The
 * headline is deliberately shorter than the hero's: by this point the argument
 * is made, and repeating it at full volume is how a confident page turns into
 * a pushy one.
 */
export function CTA({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  const ref = useReveal<HTMLDivElement>({ children: "[data-reveal]", stagger: 0.1 });
  const magneticRef = useMagnetic<HTMLDivElement>({ strength: 0.28, radius: 80 });

  return (
    <section className={cn(SECTION.padding, "border-t border-night-line")}>
      <div className={cn(SECTION.container, "text-center")}>
        <div ref={ref}>
          <h2
            data-reveal
            className="mx-auto max-w-4xl text-[clamp(2.1rem,5.6vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-chalk"
          >
            Start with a design.
            <br />
            Keep the words forever.
          </h2>

          <div data-reveal className="mt-12 flex justify-center">
            <div ref={magneticRef} className="inline-block will-change-transform">
              <Link
                href={ctaHref}
                className="group inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-[15px] font-semibold text-night transition-opacity duration-300 hover:opacity-90"
              >
                {ctaLabel}
                <span
                  aria-hidden
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          <p
            data-reveal
            className="mt-8 text-sm text-chalk-dim/60"
          >
            Nothing is public until you publish it.
          </p>
        </div>
      </div>
    </section>
  );
}
