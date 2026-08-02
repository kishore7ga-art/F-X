import type { HeroContent } from "@/lib/sections/schemas";

/**
 * Hero variant: type-led, clean typography.
 */
export function HeroMinimalText({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, ctaLabel, ctaHref } = content;

  const displayCollegeName = collegeName || "Kishore7ga Institute of Technology & Science";
  const displayTagline = tagline || "NAAC A++ Accredited Autonomous University | NIRF Top 30";
  const displayIntro = intro || "Welcome to Kishore7ga Institute of Technology & Science (KITS). Empowering future engineering leaders with state-of-the-art research hubs, 98% placement rate, 48 LPA max salary package, and global industry partnerships.";
  const displayCtaLabel = ctaLabel || "Explore Programmes";
  const displayCtaHref = ctaHref || "/courses";

  return (
    <section className="bg-[var(--site-bg)] px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-block rounded-full bg-blue-50/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-500 border border-blue-500/20 mb-4">
          {displayTagline}
        </span>

        <h1
          className="mt-2 font-[family-name:var(--site-heading-font)] text-4xl font-extrabold leading-[1.1] sm:text-6xl"
          style={{ color: "var(--site-primary)" }}
        >
          {displayCollegeName}
        </h1>

        <div
          className="mx-auto mt-6 h-1 w-24 rounded-full"
          style={{ backgroundColor: "var(--site-secondary)" }}
        />

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed opacity-85 sm:text-lg">
          {displayIntro}
        </p>

        <a
          href={displayCtaHref}
          className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold text-white transition hover:scale-105 shadow-md"
          style={{ backgroundColor: "var(--site-primary)" }}
        >
          <span>{displayCtaLabel}</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
}
