import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";

/**
 * Hero variant: full-bleed image with a solid colour card overlapping it.
 * Keeps text legible over any banner photo, however busy.
 */
export function HeroSidePanel({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  return (
    <section className="relative isolate bg-[var(--site-dark)]">
      {bannerImageUrl ? (
        <SiteImage
          src={bannerImageUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60"
        />
      ) : null}

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div
          className="max-w-xl p-8 shadow-xl sm:p-10"
          style={{ backgroundColor: "var(--site-primary)" }}
        >
          {tagline ? (
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--site-accent)" }}
            >
              {tagline}
            </p>
          ) : null}

          <h1 className="mt-3 font-[family-name:var(--site-heading-font)] text-3xl font-bold leading-tight text-white sm:text-5xl">
            {collegeName}
          </h1>

          {intro ? (
            <p className="mt-5 text-sm leading-relaxed text-white/85 sm:text-base">
              {intro}
            </p>
          ) : null}

          {ctaLabel ? (
            <a
              href={ctaHref || "#"}
              className="mt-7 inline-block px-6 py-3 text-sm font-semibold text-[var(--site-dark)] transition hover:opacity-90"
              style={{ backgroundColor: "var(--site-accent)" }}
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
