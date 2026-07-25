import Link from "next/link";

/** Top-of-screen page tabs — Home / About / Admissions / Contact. */
export function PageTabs({
  subdomain,
  pages,
  currentSlug,
}: {
  subdomain: string;
  pages: { id: string; slug: string; title: string }[];
  currentSlug: string;
}) {
  return (
    <nav className="flex flex-wrap gap-1" aria-label="Pages">
      {pages.map((page) => {
        const isActive = page.slug === currentSlug;
        return (
          <Link
            key={page.id}
            href={`/editor/${subdomain}?page=${page.slug}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-black text-black"
                : "border-transparent text-black/45 hover:text-black/70"
            }`}
          >
            {page.title}
          </Link>
        );
      })}
    </nav>
  );
}
