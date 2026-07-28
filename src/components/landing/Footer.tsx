import Link from "next/link";

import { SECTION } from "@/constants/tokens";
import { cn } from "@/lib/cn";
import type { TemplateSummary } from "@/lib/site/templates";

/**
 * The footer, and the page's last piece of type.
 *
 * The oversized wordmark is deliberate: it is the one place a monochrome page
 * can be loud without competing with anything, and it gives the scroll a
 * destination rather than a fizzle. It is `aria-hidden` — the accessible name
 * for this site is in the nav, and hearing "XITE" a second time at the end
 * serves nobody.
 *
 * A server component. Nothing here moves, and shipping a client bundle for a
 * list of links would be paying hydration cost for static text.
 */
export function Footer({ templates }: { templates: TemplateSummary[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-ink/10 bg-white">
      <div className={cn(SECTION.container, "py-16 lg:py-20")}>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="text-lg font-extrabold tracking-[-0.03em] text-brand-ink">
              XITE
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-ink/55">
              College websites that are quick to build and easy to keep
              current — because the words are yours, and the design is only how
              they look today.
            </p>
          </div>

          <nav aria-label="Designs">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-ink/35">
              Designs
            </h2>
            <ul className="mt-5 space-y-3">
              {templates.slice(0, 5).map((template) => (
                <li key={template.id}>
                  <Link
                    href={template.demoUrl ?? "/templates"}
                    className="text-sm text-brand-ink/60 transition-colors hover:text-brand-ink"
                  >
                    {template.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Product">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-ink/35">
              Product
            </h2>
            <ul className="mt-5 space-y-3">
              {[
                { href: "#how", label: "How it works" },
                { href: "#editing", label: "Editing" },
                { href: "#templates", label: "All designs" },
                { href: "/login", label: "Sign in" },
                { href: "/api/health", label: "Service status" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-ink/60 transition-colors hover:text-brand-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-16 text-xs text-brand-ink/40">
          © {year} XITE. All rights reserved.
        </p>
      </div>

      <div aria-hidden className="overflow-hidden px-4 pb-6">
        <p className="select-none text-center text-[clamp(4rem,19vw,17rem)] font-extrabold leading-[0.75] tracking-[-0.06em] text-brand-ink/[0.055]">
          XITE
        </p>
      </div>
    </footer>
  );
}
