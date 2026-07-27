import Link from "next/link";

/**
 * Glyph per page.
 *
 * Matched on the slug rather than the title, because a title is edited copy
 * and a slug is an identifier — renaming "About" to "About us" should not
 * silently drop the page back to the generic icon.
 */
const GLYPHS: Record<string, string> = {
  home: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z",
  about: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5h.01M11 11.5h1V17h1",
  admissions:
    "M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5M9 13h6M9 17h4",
  contact:
    "M3 7.5 12 13l9-5.5M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
};

/** Anything unrecognised still gets a page, not a blank. */
const FALLBACK = "M6 3h8l4 4v14H6V3ZM14 3v4h4M9 12h6M9 16h6";

/**
 * The page switcher.
 *
 * Icons rather than text tabs, in a floating pill row rather than bordered
 * editor tabs — this sits directly above the live-rendered site, so reading as
 * part of the workspace beats reading as chrome bolted on top of it.
 *
 * The page title stays as the accessible name and the tooltip. A glyph on its
 * own is a guess, and an icon nobody can name is not navigation.
 */
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
    <nav
      className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white p-1 shadow-sm"
      aria-label="Pages"
    >
      {pages.map((page) => {
        const isActive = page.slug === currentSlug;

        return (
          <Link
            key={page.id}
            href={`/editor/${subdomain}?page=${page.slug}`}
            aria-current={isActive ? "page" : undefined}
            title={page.title}
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              isActive
                ? "bg-black text-white"
                : "text-black/45 hover:bg-black/5 hover:text-black"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={GLYPHS[page.slug] ?? FALLBACK} />
            </svg>
            <span className="sr-only">{page.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
