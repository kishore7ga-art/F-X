"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { GradientButton } from "@/components/ui/GradientButton";
import { RulerCarousel, type RulerItem } from "@/components/ui/RulerCarousel";
import { SECTION } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import type { TemplateSummary } from "@/lib/site/templates";
import { cn } from "@/lib/cn";

/**
 * The templates, stepped through on a rule.
 *
 * Read live from the API, so these are the five real rows rather than a
 * mock-up of five. The marketing page and the product cannot drift apart
 * because there is nowhere for them to drift to.
 *
 * A ruler rather than dots because five is a countable set with an order: the
 * point of a rule is that it shows how far along you are and how much is left,
 * which identical dots cannot. Below it, the same five as plain links — the
 * scrubber is a way to look at them, not the only way to reach them.
 */
export function Showcase({ templates }: { templates: TemplateSummary[] }) {
  const ref = useReveal<HTMLDivElement>({ children: "[data-reveal]", stagger: 0.09 });
  const [active, setActive] = useState(0);

  // Stable, so the carousel's effect does not re-run on every parent render.
  const onChange = useCallback((index: number) => setActive(index), []);

  const items: RulerItem[] = templates.map((template) => ({
    id: template.id,
    title: template.name,
    meta:
      template.description ??
      `${template.sectionCount} sections, every one responsive`,
  }));

  const current = templates[active];

  return (
    <section
      id="templates"
      className={cn(SECTION.padding, "border-t border-night-line")}
    >
      <div className={SECTION.container}>
        <div ref={ref} className="mx-auto max-w-2xl text-center">
          <p
            data-reveal
            className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50"
          >
            Templates
          </p>
          <h2
            data-reveal
            className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.035em] text-chalk"
          >
            Five designs. Pick one, change it later.
          </h2>
        </div>

        {templates.length === 0 ? (
          <p className="mt-16 rounded-xl border border-night-line px-6 py-10 text-center text-sm text-chalk-dim/60">
            The template list is loading. Refresh in a moment.
          </p>
        ) : (
          <>
            <div className="mt-16 lg:mt-20">
              <RulerCarousel items={items} onChange={onChange} />
            </div>

            {current ? (
              <div className="mt-14 flex justify-center">
                <GradientButton asChild variant="gradient">
                  <Link href={current.demoUrl ?? "#templates"}>
                    See {current.name} live
                    <span
                      aria-hidden
                      className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </GradientButton>
              </div>
            ) : null}

            {/* Every template as a plain link. The scrubber shows one at a
                time; a crawler and a keyboard should still get all five. */}
            <ul className="mt-16 grid gap-px overflow-hidden rounded-xl border border-night-line bg-night-line sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template, index) => (
                <li key={template.id}>
                  <Link
                    href={template.demoUrl ?? "#templates"}
                    className={cn(
                      "flex h-full items-baseline gap-4 bg-night px-6 py-5 transition-colors duration-300 hover:bg-night-raised",
                      index === active && "bg-night-raised",
                    )}
                  >
                    <span className="text-[11px] font-semibold tabular-nums text-chalk-dim/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-chalk">
                        {template.name}
                      </span>
                      <span className="mt-1 block text-xs text-chalk-dim/60">
                        {template.sectionCount} sections
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
