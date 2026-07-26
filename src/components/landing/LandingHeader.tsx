import Link from "next/link";

const NAV = [
  { label: "Templates", href: "#templates" },
  { label: "Features", href: "#features" },
  { label: "Who it's for", href: "#segments" },
  { label: "How it works", href: "#showcase" },
];

/**
 * Light, editorial header.
 *
 * The mobile menu is a <details>, not React state: a disclosure is exactly what
 * the element is for, it works before hydration, and it keeps the entire
 * landing page a server component with no client JavaScript.
 */
export function LandingHeader({ editHref }: { editHref: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-ink/8 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-ink transition group-hover:bg-brand">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M5 6h14M5 12h9M5 18h5"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-brand-ink">
            XITE
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium text-brand-ink/65 transition hover:text-brand-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href="#templates"
            className="hidden rounded-lg px-4 py-2.5 text-[15px] font-semibold text-brand-ink/70 transition hover:text-brand-ink sm:block"
          >
            See demos
          </a>
          <Link
            href={editHref}
            className="rounded-lg bg-brand-ink px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-brand sm:px-5"
          >
            Edit Template
          </Link>

          <details className="relative lg:hidden [&[open]_svg.open]:hidden [&:not([open])_svg.shut]:hidden">
            <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg text-brand-ink/60 transition hover:bg-brand-ink/5 [&::-webkit-details-marker]:hidden">
              <svg viewBox="0 0 24 24" className="open h-5 w-5" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <svg viewBox="0 0 24 24" className="shut h-5 w-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="sr-only">Menu</span>
            </summary>
            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-xl border border-brand-ink/10 bg-white p-2 shadow-2xl">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-brand-ink/70 transition hover:bg-brand-ink/5 hover:text-brand-ink"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
