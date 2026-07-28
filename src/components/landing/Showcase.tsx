"use client";

import Link from "next/link";

import { SECTION } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import type { TemplateSummary } from "@/lib/site/templates";
import { cn } from "@/lib/cn";

/**
 * The templates, read live from the API.
 *
 * These are the five real rows, not a mock-up of five. The marketing page and
 * the product cannot drift apart because there is nowhere for them to drift to
 * — add a sixth template to the database and it appears here.
 *
 * Listed rather than tiled. A grid of thumbnails invites comparison of the
 * pictures; a list of names with their section counts invites reading, which is
 * the honest way to present five things that differ in layout rather than in
 * colour.
 */
export function Showcase({ templates }: { templates: TemplateSummary[] }) {
  const ref = useReveal<HTMLDivElement>({ children: "[data-row]", stagger: 0.07 });

  return (
    <section
      id="templates"
      className={cn(SECTION.padding, "border-t border-night-line")}
    >
      <div className={SECTION.container}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
              Templates
            </p>
            <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.035em] text-chalk">
              Five designs. Every one already responsive.
            </h2>
          </div>
          <p className="max-w-sm text-[1.05rem] leading-relaxed text-chalk-dim">
            Each has a live demo you can walk through before you commit to
            anything.
          </p>
        </div>

        {templates.length === 0 ? (
          <p className="mt-16 rounded-xl border border-night-line px-6 py-10 text-center text-sm text-chalk-dim/60">
            The template list is loading. Refresh in a moment.
          </p>
        ) : (
          <div ref={ref} className="mt-14 lg:mt-20">
            {templates.map((template, index) => (
              <Link
                key={template.id}
                href={template.demoUrl ?? "#templates"}
                data-row
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 border-t border-night-line py-7 transition-colors duration-500 last:border-b hover:border-chalk-dim/30 sm:gap-8 sm:py-9"
              >
                <span className="text-[11px] font-semibold tabular-nums text-chalk-dim/40 transition-colors duration-500 group-hover:text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0">
                  <span className="block text-[clamp(1.3rem,2.6vw,2.1rem)] font-bold leading-tight tracking-[-0.025em] text-chalk">
                    {template.name}
                  </span>
                  {template.description ? (
                    <span className="mt-2 block max-w-xl truncate text-sm text-chalk-dim/70 sm:whitespace-normal">
                      {template.description}
                    </span>
                  ) : null}
                </span>

                <span className="flex shrink-0 items-center gap-4 text-xs text-chalk-dim/50">
                  <span className="hidden sm:inline">
                    {template.sectionCount} sections
                  </span>
                  <span
                    aria-hidden
                    className="text-base transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-accent"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
