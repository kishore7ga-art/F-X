"use client";

import Link from "next/link";

import { GradientMesh } from "@/components/ui/GradientMesh";
import { SECTION } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * The closing banner, over the same mesh as the hero.
 *
 * Reusing the field is what makes the page feel like it has a beginning and an
 * end rather than just stopping — the colour returns, and the reader recognises
 * where they came in.
 *
 * The headline is deliberately shorter than the hero's and the ask is a single
 * button. By this point the argument is made; restating it at full volume is
 * how a confident page turns into a pushy one.
 */
export function FinalCTA({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string;
  ctaLabel: string;
}) {
  const ref = useReveal<HTMLDivElement>({ children: "[data-reveal]", stagger: 0.1 });

  return (
    <section className="relative isolate overflow-hidden bg-night py-28 lg:py-32">
      <GradientMesh />

      <div className={cn(SECTION.container, "text-center")}>
        <div ref={ref}>
          <h2
            data-reveal
            className="mx-auto max-w-3xl text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk"
          >
            Start building for free
          </h2>
          <p
            data-reveal
            className="mx-auto mt-5 max-w-lg text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-chalk-dim"
          >
            Pick a design, replace the words, publish when you are ready. Change
            your mind about the design afterwards — that is rather the point.
          </p>

          <div data-reveal className="mt-10">
            <Link
              href={ctaHref}
              className="inline-block rounded-full bg-accent px-8 py-3.5 text-[15px] font-semibold text-white transition-transform duration-150 ease-out hover:scale-[1.03] hover:bg-accent-hover active:scale-[0.98]"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
