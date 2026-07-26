import Link from "next/link";

const NAV = [
  { label: "Templates", href: "#templates" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#showcase" },
];

/**
 * Sticky marketing header.
 *
 * The mobile menu is a <details>, not React state: a disclosure is exactly
 * what the element is for, it works before hydration, and it keeps the whole
 * landing page a server component.
 */
export function LandingHeader({ editHref }: { editHref: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-bright to-brand shadow-lg shadow-brand/30 transition group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M5 6h14M5 12h9M5 18h5"
                stroke="#04211f"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            XITE
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/60 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={editHref}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-ink shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-5"
          >
            Edit Template
          </Link>

          <details className="relative md:hidden [&[open]_svg.open]:hidden [&:not([open])_svg.shut]:hidden">
            <summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white [&::-webkit-details-marker]:hidden">
              <svg viewBox="0 0 24 24" className="open h-5 w-5" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <svg viewBox="0 0 24 24" className="shut h-5 w-5" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="sr-only">Menu</span>
            </summary>
            <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-white/10 bg-brand-deep/95 p-2 shadow-2xl backdrop-blur-xl">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
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
