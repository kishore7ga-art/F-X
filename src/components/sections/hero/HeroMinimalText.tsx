import type { HeroContent } from "@/lib/sections/schemas";

/**
 * Hero variant: type-led, no imagery. Useful for colleges that have no good
 * banner photo yet — the layout still looks deliberate when bannerImageUrl is
 * empty. Same HeroContent props as every other hero.
 */
export function HeroMinimalText({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, ctaLabel, ctaHref } = content;

  return (
    <section className="bg-[var(--site-bg)] px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        {tagline ? (
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--site-accent)" }}
          >
            {tagline}
          </p>
        ) : null}

        <h1
          className="mt-5 font-[family-name:var(--site-heading-font)] text-4xl font-bold leading-[1.1] sm:text-6xl"
          style={{ color: "var(--site-primary)" }}
        >
          {collegeName}
        </h1>

        <div
          className="mx-auto mt-8 h-px w-24"
          style={{ backgroundColor: "var(--site-secondary)" }}
        />

        {intro ? (
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed opacity-75 sm:text-lg">
            {intro}
          </p>
        ) : null}

        {ctaLabel ? (
          <a
            href={ctaHref || "#"}
            className="mt-10 inline-block border-b-2 pb-1 text-sm font-semibold transition hover:opacity-70"
            style={{
              color: "var(--site-primary)",
              borderBottomColor: "var(--site-accent)",
            }}
          >
            {ctaLabel} →
          </a>
        ) : null}
      </div>
    </section>
  );
}
