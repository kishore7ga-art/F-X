import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";

/** Hero variant: full-bleed banner with centered text over overlay. */
export function HeroCentered({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  if (!intro && !tagline && !bannerImageUrl && !ctaLabel) {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden bg-[var(--site-dark)] px-6 py-24 text-center text-white sm:py-32">
      {bannerImageUrl ? (
        <SiteImage
          src={bannerImageUrl}
          alt={collegeName || "Hero Banner"}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      ) : null}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/90"
      />

      <div className="mx-auto max-w-3xl">
        {tagline ? (
          <span className="inline-block rounded-full bg-blue-500/20 border border-blue-400/30 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 mb-4">
            {tagline}
          </span>
        ) : null}

        {collegeName ? (
          <h1 className="font-[family-name:var(--site-heading-font)] text-4xl font-extrabold leading-tight sm:text-6xl text-white">
            {collegeName}
          </h1>
        ) : null}

        {intro ? (
          <p className="mx-auto mt-6 max-w-2xl text-base opacity-90 sm:text-lg text-slate-200">
            {intro}
          </p>
        ) : null}

        {ctaLabel ? (
          <div className="mt-8 flex justify-center gap-4">
            <a
              href={ctaHref || "#"}
              className="inline-block rounded-xl px-7 py-3.5 text-sm font-extrabold text-white transition hover:scale-105 shadow-lg"
              style={{ backgroundColor: "var(--site-primary)" }}
            >
              {ctaLabel} »
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
