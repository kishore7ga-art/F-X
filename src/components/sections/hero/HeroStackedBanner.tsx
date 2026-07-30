import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";

/**
 * Hero variant: coloured text band above, wide image strip below. Layout
 * pattern common to plain-HTML education templates; rebuilt in Tailwind.
 */
export function HeroStackedBanner({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  return (
    <section>
      <div
        className="px-6 py-14 text-center sm:py-16"
        style={{ backgroundColor: "var(--site-primary)" }}
      >
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--site-heading-font)] text-3xl font-bold leading-tight text-white sm:text-5xl">
            {collegeName}
          </h1>

          {tagline ? (
            <p
              className="mt-3 text-sm font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--site-accent)" }}
            >
              {tagline}
            </p>
          ) : null}

          {intro ? (
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              {intro}
            </p>
          ) : null}

          {ctaLabel ? (
            <a
              href={ctaHref || "#"}
              className="mt-7 inline-block rounded-full px-7 py-3 text-sm font-semibold text-[var(--site-dark)] transition hover:opacity-90"
              style={{ backgroundColor: "var(--site-accent)" }}
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>

      {bannerImageUrl ? (
        <SiteImage
          src={bannerImageUrl}
          alt={collegeName}
          className="h-56 w-full object-cover sm:h-80"
        />
      ) : (
        <div className="h-3 w-full" style={{ backgroundColor: "var(--site-accent)" }} />
      )}
    </section>
  );
}
