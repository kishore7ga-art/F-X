"use client";

import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { SECTION, TYPE } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * What editing is actually like, which is the product's real argument.
 *
 * Anyone can show a template gallery. The thing worth a section of its own is
 * that the design and the words are genuinely separate here — swap the whole
 * template and every sentence stays where it was put. Each claim below is
 * something the editor does today, phrased as what it means for the person
 * doing it rather than as a feature name.
 *
 * Deliberately an asymmetric grid: the first card spans two columns, so the eye
 * has somewhere to start rather than meeting six equal boxes.
 */
type Capability = {
  title: string;
  body: string;
  /** Spans two columns, so the eye has somewhere to start. */
  wide?: boolean;
};

const CAPABILITIES: Capability[] = [
  {
    title: "Change how it looks without touching what it says",
    body: "Content lives apart from design. Swap one section's layout, or the whole template at once — every word you have written comes across untouched.",
    wide: true,
  },
  {
    title: "Nothing to remember, nothing to lose",
    body: "Autosave on typing, images, toggles and reordering. Two seconds after you stop, it is filed.",
  },
  {
    title: "Every version, kept",
    body: "Restore any earlier state of any section. Fifty versions deep, and restoring is itself undoable.",
  },
  {
    title: "Offline is not a lost afternoon",
    body: "Edits queue in order and flush when the connection returns. The editor tells you which, and how many.",
  },
  {
    title: "Colours and type, already paired",
    body: "Curated palettes and font pairings rather than a colour wheel and a font menu — so it looks considered without needing a designer.",
  },
  {
    title: "Draft until you decide",
    body: "Nothing is public until you publish. Preview the real site at its real address first, as only you can see it.",
  },
];

export function Editing() {
  const gridRef = useReveal<HTMLDivElement>({
    children: "[data-cap]",
    stagger: 0.07,
    distance: 30,
  });

  return (
    <section
      id="editing"
      className={cn(SECTION.padding, "bg-brand-ink text-white")}
    >
      <div className={SECTION.container}>
        <div className="max-w-3xl">
          <p className={cn(TYPE.eyebrow, "text-white/40")}>02 — Editing</p>
          <AnimatedHeading
            text="The words are yours. The design is just how they look today."
            className={cn(TYPE.h2, "mt-4 text-white")}
          />
        </div>

        <div
          ref={gridRef}
          className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3"
        >
          {CAPABILITIES.map((item) => (
            <article
              key={item.title}
              data-cap
              className={cn(
                "group relative bg-brand-ink p-8 transition-colors duration-500 hover:bg-white/[0.04] lg:p-10",
                item.wide && "lg:col-span-2",
              )}
            >
              <h3
                className={cn(
                  "font-bold leading-[1.15] tracking-[-0.02em] text-white",
                  item.wide
                    ? "text-[clamp(1.5rem,2.6vw,2.25rem)]"
                    : "text-[clamp(1.15rem,1.6vw,1.4rem)]",
                )}
              >
                {item.title}
              </h3>
              <p
                className={cn(
                  "mt-4 leading-relaxed text-white/55",
                  item.wide ? "max-w-xl text-base" : "text-[15px]",
                )}
              >
                {item.body}
              </p>
              {/* Grows from the left on hover — a direction, not a glow. */}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-white/40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
