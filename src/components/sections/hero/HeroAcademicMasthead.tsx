import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";

/**
 * Hero variant: academic masthead.
 *
 * Layout adapted from the Academic Responsive (AR) template's home section —
 * https://github.com/dmsl/academic-responsive-template (CC BY 4.0).
 * Rebuilt in Tailwind against our theme variables rather than porting its
 * Bootstrap markup, so it inherits each college's palette and font pack.
 *
 * Distinguishing traits carried over from AR: a narrow portrait column instead
 * of a 50/50 split, the name and an italic sub-line stacked tightly together,
 * a left-ruled detail block, and a small inline pill link rather than a large
 * button.
 *
 * Accepts exactly the same HeroContent props as every other hero variant, so
 * the ↻ button can swap into it without touching a college's content.
 */
export function HeroAcademicMasthead({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  return (
    <section className="bg-[var(--site-light)]">
      {/* Thin banner rule standing in for AR's fixed academic navbar. */}
      <div className="h-1.5 w-full" style={{ backgroundColor: "var(--site-primary)" }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-16">
        <div className="flex flex-col md:grid md:grid-cols-[200px_1fr] gap-6 md:gap-10">
          <div className="mx-auto w-full max-w-[180px] md:max-w-[200px] md:mx-0">
            {bannerImageUrl ? (
              <SiteImage
                src={bannerImageUrl}
                alt={collegeName}
                className="aspect-4/5 w-full rounded-sm border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div
                className="flex aspect-4/5 w-full items-center justify-center rounded-sm border-4 border-white text-5xl font-bold text-white shadow-md"
                style={{ backgroundColor: "var(--site-secondary)" }}
              >
                {collegeName.charAt(0)}
              </div>
            )}
          </div>

          {/* Capped measure: AR ran its text in a narrow column, and an
              unconstrained line length is unreadable on wide screens. */}
          <div className="min-w-0 max-w-2xl">
            <h1
              className="font-[family-name:var(--site-heading-font)] text-3xl font-bold leading-tight sm:text-4xl"
              style={{ color: "var(--site-primary)" }}
            >
              {collegeName}
            </h1>

            {tagline ? (
              <p className="mt-1.5 text-base italic opacity-70 sm:text-lg">
                {tagline}
              </p>
            ) : null}

            <div
              className="mt-4 h-0.5 w-20"
              style={{ backgroundColor: "var(--site-accent)" }}
            />

            {intro ? (
              <p
                className="mt-5 border-l-2 pl-4 text-sm leading-relaxed opacity-85 sm:text-base"
                style={{ borderLeftColor: "var(--site-secondary)" }}
              >
                {intro}
              </p>
            ) : null}

            {ctaLabel ? (
              <a
                href={ctaHref || "#"}
                className="mt-6 inline-flex items-center gap-1.5 rounded-sm px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--site-secondary)" }}
              >
                {ctaLabel}
                <span aria-hidden="true">»</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
