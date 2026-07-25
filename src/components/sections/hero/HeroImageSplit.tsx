import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";

/** Hero variant: text on the left, banner image on the right. Same content
 * fields as HeroCentered — swapping between them never touches the data. */
export function HeroImageSplit({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  return (
    <section className="bg-[var(--site-light)] px-6 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div>
          {tagline ? (
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--site-accent)" }}
            >
              {tagline}
            </p>
          ) : null}
          <h1
            className="mt-3 font-[family-name:var(--site-heading-font)] text-4xl font-bold leading-tight sm:text-5xl"
            style={{ color: "var(--site-primary)" }}
          >
            {collegeName}
          </h1>
          {intro ? (
            <p className="mt-5 text-base leading-relaxed text-[var(--site-dark)] opacity-80">
              {intro}
            </p>
          ) : null}
          {ctaLabel ? (
            <a
              href={ctaHref || "#"}
              className="mt-7 inline-block rounded-md px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "var(--site-primary)" }}
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-xl shadow-lg">
          {bannerImageUrl ? (
            <SiteImage
              src={bannerImageUrl}
              alt={collegeName}
              className="h-72 w-full object-cover sm:h-96"
            />
          ) : (
            <div className="h-72 w-full bg-[var(--site-secondary)] sm:h-96" />
          )}
        </div>
      </div>
    </section>
  );
}
