import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";

/** Hero variant: full-bleed banner with centred text over an overlay. */
export function HeroCentered({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  return (
    <section className="relative isolate overflow-hidden bg-[var(--site-dark)] px-6 py-24 text-center text-white sm:py-32">
      {bannerImageUrl ? (
        <>
          <SiteImage
            src={bannerImageUrl}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--site-dark) 72%, transparent), color-mix(in srgb, var(--site-primary) 80%, transparent))",
            }}
          />
        </>
      ) : null}

      <div className="mx-auto max-w-3xl">
        <h1 className="font-[family-name:var(--site-heading-font)] text-4xl font-bold leading-tight sm:text-6xl">
          {collegeName}
        </h1>
        {tagline ? (
          <p
            className="mt-4 text-lg font-medium sm:text-xl"
            style={{ color: "var(--site-accent)" }}
          >
            {tagline}
          </p>
        ) : null}
        {intro ? (
          <p className="mx-auto mt-6 max-w-2xl text-base opacity-90 sm:text-lg">
            {intro}
          </p>
        ) : null}
        {ctaLabel ? (
          <a
            href={ctaHref || "#"}
            className="mt-8 inline-block rounded-md px-7 py-3 text-sm font-semibold text-[var(--site-dark)] transition hover:opacity-90"
            style={{ backgroundColor: "var(--site-accent)" }}
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
