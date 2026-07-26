import Link from "next/link";

/**
 * Editorial hero: type first, product second.
 *
 * The headline carries the page — everything below it is evidence — so the
 * visual sits under the fold line rather than competing beside it.
 */
export function LandingHero({ editHref }: { editHref: string }) {
  return (
    <section className="relative overflow-hidden border-b border-brand-ink/8 bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="drift absolute -right-52 -top-56 h-[42rem] w-[42rem] rounded-full bg-brand-bright/12 blur-[120px]" />
        <div
          className="drift absolute -left-56 top-24 h-[36rem] w-[36rem] rounded-full bg-brand-citrus/10 blur-[130px]"
          style={{ animationDelay: "-8s" }}
        />
      </div>

      <div className="relative mx-auto max-w-[88rem] px-5 pb-0 pt-20 sm:px-8 sm:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <p
            className="rise inline-flex items-center gap-2 rounded-full border border-brand-ink/10 bg-brand-mist px-4 py-1.5 text-[13px] font-semibold text-brand-deep"
            style={{ animationDelay: "40ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Five designs · thirty section layouts
          </p>

          <h1
            className="rise mt-8 text-balance text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.03em] text-brand-ink sm:text-7xl lg:text-[5.25rem]"
            style={{ animationDelay: "120ms" }}
          >
            Build your college site
            <br className="hidden sm:block" />{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">without building it</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1.5 z-0 h-3 rounded-sm bg-brand-citrus/35 sm:bottom-3 sm:h-5"
              />
            </span>
          </h1>

          <p
            className="rise mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-brand-ink/55 sm:text-xl"
            style={{ animationDelay: "200ms" }}
          >
            Choose a design, replace the words, press publish. The prospectus
            you have already written is most of the work — the rest is an
            afternoon, not a six-week quote.
          </p>

          <div
            className="rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "280ms" }}
          >
            <Link
              href={editHref}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-ink px-8 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand hover:shadow-xl sm:w-auto"
            >
              Start editing — free
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#templates"
              className="inline-flex w-full items-center justify-center rounded-xl border border-brand-ink/15 bg-white px-8 py-4 text-base font-semibold text-brand-ink transition hover:-translate-y-0.5 hover:border-brand-ink/35 sm:w-auto"
            >
              Browse live demos
            </a>
          </div>

          <p className="rise mt-5 text-sm text-brand-ink/35" style={{ animationDelay: "340ms" }}>
            No card. No install. Your content exports as JSON whenever you want it.
          </p>
        </div>

        {/* Product visual, cropped by the section edge so it reads as a window
            into the tool rather than a floating screenshot. */}
        <div className="rise mx-auto mt-16 max-w-6xl sm:mt-20" style={{ animationDelay: "420ms" }}>
          <div className="overflow-hidden rounded-t-3xl border border-b-0 border-brand-ink/10 bg-white shadow-[0_-1px_60px_-12px_rgba(4,33,31,0.22)]">
            <div className="flex items-center gap-2 border-b border-brand-ink/8 bg-brand-mist/60 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-coral/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-citrus/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-bright/50" />
              <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-[11px] text-brand-ink/40 ring-1 ring-brand-ink/8">
                yourcollege.xite.co.in
              </span>
              <span className="ml-auto hidden items-center gap-1.5 rounded-md bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand-deep sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Saved 10:32
              </span>
            </div>

            <div className="grid gap-px bg-brand-ink/8 md:grid-cols-[1fr_300px]">
              <div className="space-y-4 bg-white p-6">
                <div className="h-36 rounded-xl bg-gradient-to-br from-brand-deep via-brand to-brand-bright" />
                <div className="h-3.5 w-2/3 rounded-full bg-brand-ink/10" />
                <div className="h-3.5 w-1/2 rounded-full bg-brand-ink/[0.07]" />
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-20 rounded-lg bg-brand-mist" />
                      <div className="h-2.5 w-3/4 rounded-full bg-brand-ink/[0.07]" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 bg-white p-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-ink/35">
                  Edit section
                </p>
                {["Heading", "Intro", "Image"].map((label) => (
                  <div key={label} className="space-y-1.5">
                    <p className="text-[11px] font-medium text-brand-ink/45">{label}</p>
                    <div className="h-9 rounded-lg border border-brand-ink/10 bg-brand-mist/50" />
                  </div>
                ))}
                <div className="h-9 rounded-lg bg-brand-ink/90" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
