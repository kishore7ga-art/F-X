"use client";

import { DISPLAY, Label, MEASURE, Reveal, Rule } from "@/components/landing/studio/primitives";

/**
 * The text-led sections, in one file because they share one layout idea: a label
 * and a heading on the left, the substance on the right, separated by hairlines.
 *
 * Every figure and every name below is real. The four numbers come from what the
 * platform actually ships (the same set `StatsBar` already used), and the section
 * types are the ones in `SectionType` that have components registered — an
 * invented statistic on a page like this is the fastest way to make the rest of
 * it untrustworthy.
 */

/**
 * A running strip, doubled and animated on the reused `--animate-scroll`
 * keyframes already in globals.css.
 *
 * `aria-hidden` on the duplicate: it exists only so the loop has no gap, and a
 * screen reader should hear the phrase once.
 */
export function StudioMarquee() {
  const words = [
    "Prospectus",
    "Faculty",
    "Programmes",
    "Admissions",
    "Placements",
    "Accreditation",
    "Events",
    "Downloads",
  ];

  return (
    <section className="overflow-hidden border-y border-night-line py-6">
      <div className="flex w-max animate-[scroll_38s_linear_infinite] gap-10">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center gap-10"
          >
            {words.map((word) => (
              <span
                key={word}
                className="flex items-center gap-10 font-mono text-[11px] uppercase tracking-[0.3em] text-chalk-dim/40"
              >
                {word}
                <span className="text-accent">◦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/** What a site is made of — the section library, as an index rather than cards. */
export function StudioIndex() {
  const rows: [string, string, string][] = [
    ["Hero", "6 layouts", "Masthead, split image, side panel, stacked banner, centred, minimal."],
    ["About", "6 layouts", "Two-column, timeline, quote lead, stacked cards, image beside, split panel."],
    ["Courses", "6 layouts", "Card grid, comparison table, accordion, numbered list, split rows, tiles."],
    ["Faculty", "6 layouts", "Photo cards, roster, circle grid, department groups, overlay tiles, table."],
    ["Contact", "6 layouts", "Split map, centred, form only, full-width map, cards row, dark panel."],
  ];

  return (
    <section id="index" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Reveal className="space-y-7">
          <Label index="01">The section library</Label>
          <h2 className={`${DISPLAY.section} max-w-[22ch] font-semibold text-chalk`}>
            Thirty layouts. Swap any of them without losing a word.
          </h2>
          <p className={MEASURE}>
            Every layout of a section type takes the same content, so changing the
            design changes the design — not the text you already wrote. One button,
            and the page is different.
          </p>
        </Reveal>

        <Reveal stagger={0.06} className="mt-16">
          {rows.map(([name, count, detail]) => (
            <div key={name}>
              <Rule />
              <div className="grid gap-2 py-7 sm:grid-cols-12 sm:items-baseline sm:gap-6">
                <h3 className={`${DISPLAY.tile} font-semibold text-chalk sm:col-span-4`}>
                  {name}
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent sm:col-span-2">
                  {count}
                </p>
                <p className="text-sm leading-relaxed text-chalk-dim/70 sm:col-span-6">
                  {detail}
                </p>
              </div>
            </div>
          ))}
          <Rule />
        </Reveal>
      </div>
    </section>
  );
}

/** Three steps, numbered large. */
export function StudioProcess() {
  const steps: [string, string, string][] = [
    [
      "Choose a design",
      "Five templates, each with a live demo you can open before you commit. Colour and type come as packs, so nothing has to be picked from a wheel.",
      "01",
    ],
    [
      "Fill in the forms",
      "Every section is a form, not a canvas. Add faculty, list programmes, write the about page. Autosaves, and keeps fifty versions of each section.",
      "02",
    ],
    [
      "Publish",
      "One switch. The site goes live on its own address, and unpublished drafts stay visible only to you until it does.",
      "03",
    ],
  ];

  return (
    <section id="process" className="border-t border-night-line py-24 sm:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Reveal className="space-y-7">
          <Label index="02">How it works</Label>
          <h2 className={`${DISPLAY.section} max-w-[20ch] font-semibold text-chalk`}>
            Three steps, and none of them involve code.
          </h2>
        </Reveal>

        <Reveal stagger={0.1} className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-10">
          {steps.map(([title, body, number]) => (
            <div key={number} className="space-y-5">
              <p className="font-mono text-[clamp(2.5rem,5vw,4rem)] leading-none text-night-line">
                {number}
              </p>
              <h3 className={`${DISPLAY.tile} font-semibold text-chalk`}>{title}</h3>
              <p className="text-sm leading-relaxed text-chalk-dim">{body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The four real figures.
 *
 * Deliberately not a "3.5M sites published" line — `StatsBar`'s own comment says
 * that number was dropped because there is no number, and inventing one here
 * would undo that decision on a bigger canvas.
 */
export function StudioFigures() {
  const figures: [string, string][] = [
    ["5", "Designs, each with a live demo"],
    ["30", "Section layouts in the library"],
    ["4", "Pages built with every new site"],
    ["50", "Versions kept, per section"],
  ];

  return (
    <section className="border-t border-night-line py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Reveal stagger={0.07}>
          <dl className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {figures.map(([value, label]) => (
              <div key={label} className="space-y-3">
                <dt className="sr-only">{`${value} — ${label}`}</dt>
                <dd
                  aria-hidden="true"
                  className="text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-none tracking-[-0.04em] text-chalk"
                >
                  {value}
                </dd>
                <dd
                  aria-hidden="true"
                  className="max-w-[24ch] text-[13px] leading-relaxed text-chalk-dim/70"
                >
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
