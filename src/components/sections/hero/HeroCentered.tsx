import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";

/** Hero variant: full-bleed banner with centered text over overlay. */
export function HeroCentered({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  const displayCollegeName = collegeName || "Kishore7ga Institute of Technology & Science";
  const displayTagline = tagline || "NAAC A++ Accredited Autonomous University | NIRF Top 30";
  const displayIntro = intro || "Welcome to Kishore7ga Institute of Technology & Science (KITS). Empowering future engineering leaders with state-of-the-art research hubs, 98% placement rate, 48 LPA max salary package, and global industry partnerships.";
  const displayCtaLabel = ctaLabel || "Explore Programmes";
  const displayCtaHref = ctaHref || "/courses";
  const displayImage = bannerImageUrl && !bannerImageUrl.includes("svg") ? bannerImageUrl : "/template-brightwood.jpg";

  return (
    <section className="relative isolate overflow-hidden bg-[var(--site-dark)] px-6 py-24 text-center text-white sm:py-32">
      <SiteImage
        src={displayImage}
        alt={displayCollegeName}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/90"
      />

      <div className="mx-auto max-w-3xl">
        <span className="inline-block rounded-full bg-blue-500/20 border border-blue-400/30 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 mb-4">
          {displayTagline}
        </span>
        <h1 className="font-[family-name:var(--site-heading-font)] text-4xl font-extrabold leading-tight sm:text-6xl text-white">
          {displayCollegeName}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base opacity-90 sm:text-lg text-slate-200">
          {displayIntro}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href={displayCtaHref}
            className="inline-block rounded-xl px-7 py-3.5 text-sm font-extrabold text-white transition hover:scale-105 shadow-lg"
            style={{ backgroundColor: "var(--site-primary)" }}
          >
            {displayCtaLabel} »
          </a>
        </div>
      </div>
    </section>
  );
}
