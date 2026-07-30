"use client";

import Link from "next/link";

import { DISPLAY, Label, Reveal, Rule } from "@/components/landing/studio/primitives";

/**
 * The five designs, as full-width rows rather than a card grid.
 *
 * A grid of five thumbnails gives each one a sixth of the screen and reduces the
 * difference between them to colour. A row per design gives the name room to be
 * read at display size and the description room to say what the design is *for*,
 * which is the only thing that helps somebody choose.
 *
 * Every name, description and thumbnail below is the platform's own, copied from
 * the seed that creates them — so this section cannot drift into advertising
 * designs that do not exist.
 */

const TEMPLATES: {
  name: string;
  description: string;
  thumbnail: string;
  demo: string;
}[] = [
  {
    name: "Radian",
    description:
      "A clean, content-first template for technical colleges and institutes.",
    thumbnail: "/seed/template-radian.svg",
    demo: "/site/demo-radian",
  },
  {
    name: "Meridian",
    description:
      "Spare and typographic. Wide margins, restrained colour, everything earning its place — for institutions that would rather read serious than loud.",
    thumbnail: "/seed/template-meridian.svg",
    demo: "/site/demo-meridian",
  },
  {
    name: "Beacon",
    description:
      "Full-bleed banners, big type and a dark closing panel. Built to be seen first and read second — suits admissions-led campaigns.",
    thumbnail: "/seed/template-beacon.svg",
    demo: "/site/demo-beacon",
  },
  {
    name: "Almanac",
    description:
      "Traditional and record-like: a dated timeline, a comparison table of programmes, faculty grouped by department. For institutions whose age is the point.",
    thumbnail: "/seed/template-almanac.svg",
    demo: "/site/demo-almanac",
  },
  {
    name: "Harbour",
    description:
      "Warm and photographic — a split hero, stacked story cards, faces before titles. Reads like a place rather than a prospectus.",
    thumbnail: "/seed/template-harbour.svg",
    demo: "/site/demo-harbour",
  },
];

export function StudioTemplates() {
  return (
    <section
      id="templates"
      className="border-t border-night-line py-24 sm:py-32 lg:py-40"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Reveal className="space-y-7">
          <Label index="03">The designs</Label>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <h2 className={`${DISPLAY.section} max-w-[18ch] font-semibold text-chalk`}>
              Five templates. Each one already finished.
            </h2>
            <Link
              href="/templates"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-chalk-dim/70 underline-offset-8 transition-colors hover:text-chalk hover:underline"
            >
              Open the gallery →
            </Link>
          </div>
        </Reveal>

        <Reveal stagger={0.08} className="mt-16">
          {TEMPLATES.map((template, index) => (
            <div key={template.name}>
              <Rule />
              <Link
                href={template.demo}
                className="group grid items-center gap-6 py-8 sm:grid-cols-12 sm:gap-8"
              >
                <span className="font-mono text-[11px] tracking-[0.22em] text-chalk-dim/35 sm:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3
                  className={`${DISPLAY.tile} font-semibold text-chalk transition-colors group-hover:text-accent sm:col-span-3`}
                >
                  {template.name}
                </h3>

                <p className="text-sm leading-relaxed text-chalk-dim/70 sm:col-span-5">
                  {template.description}
                </p>

                {/*
                  Thumbnails are the seeded SVGs, which is why this is a plain
                  <img>: next/image buys nothing for a vector and would add a
                  loader in front of a file that is already a few kilobytes.
                */}
                <span className="relative block overflow-hidden rounded-lg border border-night-line sm:col-span-3">
                  <img
                    src={template.thumbnail}
                    alt={`${template.name} template preview`}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                </span>
              </Link>
            </div>
          ))}
          <Rule />
        </Reveal>
      </div>
    </section>
  );
}
