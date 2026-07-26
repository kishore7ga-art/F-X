import Link from "next/link";

/** Hero: colour field, headline, the two things you can do next. */
export function LandingHero({ editHref }: { editHref: string }) {
  return (
    <section className="relative overflow-hidden bg-brand-ink">
      {/* Gradient mesh. Three blurred fields rather than one image, so it scales
          to any viewport without a 400KB download. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="drift absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand/40 blur-[110px]" />
        <div
          className="drift absolute -right-32 top-10 h-[30rem] w-[30rem] rounded-full bg-brand-bright/25 blur-[120px]"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="drift absolute bottom-[-14rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-citrus/20 blur-[130px]"
          style={{ animationDelay: "-11s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_35%,#04211f_78%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="rise mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur"
            style={{ animationDelay: "60ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />
            Five designs. Every section swappable.
          </p>

          <h1
            className="rise mt-7 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "140ms" }}
          >
            Your college website,{" "}
            <span className="bg-gradient-to-r from-brand-bright via-brand-citrus to-brand-coral bg-clip-text text-transparent">
              live by Friday
            </span>
          </h1>

          <p
            className="rise mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg"
            style={{ animationDelay: "220ms" }}
          >
            Pick a design, replace the words, press publish. No agency, no
            six-week quote, no one on your staff learning a page builder. The
            prospectus you already wrote is most of the work.
          </p>

          <div
            className="rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href={editHref}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-ink shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto"
            >
              Start editing
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </Link>
            <a
              href="#templates"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10 sm:w-auto"
            >
              See the templates
            </a>
          </div>

          <p
            className="rise mt-5 text-xs text-white/35"
            style={{ animationDelay: "360ms" }}
          >
            Nothing to install. Your content is yours to export at any time.
          </p>
        </div>

        {/* Editor chrome. Suggests the product without shipping a screenshot
            that goes stale the next time the UI moves. */}
        <div
          className="rise mx-auto mt-16 max-w-5xl sm:mt-20"
          style={{ animationDelay: "440ms" }}
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur">
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-coral/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-citrus/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-bright/70" />
              <span className="ml-3 truncate rounded-md bg-black/30 px-3 py-1 text-[11px] text-white/40">
                yourcollege.xite.co.in
              </span>
              <span className="ml-auto hidden rounded-md bg-brand-bright/15 px-2.5 py-1 text-[11px] font-semibold text-brand-bright sm:block">
                Saved 10:32
              </span>
            </div>
            <div className="grid gap-px bg-white/5 sm:grid-cols-[1fr_260px]">
              <div className="space-y-3 bg-brand-ink/60 p-5">
                <div className="h-28 rounded-lg bg-gradient-to-br from-brand/50 to-brand-deep" />
                <div className="h-3 w-2/3 rounded-full bg-white/15" />
                <div className="h-3 w-1/2 rounded-full bg-white/10" />
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-white/5" />
                  ))}
                </div>
              </div>
              <div className="space-y-3 bg-brand-ink/80 p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                  Edit section
                </p>
                {["Heading", "Intro", "Image"].map((label) => (
                  <div key={label} className="space-y-1.5">
                    <p className="text-[11px] text-white/40">{label}</p>
                    <div className="h-8 rounded-md border border-white/10 bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
