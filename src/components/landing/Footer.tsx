import Link from "next/link";

import { SECTION } from "@/constants/tokens";
import { cn } from "@/lib/cn";
import type { TemplateSummary } from "@/lib/site/templates";

/**
 * A server component. Nothing here moves, and shipping a client bundle for a
 * list of links would be paying hydration cost for static text.
 *
 * The oversized wordmark is the page's last piece of type and its only loud
 * one — it gives the scroll a destination rather than a fizzle. It is
 * `aria-hidden`: the site's accessible name is in the nav, and hearing "XITE"
 * again at the end serves nobody.
 */
export function Footer({ templates }: { templates: TemplateSummary[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-night-line bg-night">
      <div className={cn(SECTION.container, "py-16 lg:py-20")}>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="text-base font-extrabold tracking-[-0.03em] text-chalk">
              XITE
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-chalk-dim/70">
              College websites built from two questions and a design you pick.
              Change the design whenever you like — the words stay where you put
              them.
            </p>
          </div>

          <nav aria-label="Templates">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/40">
              Templates
            </h2>
            <ul className="mt-5 space-y-3">
              {templates.slice(0, 5).map((template) => (
                <li key={template.id}>
                  <Link
                    href={template.demoUrl ?? "/templates"}
                    className="text-sm text-chalk-dim/70 transition-colors hover:text-chalk"
                  >
                    {template.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Product">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/40">
              Product
            </h2>
            <ul className="mt-5 space-y-3">
              {[
                { href: "#how", label: "How it works" },
                { href: "#motion", label: "The editor" },
                { href: "#templates", label: "All templates" },
                { href: "/login", label: "Sign in" },
                { href: "/api/health", label: "Service status" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-chalk-dim/70 transition-colors hover:text-chalk"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-16 text-xs text-chalk-dim/40">
          © {year} XITE. All rights reserved.
        </p>
      </div>

      <div aria-hidden className="overflow-hidden px-4 pb-6">
        <p className="select-none text-center text-[clamp(4rem,19vw,17rem)] font-extrabold leading-[0.75] tracking-[-0.06em] text-chalk/[0.04]">
          XITE
        </p>
      </div>
    </footer>
  );
}
