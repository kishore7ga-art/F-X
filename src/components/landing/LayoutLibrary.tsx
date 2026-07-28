"use client";

import { LayoutSphere, type SphereTile } from "@/components/ui/LayoutSphere";
import { SECTION } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * The thirty section layouts, as an object you can turn over.
 *
 * A sphere is the right shape here for a reason that is not decoration: the
 * claim is *thirty*, and thirty of anything in a list is a scroll rather than
 * a quantity you feel. On a sphere they arrive as one mass with more behind it,
 * which is what the number is actually saying.
 *
 * Every tile is a real variant from the section library — five section types,
 * six designs each — so the count on the page and the count in the database are
 * the same count.
 */
const SECTION_TYPES: { type: string; variants: string[] }[] = [
  {
    type: "Hero",
    variants: [
      "Centered",
      "Image split",
      "Side panel",
      "Stacked banner",
      "Minimal text",
      "Academic masthead",
    ],
  },
  {
    type: "About",
    variants: [
      "Two column",
      "Stacked",
      "Image beside",
      "Split panel",
      "Quote lead",
      "Timeline",
    ],
  },
  {
    type: "Courses",
    variants: [
      "Grid",
      "Table",
      "Accordion",
      "Split rows",
      "Compact tiles",
      "Numbered list",
    ],
  },
  {
    type: "Faculty",
    variants: [
      "Cards",
      "Roster",
      "Circle grid",
      "Minimal table",
      "Overlay tiles",
      "Departments",
    ],
  },
  {
    type: "Contact",
    variants: [
      "Split",
      "Centered",
      "Cards row",
      "Dark panel",
      "Form only",
      "Full-width map",
    ],
  },
];

const TILES: SphereTile[] = SECTION_TYPES.flatMap((group) =>
  group.variants.map((variant) => ({
    id: `${group.type}-${variant}`,
    label: variant,
    caption: group.type,
  })),
);

export function LayoutLibrary() {
  const ref = useReveal<HTMLDivElement>({ children: "[data-reveal]", stagger: 0.1 });

  return (
    <section className={cn(SECTION.padding, "border-t border-night-line")}>
      <div className={SECTION.container}>
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div ref={ref}>
            <p
              data-reveal
              className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50"
            >
              The library
            </p>
            <h2
              data-reveal
              className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.035em] text-chalk"
            >
              Thirty layouts. Five kinds of section.
            </h2>
            <p
              data-reveal
              className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-chalk-dim"
            >
              Every section on your site has six designs to sit in. Swap one and
              the words inside it do not move — the layout changes, the sentence
              stays.
            </p>

            {/* The list a screen reader gets, and the one a search engine
                indexes. The sphere is a picture of this, not a substitute. */}
            <dl data-reveal className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {SECTION_TYPES.map((group) => (
                <div key={group.type}>
                  <dt className="text-sm font-semibold text-chalk">
                    {group.type}
                  </dt>
                  <dd className="mt-1 text-xs text-chalk-dim/60">
                    {group.variants.length} designs
                  </dd>
                </div>
              ))}
            </dl>

            <p data-reveal className="mt-8 text-xs text-chalk-dim/40">
              Drag the sphere to turn it.
            </p>
          </div>

          <LayoutSphere tiles={TILES} />
        </div>
      </div>
    </section>
  );
}
