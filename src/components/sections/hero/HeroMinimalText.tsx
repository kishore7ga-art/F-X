import type { HeroContent } from "@/lib/sections/schemas";

/**
 * Hero variant: type-led, clean typography.
 */
export function HeroMinimalText({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, ctaLabel, ctaHref } = content;

  return (
    <section className="bg-[var(--site-bg)] px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        {tagline ? (
          <span className="inline-block rounded-full bg-blue-50/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-500 border border-blue-500/20 mb-4">
            {tagline}
          </span>
        ) : null}

        {collegeName ? (
          <h1
            className="mt-2 font-[family-name:var(--site-heading-font)] text-4xl font-extrabold leading-[1.1] sm:text-6xl"
            style={{ color: "var(--site-primary)" }}
          >
            {collegeName}
          </h1>
        ) : null}

        {intro ? (
          <>
            <div
              className="mx-auto mt-6 h-1 w-24 rounded-full"
              style={{ backgroundColor: "var(--site-secondary)" }}
            />

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed opacity-85 sm:text-lg">
              {intro}
            </p>
          </>
        ) : null}

        {ctaLabel ? (
          <a
            href={ctaHref || "#"}
            className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold text-white transition hover:scale-105 shadow-md"
            style={{ backgroundColor: "var(--site-primary)" }}
          >
            <span>{ctaLabel}</span>
            <span>→</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
