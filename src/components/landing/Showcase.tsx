"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { SECTION, TYPE } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import type { TemplateSummary } from "@/lib/site/templates";
import { cn } from "@/lib/cn";

/**
 * The design gallery — the page's signature section.
 *
 * These are the five real templates, read live from the API, not a mock. That
 * is the point: the marketing page and the product cannot drift, because there
 * is nowhere for them to drift to.
 *
 * Each card lifts and its thumbnail scales on hover, at different rates. The
 * difference is what creates depth: matching them would read as one flat
 * object moving, which is exactly the templated look this page is avoiding.
 */
export function Showcase({ templates }: { templates: TemplateSummary[] }) {
  const gridRef = useReveal<HTMLDivElement>({
    children: "[data-card]",
    stagger: 0.09,
    distance: 40,
  });

  return (
    <section id="templates" className={cn(SECTION.padding, "relative")}>
      <div className={SECTION.container}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className={cn(TYPE.eyebrow, "text-brand-ink/40")}>
              {templates.length > 0
                ? `${String(templates.length).padStart(2, "0")} — Designs`
                : "Designs"}
            </p>
            <AnimatedHeading
              text="Five designs. Thirty section layouts."
              className={cn(TYPE.h2, "mt-4 text-brand-ink")}
            />
          </div>
          <p className={cn(TYPE.body, "max-w-md text-brand-ink/55")}>
            Every one responsive, every one with a live demo. Switch between
            them whenever you like — your words come with you.
          </p>
        </div>

        {templates.length === 0 ? (
          // Says what happened rather than showing an empty grid that reads as
          // a design with nothing in it.
          <p className="mt-16 rounded-2xl border border-brand-ink/10 bg-brand-mist px-6 py-10 text-center text-sm text-brand-ink/50">
            The design gallery is loading. Refresh in a moment.
          </p>
        ) : (
          <div
            ref={gridRef}
            className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3"
          >
            {templates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TemplateCard({
  template,
  index,
}: {
  template: TemplateSummary;
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    let frame = 0;
    const move = (event: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = element.getBoundingClientRect();
        // Tilt is tiny on purpose. Anything more and text on the card starts
        // to look bent rather than the card looking tilted.
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        element.style.transform = `perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translate3d(0,-6px,0)`;
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      element.style.transform = "";
    };

    element.addEventListener("mousemove", move);
    element.addEventListener("mouseleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("mousemove", move);
      element.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <Link
      ref={ref}
      href={template.demoUrl ?? "#templates"}
      data-card
      data-cursor
      className="group block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-mist">
        {template.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnailUrl}
            alt={`The ${template.name} template`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center"
          >
            <span className="text-[clamp(3rem,6vw,5rem)] font-extrabold tracking-[-0.05em] text-brand-ink/8">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
        {/* Wipes up from the bottom edge on hover. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-0 bg-brand-ink transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className={cn(TYPE.h3, "text-brand-ink")}>{template.name}</h3>
        <span className="shrink-0 text-xs font-semibold text-brand-ink/40">
          {template.sectionCount} sections
        </span>
      </div>
      {template.description ? (
        <p className="mt-2 text-sm leading-relaxed text-brand-ink/55">
          {template.description}
        </p>
      ) : null}
    </Link>
  );
}
