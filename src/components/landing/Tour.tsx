"use client";

import { SECTION } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * The product tour: alternating text and visual, three rows.
 *
 * Alternating sides rather than three identical rows, because the eye reads a
 * repeated left-right layout as one continuous thing and a mirrored one as
 * separate steps — which is what these are.
 *
 * The visual in each row is a browser frame drawn in markup. Not a screenshot,
 * for the same reason as everywhere else on this page: a picture of the product
 * is out of date the first time the product changes, and this cannot be.
 */
const ROWS = [
  {
    eyebrow: "Step one",
    title: "Two questions, and the site has a name",
    body: "Your college's name and what kind of institution it is. That is enough to choose a starting design, derive a web address and put your name across the page.",
    frame: "onboarding" as const,
  },
  {
    eyebrow: "Step two",
    title: "Four pages, already built",
    body: "Home, about, admissions, contact — provisioned with starter copy in the template's own voice, so the site opens looking finished rather than as five headings over empty space.",
    frame: "pages" as const,
  },
  {
    eyebrow: "Step three",
    title: "Type over it, then publish",
    body: "Replace the words. Nothing to save. Your site is live at its own address the moment you publish it, and not one second before.",
    frame: "publish" as const,
  },
];

export function Tour() {
  const ref = useReveal<HTMLDivElement>({ children: "[data-row]", stagger: 0.1 });

  return (
    <section id="how" className={cn(SECTION.padding, "bg-paper")}>
      <div className={SECTION.container}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-dim">
            How it works
          </p>
          <h2 className="mt-5 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
            From nothing to a published site, in an afternoon.
          </h2>
        </div>

        <div ref={ref} className="mt-16 space-y-20 lg:mt-24 lg:space-y-28">
          {ROWS.map((row, index) => (
            <div
              key={row.title}
              data-row
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
            >
              <div className={cn(index % 2 === 1 && "lg:order-2")}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                  {row.eyebrow}
                </p>
                <h3 className="mt-4 text-[clamp(1.375rem,2.2vw,1.875rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
                  {row.title}
                </h3>
                <p className="mt-4 max-w-lg text-[1.0625rem] leading-[1.6] text-ink-dim">
                  {row.body}
                </p>
              </div>

              <BrowserFrame kind={row.frame} flipped={index % 2 === 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A rounded window with chrome, holding an abstract depiction of one step. */
function BrowserFrame({
  kind,
  flipped,
}: {
  kind: "onboarding" | "pages" | "publish";
  flipped?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "overflow-hidden rounded-2xl border border-rule bg-paper shadow-[0_12px_40px_rgba(16,24,40,0.12)]",
        flipped && "lg:order-1",
      )}
    >
      <div className="flex items-center gap-2 border-b border-rule bg-paper-sunk px-4 py-3">
        <span className="flex gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-2.5 w-2.5 rounded-full bg-ink/10" />
          ))}
        </span>
        <span className="ml-2 font-mono text-[11px] text-ink-dim">
          {kind === "publish" ? "xite.co.in/site/your-college" : "xite.co.in"}
        </span>
      </div>

      <div className="p-6 sm:p-8">
        {kind === "onboarding" ? (
          <div className="space-y-4">
            <span className="block h-2 w-24 rounded-full bg-ink/10" />
            <span className="block h-10 rounded-lg border border-rule bg-paper-sunk" />
            <div className="grid grid-cols-2 gap-2 pt-1">
              {["Engineering", "Arts & Science", "Medical", "Management"].map(
                (label, i) => (
                  <span
                    key={label}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-[11px]",
                      i === 0
                        ? "border-accent/40 bg-accent/[0.06] text-accent"
                        : "border-rule text-ink-dim",
                    )}
                  >
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>
        ) : kind === "pages" ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              {["Home", "About", "Admissions", "Contact"].map((page, i) => (
                <span
                  key={page}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px]",
                    i === 0 ? "bg-ink text-white" : "bg-ink/[0.05] text-ink-dim",
                  )}
                >
                  {page}
                </span>
              ))}
            </div>
            <span className="block h-3 w-2/3 rounded-full bg-ink/20" />
            <span className="block h-1.5 w-full rounded-full bg-ink/10" />
            <span className="block h-1.5 w-5/6 rounded-full bg-ink/10" />
            <span className="block h-20 rounded-lg bg-ink/[0.04]" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-semibold text-white">
                Publish site
              </span>
              <span className="text-[11px] text-ink-dim">Draft</span>
            </div>
            <span className="block h-3 w-1/2 rounded-full bg-ink/20" />
            <span className="block h-1.5 w-full rounded-full bg-ink/10" />
            <span className="block h-1.5 w-4/5 rounded-full bg-ink/10" />
          </div>
        )}
      </div>
    </div>
  );
}
