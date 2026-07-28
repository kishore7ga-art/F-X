"use client";

import Link from "next/link";

import { SECTION } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * What XITE believes, in three sentences and no more.
 *
 * A short confident paragraph rather than a wall of copy — and it earns the
 * space by saying something arguable. "Easy to use" is not a belief; "the
 * design is the disposable part" is, and it happens to be the one the schema
 * is built around.
 */
export function Philosophy() {
  const ref = useReveal<HTMLDivElement>({ children: "[data-line]", stagger: 0.1 });

  return (
    <section className={cn(SECTION.padding, "border-t border-night-line")}>
      <div className={SECTION.container}>
        <div ref={ref} className="grid gap-12 lg:grid-cols-[auto_1fr] lg:gap-24">
          <p
            data-line
            className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50"
          >
            What we think
          </p>

          <div className="max-w-3xl">
            <p
              data-line
              className="text-[clamp(1.4rem,2.6vw,2.15rem)] font-medium leading-[1.35] tracking-[-0.02em] text-chalk"
            >
              A college website is not a design project. It is a few hundred
              sentences that need to be correct, kept current, and readable on a
              phone — and the design is the disposable part.
            </p>

            <p
              data-line
              className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-chalk-dim"
            >
              So we built the two apart. Your words live in their own place,
              keyed to what they are rather than to how they currently look.
              Change the template in an afternoon and not one of them moves.
            </p>

            <Link
              data-line
              href="#how"
              className="group mt-10 inline-flex items-center gap-3 text-sm font-semibold text-chalk"
            >
              How it works
              <span className="relative h-px w-10 bg-chalk-dim/40">
                <span className="absolute inset-0 w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
