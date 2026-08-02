import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";

/**
 * Hero variant: academic masthead rendering strictly database section content.
 */
export function HeroAcademicMasthead({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  return (
    <section className="bg-[var(--site-light)]">
      {/* Thin banner rule */}
      <div className="h-1.5 w-full" style={{ backgroundColor: "var(--site-primary)" }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-16">
        <div className="flex flex-col md:grid md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-center">
          {bannerImageUrl ? (
            <div className="mx-auto w-full max-w-[200px] md:mx-0">
              <SiteImage
                src={bannerImageUrl}
                alt={collegeName || "College Logo"}
                className="aspect-4/5 w-full rounded-xl border-4 border-white object-cover shadow-lg"
              />
            </div>
          ) : null}

          <div className="min-w-0 max-w-2xl">
            {collegeName ? (
              <h1
                className="font-[family-name:var(--site-heading-font)] text-3xl font-extrabold leading-tight sm:text-5xl"
                style={{ color: "var(--site-primary)" }}
              >
                {collegeName}
              </h1>
            ) : null}

            {tagline ? (
              <p className="mt-2 text-base font-semibold italic opacity-85 sm:text-lg" style={{ color: "var(--site-secondary)" }}>
                {tagline}
              </p>
            ) : null}

            {intro ? (
              <>
                <div
                  className="mt-4 h-1 w-20 rounded-full"
                  style={{ backgroundColor: "var(--site-accent)" }}
                />

                <p
                  className="mt-5 border-l-4 pl-4 text-sm leading-relaxed opacity-90 sm:text-base"
                  style={{ borderLeftColor: "var(--site-primary)" }}
                >
                  {intro}
                </p>
              </>
            ) : null}

            {ctaLabel ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={ctaHref || "#"}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90"
                  style={{ backgroundColor: "var(--site-primary)" }}
                >
                  <span>{ctaLabel}</span>
                  <span aria-hidden="true">»</span>
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
