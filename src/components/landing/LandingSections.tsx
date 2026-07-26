import Link from "next/link";

/* Inline SVGs rather than an icon dependency: four glyphs is not worth a
   package, and it keeps them on the same stroke weight as the logo. */
const ICONS = {
  swap: (
    <path d="M4 8h13l-3-3M20 16H7l3 3" strokeLinecap="round" strokeLinejoin="round" />
  ),
  type: <path d="M5 6h14M12 6v13M9 19h6" strokeLinecap="round" />,
  save: (
    <path
      d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  publish: (
    <path
      d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM4 12h16M12 4a13 13 0 0 1 0 16 13 13 0 0 1 0-16Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

const FEATURES = [
  {
    icon: ICONS.swap,
    title: "Swap a design, keep the words",
    body: "Every section has six layouts behind it. Cycle until one fits — your text moves across untouched, because content is stored apart from the design that renders it.",
  },
  {
    icon: ICONS.type,
    title: "Curated, not configurable",
    body: "Chosen palettes and type pairings instead of a colour wheel. It is the constraint that keeps a site built in an afternoon from looking like one.",
  },
  {
    icon: ICONS.save,
    title: "Nothing to lose",
    body: "Every edit saves itself two seconds after you stop. Version history keeps what came before, and going offline queues your work rather than dropping it.",
  },
  {
    icon: ICONS.publish,
    title: "Draft until you say so",
    body: "Work in the open editor as long as you like. The public site only changes the moment you publish it — no half-finished page ever faces an applicant.",
  },
];

const STATS = [
  { value: "5", label: "Templates, each with its own demo site" },
  { value: "30", label: "Section layouts across the library" },
  { value: "2s", label: "From your last keystroke to saved" },
  { value: "0", label: "Lines of code to publish" },
];

export function LandingFeatures() {
  return (
    <section id="features" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Built for the person who has other work
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-brand-ink sm:text-5xl">
            Four decisions, then it is finished
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <article
              key={feature.title}
              className="rise group relative overflow-hidden rounded-2xl border border-brand-ink/8 bg-brand-mist/60 p-7 transition duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-xl hover:shadow-brand/10"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-deep text-white shadow-lg shadow-brand/25">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  {feature.icon}
                </svg>
              </span>
              <h3 className="mt-5 text-base font-bold text-brand-ink">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-brand-ink/60">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingStats() {
  return (
    <section className="border-y border-brand-ink/8 bg-brand-mist py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 sm:px-8 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="rise text-center lg:text-left"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="bg-gradient-to-br from-brand-deep to-brand bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm leading-snug text-brand-ink/55">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The product showcase. For a site builder the "code" worth showing is the
 * content shape, because that is what makes swapping a design safe.
 */
export function LandingShowcase({ editHref }: { editHref: string }) {
  return (
    <section id="showcase" className="bg-brand-ink py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-bright">
            Why a redesign costs you nothing
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Your words are not stored inside the design
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/55">
            A section keeps what you wrote. The layout that draws it is a
            separate choice, recorded next to it. Change the design and the
            same content is handed to a different component — which is why
            switching templates on a finished site takes a click instead of a
            rewrite.
          </p>
          <ul className="mt-8 space-y-3.5">
            {[
              "Swap one section's layout, or the whole template at once",
              "Add a section anywhere; it arrives already filled in",
              "Restore any earlier version of any section",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-sm text-white/70">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-brand-bright" fill="currentColor" aria-hidden="true">
                  <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" />
                </svg>
                {line}
              </li>
            ))}
          </ul>
          <Link
            href={editHref}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-ink transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Open the editor
          </Link>
        </div>

        <div className="rise overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="ml-2 font-mono text-[11px] text-white/35">
              hero — content
            </span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-white/70">
{`{
  `}<span className="text-brand-bright">&quot;collegeName&quot;</span>{`: `}<span className="text-brand-citrus">&quot;Greenfield Institute&quot;</span>{`,
  `}<span className="text-brand-bright">&quot;tagline&quot;</span>{`: `}<span className="text-brand-citrus">&quot;Engineering tomorrow&quot;</span>{`,
  `}<span className="text-brand-bright">&quot;ctaLabel&quot;</span>{`: `}<span className="text-brand-citrus">&quot;Apply for admission&quot;</span>{`
}

`}<span className="text-white/30">{`// the layout is a separate choice`}</span>{`
`}<span className="text-brand-bright">variant</span>{`: `}<span className="text-brand-coral">&quot;hero_academic_masthead&quot;</span>{`
`}<span className="text-white/30">{`//        ↻ swap this, keep everything above`}</span>
          </pre>
        </div>
      </div>
    </section>
  );
}

export function LandingTemplates({ editHref }: { editHref: string }) {
  return (
    <section id="templates" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-brand-ink sm:text-5xl">
          Start from a design that already works
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-brand-ink/55">
          Each one ships with a live demo site, so you are choosing from a
          finished page rather than a thumbnail.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Radian", note: "Clean and content-first", demo: "/site/demo-radian" },
            { name: "Meridian", note: "Spare and typographic", demo: "/site/demo-meridian" },
            { name: "Beacon", note: "Bold, admissions-led", demo: "/site/demo-beacon" },
            { name: "Almanac", note: "Traditional and record-like", demo: "/site/demo-almanac" },
            { name: "Harbour", note: "Warm and photographic", demo: "/site/demo-harbour" },
          ].map((template, i) => (
            <a
              key={template.name}
              href={template.demo}
              target="_blank"
              rel="noreferrer"
              className="rise group overflow-hidden rounded-2xl border border-brand-ink/8 text-left transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/10"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[4/3] bg-brand-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/seed/template-${template.name.toLowerCase()}.svg`}
                  alt={`${template.name} template`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-5">
                <div>
                  <h3 className="font-bold text-brand-ink">{template.name}</h3>
                  <p className="mt-0.5 text-xs text-brand-ink/50">
                    {template.note}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-brand opacity-0 transition group-hover:opacity-100">
                  View demo →
                </span>
              </div>
            </a>
          ))}

          <Link
            href={editHref}
            className="rise grid place-items-center rounded-2xl border border-dashed border-brand/30 bg-brand-mist/50 p-8 text-center transition hover:-translate-y-1 hover:border-brand hover:bg-brand-mist"
            style={{ animationDelay: "300ms" }}
          >
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand text-2xl font-light text-white">
                +
              </span>
              <p className="mt-4 font-bold text-brand-ink">Edit yours now</p>
              <p className="mt-1 text-xs text-brand-ink/50">
                Pick one and start replacing the words
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const columns = [
    {
      heading: "Product",
      links: [
        { label: "Templates", href: "#templates" },
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#showcase" },
      ],
    },
    {
      heading: "Demo sites",
      links: [
        { label: "Radian", href: "/site/demo-radian" },
        { label: "Meridian", href: "/site/demo-meridian" },
        { label: "Beacon", href: "/site/demo-beacon" },
      ],
    },
    {
      heading: "Status",
      links: [{ label: "Service health", href: "/api/health" }],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-brand-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-bright to-brand">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M5 6h14M5 12h9M5 18h5" stroke="#04211f" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-lg font-bold text-white">XITE</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
            College websites that go live the same week they are started.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.heading}>
            <p className="text-xs font-bold uppercase tracking-widest text-white/35">
              {column.heading}
            </p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/55 transition hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-5 py-6 sm:px-8">
        <p className="mx-auto max-w-7xl text-xs text-white/30">
          © {new Date().getFullYear()} XITE. Built for colleges, not for
          agencies.
        </p>
      </div>
    </footer>
  );
}
