import Link from "next/link";

const STATS = [
  { value: "5", label: "Templates, each with a live demo" },
  { value: "30", label: "Section layouts in the library" },
  { value: "2s", label: "From last keystroke to saved" },
  { value: "0", label: "Lines of code to publish" },
];

/** Numbers, not fabricated customer logos: we do not have those yet. */
export function LandingStats() {
  return (
    <section className="border-b border-brand-ink/8 bg-white py-14">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <p className="text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-brand-ink/35">
          What you get on day one
        </p>
        <div className="mt-9 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="rise text-center"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <p className="text-5xl font-extrabold tracking-tight text-brand-ink sm:text-6xl">
                {stat.value}
              </p>
              <p className="mx-auto mt-2 max-w-[13rem] text-sm leading-snug text-brand-ink/50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Row = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: "swap" | "save" | "publish";
};

const ROWS: Row[] = [
  {
    eyebrow: "Design",
    title: "Change how it looks without touching what it says",
    body: "Every section has six layouts behind it. Cycle until one fits — your words move across untouched, because content is stored apart from the design that renders it.",
    points: [
      "Swap one section, or the whole template at once",
      "Thirty layouts, every one already responsive",
      "Curated palettes and type pairings, not a colour wheel",
    ],
    visual: "swap",
  },
  {
    eyebrow: "Editing",
    title: "Nothing to remember, nothing to lose",
    body: "There is no Save button. Every edit writes itself two seconds after you stop, version history keeps what came before, and losing your connection queues the work instead of dropping it.",
    points: [
      "Autosave on typing, images, toggles and reordering",
      "Restore any earlier version of any section",
      "Offline edits flush in order when you reconnect",
    ],
    visual: "save",
  },
  {
    eyebrow: "Publishing",
    title: "Draft until the moment you decide",
    body: "Work in the open for as long as you like. The public site changes only when you publish it, so no half-finished page is ever what an applicant finds.",
    points: [
      "Preview at desktop and mobile before anyone sees it",
      "One switch from draft to live",
      "Your own domain, or a subdomain to start",
    ],
    visual: "publish",
  },
];

function RowVisual({ kind }: { kind: Row["visual"] }) {
  if (kind === "swap") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[
          "from-brand-deep to-brand",
          "from-brand-citrus to-brand-coral",
          "from-brand to-brand-bright",
          "from-brand-ink to-brand-deep",
        ].map((gradient, i) => (
          <div
            key={gradient}
            className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${gradient} ${
              i === 0 ? "ring-2 ring-brand-ink ring-offset-2" : "opacity-70"
            }`}
          />
        ))}
      </div>
    );
  }

  if (kind === "save") {
    return (
      <div className="space-y-3">
        {[
          { label: "Saved successfully", tone: "text-brand-deep bg-brand/10" },
          { label: "Saving…", tone: "text-brand-ink/50 bg-brand-ink/5" },
          { label: "Offline — 2 changes waiting", tone: "text-amber-700 bg-amber-50" },
        ].map((state) => (
          <div
            key={state.label}
            className={`rounded-xl px-4 py-3.5 text-sm font-semibold ${state.tone}`}
          >
            {state.label}
          </div>
        ))}
        <div className="rounded-xl border border-brand-ink/10 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-ink/35">
            Version history
          </p>
          {["Edited text · 14:32", "Changed an image · 14:19"].map((line) => (
            <p key={line} className="mt-2 text-sm text-brand-ink/55">
              {line}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-brand-ink/10 px-4 py-3.5">
        <span className="text-sm font-semibold text-brand-ink">Status</span>
        <span className="rounded-full bg-brand-ink/5 px-3 py-1 text-xs font-semibold text-brand-ink/50">
          Draft
        </span>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-brand-ink px-4 py-3.5">
        <span className="text-sm font-semibold text-white">Publish site</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-ink">
          Live
        </span>
      </div>
      <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-brand-mist to-white ring-1 ring-brand-ink/8" />
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="bg-white">
      {ROWS.map((row, i) => (
        <div
          key={row.title}
          className={`border-b border-brand-ink/8 py-20 sm:py-28 ${
            i % 2 === 1 ? "bg-brand-mist/40" : ""
          }`}
        >
          <div className="mx-auto grid max-w-[88rem] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand">
                {row.eyebrow}
              </p>
              <h2 className="mt-4 text-balance text-3xl font-extrabold leading-[1.08] tracking-tight text-brand-ink sm:text-5xl">
                {row.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-brand-ink/55">
                {row.body}
              </p>
              <ul className="mt-8 space-y-3.5">
                {row.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[15px] text-brand-ink/70">
                    <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-brand" fill="currentColor" aria-hidden="true">
                      <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`rise rounded-2xl border border-brand-ink/10 bg-white p-5 shadow-xl shadow-brand-ink/5 ${
                i % 2 === 1 ? "lg:order-1" : ""
              }`}
            >
              <RowVisual kind={row.visual} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

const SEGMENTS = [
  {
    title: "Admissions offices",
    body: "Get the intake page live before the deadline, and edit it yourself when the dates move.",
  },
  {
    title: "Departments",
    body: "A faculty list and a course table that someone in the department can keep current.",
  },
  {
    title: "Small institutions",
    body: "A site that looks considered without a design retainer or a developer on staff.",
  },
];

export function LandingSegments() {
  return (
    <section id="segments" className="border-b border-brand-ink/8 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <h2 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-brand-ink sm:text-5xl">
          Made for whoever actually has to update it
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SEGMENTS.map((segment, i) => (
            <article
              key={segment.title}
              className="rise group rounded-2xl border border-brand-ink/10 p-8 transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <h3 className="text-xl font-bold text-brand-ink">{segment.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/55">
                {segment.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingShowcase({ editHref }: { editHref: string }) {
  return (
    <section id="showcase" className="bg-brand-ink py-20 sm:py-28">
      <div className="mx-auto grid max-w-[88rem] items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-bright">
            Why a redesign costs you nothing
          </p>
          <h2 className="mt-4 text-balance text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Your words are not stored inside the design
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/55">
            A section keeps what you wrote. The layout that draws it is a
            separate choice recorded beside it — which is why switching
            templates on a finished site is a click rather than a rewrite.
          </p>
          <Link
            href={editHref}
            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-brand-ink transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Open the editor
          </Link>
        </div>

        <div className="rise overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="ml-2 font-mono text-[11px] text-white/35">hero — content</span>
          </div>
          <pre className="overflow-x-auto p-6 font-mono text-[12.5px] leading-relaxed text-white/70">
{`{
  `}<span className="text-brand-bright">&quot;collegeName&quot;</span>{`: `}<span className="text-brand-citrus">&quot;Greenfield Institute&quot;</span>{`,
  `}<span className="text-brand-bright">&quot;tagline&quot;</span>{`: `}<span className="text-brand-citrus">&quot;Engineering tomorrow&quot;</span>{`
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

const TEMPLATES = [
  { name: "Radian", note: "Clean and content-first" },
  { name: "Meridian", note: "Spare and typographic" },
  { name: "Beacon", note: "Bold, admissions-led" },
  { name: "Almanac", note: "Traditional and record-like" },
  { name: "Harbour", note: "Warm and photographic" },
];

export function LandingTemplates({ editHref }: { editHref: string }) {
  return (
    <section id="templates" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-brand-ink sm:text-5xl">
            Start from a design that already works
          </h2>
          <p className="mt-5 text-lg text-brand-ink/55">
            Each ships with a published demo, so you are choosing from a
            finished page rather than a thumbnail.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template, i) => (
            <a
              key={template.name}
              href={`/site/demo-${template.name.toLowerCase()}`}
              target="_blank"
              rel="noreferrer"
              className="rise group overflow-hidden rounded-2xl border border-brand-ink/10 transition duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/10"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-brand-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/seed/template-${template.name.toLowerCase()}.svg`}
                  alt={`${template.name} template`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-5">
                <div>
                  <h3 className="text-lg font-bold text-brand-ink">{template.name}</h3>
                  <p className="mt-0.5 text-sm text-brand-ink/50">{template.note}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-brand opacity-0 transition group-hover:opacity-100">
                  View →
                </span>
              </div>
            </a>
          ))}

          <Link
            href={editHref}
            className="rise grid place-items-center rounded-2xl border-2 border-dashed border-brand/30 bg-brand-mist/40 p-8 text-center transition hover:-translate-y-1.5 hover:border-brand hover:bg-brand-mist"
            style={{ animationDelay: "300ms" }}
          >
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-ink text-3xl font-light text-white">
                +
              </span>
              <p className="mt-4 text-lg font-bold text-brand-ink">Edit yours now</p>
              <p className="mt-1 text-sm text-brand-ink/50">Pick one and start replacing the words</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Full-width closing band — the last thing before the footer. */
export function LandingCta({ editHref }: { editHref: string }) {
  return (
    <section className="bg-gradient-to-br from-brand-ink via-brand-deep to-brand py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="text-balance text-3xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl">
          Your site could be live this week
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/75">
          Pick a design, replace the words, publish. Nothing to install and
          nothing to sign.
        </p>
        <Link
          href={editHref}
          className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-ink transition hover:-translate-y-0.5 hover:shadow-2xl"
        >
          Start editing — free
        </Link>
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
        { label: "Who it's for", href: "#segments" },
        { label: "How it works", href: "#showcase" },
      ],
    },
    {
      heading: "Demo sites",
      links: TEMPLATES.map((t) => ({
        label: t.name,
        href: `/site/demo-${t.name.toLowerCase()}`,
      })),
    },
    {
      heading: "Platform",
      links: [
        { label: "Open the editor", href: "/templates" },
        { label: "Service health", href: "/api/health" },
      ],
    },
  ];

  return (
    <footer className="border-t border-brand-ink/8 bg-white">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-ink">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M5 6h14M5 12h9M5 18h5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-xl font-extrabold tracking-tight text-brand-ink">XITE</span>
          </div>
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-brand-ink/50">
            College websites that go live the same week they are started.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.heading}>
            <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-brand-ink/35">
              {column.heading}
            </p>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[15px] text-brand-ink/60 transition hover:text-brand-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-brand-ink/8 px-5 py-6 sm:px-8">
        <p className="mx-auto max-w-[88rem] text-sm text-brand-ink/35">
          © {new Date().getFullYear()} XITE. Built for colleges, not for agencies.
        </p>
      </div>
    </footer>
  );
}
