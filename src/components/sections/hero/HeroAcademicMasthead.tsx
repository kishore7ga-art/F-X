import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";

/**
 * Hero variant: academic masthead with complete fallback content.
 */
export function HeroAcademicMasthead({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  const displayCollegeName = collegeName || "Kishore7ga Institute of Technology & Science";
  const displayTagline = tagline || "NAAC A++ Accredited Autonomous University | NIRF Top 30";
  const displayIntro = intro || "Welcome to Kishore7ga Institute of Technology & Science (KITS). Empowering future engineering leaders with state-of-the-art research hubs, 98% placement rate, 48 LPA max salary package, and global industry partnerships.";
  const displayCtaLabel = ctaLabel || "Explore Programmes";
  const displayCtaHref = ctaHref || "/courses";
  const displayImage = bannerImageUrl && !bannerImageUrl.includes("svg") ? bannerImageUrl : "/template-brightwood.jpg";

  return (
    <section className="bg-[var(--site-light)]">
      {/* Thin banner rule */}
      <div className="h-1.5 w-full" style={{ backgroundColor: "var(--site-primary)" }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-16">
        <div className="flex flex-col md:grid md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-center">
          <div className="mx-auto w-full max-w-[200px] md:mx-0">
            <SiteImage
              src={displayImage}
              alt={displayCollegeName}
              className="aspect-4/5 w-full rounded-xl border-4 border-white object-cover shadow-lg"
            />
          </div>

          <div className="min-w-0 max-w-2xl">
            <h1
              className="font-[family-name:var(--site-heading-font)] text-3xl font-extrabold leading-tight sm:text-5xl"
              style={{ color: "var(--site-primary)" }}
            >
              {displayCollegeName}
            </h1>

            <p className="mt-2 text-base font-semibold italic opacity-85 sm:text-lg" style={{ color: "var(--site-secondary)" }}>
              {displayTagline}
            </p>

            <div
              className="mt-4 h-1 w-20 rounded-full"
              style={{ backgroundColor: "var(--site-accent)" }}
            />

            <p
              className="mt-5 border-l-4 pl-4 text-sm leading-relaxed opacity-90 sm:text-base"
              style={{ borderLeftColor: "var(--site-primary)" }}
            >
              {displayIntro}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={displayCtaHref}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90"
                style={{ backgroundColor: "var(--site-primary)" }}
              >
                <span>{displayCtaLabel}</span>
                <span aria-hidden="true">»</span>
              </a>

              <a
                href="/admissions"
                className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 px-5 py-2.5 text-xs font-bold text-blue-600 bg-blue-50/50 transition hover:bg-blue-100"
              >
                <span>Admissions 2026</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
