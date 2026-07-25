import Link from "next/link";

import type { SiteNavPage } from "@/lib/site/queries";

export function SiteHeader({
  collegeName,
  subdomain,
  pages,
  currentSlug,
}: {
  collegeName: string;
  subdomain: string;
  pages: SiteNavPage[];
  currentSlug: string;
}) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-white/10 px-6 py-4"
      style={{ backgroundColor: "var(--site-primary)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link
          href={`/site/${subdomain}`}
          className="font-[family-name:var(--site-heading-font)] text-lg font-bold text-white"
        >
          {collegeName}
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {pages.map((page) => {
            const isActive = page.slug === currentSlug;
            return (
              <Link
                key={page.id}
                href={
                  page.slug === pages[0]?.slug
                    ? `/site/${subdomain}`
                    : `/site/${subdomain}/${page.slug}`
                }
                className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "text-[var(--site-dark)]"
                    : "text-white/85 hover:text-white"
                }`}
                style={
                  isActive ? { backgroundColor: "var(--site-accent)" } : undefined
                }
              >
                {page.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
