import Link from "next/link";

import type { SiteNavPage } from "@/lib/site/queries";

export function SiteHeader({
  collegeName,
  subdomain,
  pages,
  currentSlug,
  isEditor = false,
}: {
  collegeName: string;
  subdomain: string;
  pages: SiteNavPage[];
  currentSlug: string;
  isEditor?: boolean;
}) {
  const homeSlug = pages[0]?.slug ?? "home";

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/10 px-6 py-4 transition-colors"
      style={{ backgroundColor: "var(--site-primary)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link
          href={
            isEditor
              ? `/editor/${subdomain}?page=${homeSlug}`
              : `/site/${subdomain}`
          }
          className="font-[family-name:var(--site-heading-font)] text-lg font-bold text-white hover:opacity-90 transition"
        >
          {collegeName}
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {pages.map((page) => {
            const isActive = page.slug === currentSlug;
            const targetHref = isEditor
              ? `/editor/${subdomain}?page=${page.slug}`
              : page.slug === homeSlug
                ? `/site/${subdomain}`
                : `/site/${subdomain}/${page.slug}`;

            return (
              <Link
                key={page.id}
                href={targetHref}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "text-[var(--site-dark)] shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
                style={
                  isActive
                    ? { backgroundColor: "var(--site-accent)" }
                    : undefined
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
