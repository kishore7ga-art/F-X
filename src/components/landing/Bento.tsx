"use client";

import { SECTION } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * The bento grid: mixed cell sizes, on a light surface.
 *
 * Every card describes something the editor does today. The large cell gets the
 * claim the product is actually built around — content stored against section
 * type rather than template — because a bento grid with six equal-weight
 * statements is a list wearing a grid's clothes, and the whole point of the
 * uneven sizing is that one thing matters more than the others.
 *
 * Each card carries a small live-looking preview rather than an icon. Drawn in
 * markup from the page's own tokens, not screenshotted: a picture of the editor
 * goes stale the first time the editor changes, and these cannot.
 */
type Cell = {
  title: string;
  body: string;
  span?: "large" | "wide";
  preview: "swap" | "save" | "history" | "offline" | "theme" | "draft";
};

const CELLS: Cell[] = [
  {
    title: "Change the design. Keep every word.",
    body: "Content is stored against what a section is, not which template it came from. Swap the whole design and every sentence lands where it was — that is a property of the schema, not a promise in the copy.",
    span: "large",
    preview: "swap",
  },
  {
    title: "No save button",
    body: "Two seconds after you stop typing, it is filed.",
    preview: "save",
  },
  {
    title: "Fifty versions deep",
    body: "Restore any earlier state. Restoring is itself undoable.",
    preview: "history",
  },
  {
    title: "Offline is not a lost afternoon",
    body: "Edits queue in order and flush when the connection returns.",
    preview: "offline",
  },
  {
    title: "Colours already paired",
    body: "Curated palettes and type pairings, not a colour wheel.",
    preview: "theme",
  },
  {
    title: "Draft until you decide",
    body: "Preview the real site at its real address. Nothing is public until you publish.",
    span: "wide",
    preview: "draft",
  },
];

export function Bento() {
  const ref = useReveal<HTMLDivElement>({ children: "[data-cell]", stagger: 0.07 });

  return (
    <section className={cn(SECTION.padding, "bg-paper")}>
      <div className={SECTION.container}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-dim">
            The editor
          </p>
          <h2 className="mt-5 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
            Everything a college site needs, and nothing to learn first.
          </h2>
        </div>

        <div
          ref={ref}
          className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-4 lg:auto-rows-[280px]"
        >
          {CELLS.map((cell) => (
            <article
              key={cell.title}
              data-cell
              className={cn(
                "group flex flex-col rounded-3xl border border-rule bg-paper-sunk p-8 transition-all duration-200 ease-out",
                "hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,24,40,0.12)]",
                cell.span === "large" && "lg:col-span-2 lg:row-span-2",
                cell.span === "wide" && "lg:col-span-2",
              )}
            >
              <Preview kind={cell.preview} />
              <h3
                className={cn(
                  "mt-6 font-semibold leading-[1.2] tracking-[-0.02em] text-ink",
                  cell.span === "large"
                    ? "text-[clamp(1.5rem,2.2vw,2rem)]"
                    : "text-[1.0625rem]",
                )}
              >
                {cell.title}
              </h3>
              <p
                className={cn(
                  "mt-3 leading-[1.6] text-ink-dim",
                  cell.span === "large" ? "max-w-md text-base" : "text-sm",
                )}
              >
                {cell.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * A small depiction of the thing the card describes.
 *
 * Deliberately abstract — bars and chips rather than a rendering of the real
 * editor. It reads as "this is what that looks like" without claiming to be a
 * screenshot, which means it can never be out of date.
 */
function Preview({ kind }: { kind: Cell["preview"] }) {
  const bar = "h-1.5 rounded-full bg-ink/10";

  if (kind === "swap") {
    return (
      <div aria-hidden className="rounded-2xl border border-rule bg-paper p-5">
        <div className="flex gap-2">
          {["Radian", "Meridian", "Beacon"].map((name, index) => (
            <span
              key={name}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors duration-500",
                index === 0
                  ? "bg-accent/10 text-accent"
                  : "bg-ink/[0.04] text-ink-dim",
              )}
            >
              {name}
            </span>
          ))}
        </div>
        <div className="mt-5 space-y-2.5">
          <span className={cn(bar, "block w-3/4 !bg-ink/25")} />
          <span className={cn(bar, "block w-full")} />
          <span className={cn(bar, "block w-5/6")} />
        </div>
        <p className="mt-5 text-[11px] text-ink-dim">
          The design above changes. The lines below do not.
        </p>
      </div>
    );
  }

  if (kind === "save") {
    return (
      <div aria-hidden className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="text-[11px] font-medium text-accent">Saved</span>
      </div>
    );
  }

  if (kind === "history") {
    return (
      <div aria-hidden className="space-y-1.5">
        {[100, 72, 52].map((width, index) => (
          <span
            key={width}
            className={cn(
              "block h-1.5 rounded-full",
              index === 0 ? "bg-accent/60" : "bg-ink/10",
            )}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    );
  }

  if (kind === "offline") {
    return (
      <div aria-hidden className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-6 w-6 rounded-md border border-rule bg-paper"
          />
        ))}
        <span className="ml-1 self-center text-[11px] text-ink-dim">3 queued</span>
      </div>
    );
  }

  if (kind === "theme") {
    return (
      <div aria-hidden className="flex gap-1.5">
        {["#146ef5", "#7c3aed", "#ff6b35", "#101828"].map((hex) => (
          <span
            key={hex}
            className="h-6 w-6 rounded-full ring-1 ring-inset ring-black/5"
            style={{ background: hex }}
          />
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden className="flex items-center gap-2">
      <span className="rounded-full border border-rule px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-dim">
        Draft
      </span>
      <span className="text-[11px] text-ink-dim">only you can see it</span>
    </div>
  );
}
