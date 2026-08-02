import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";
import { ArrowRight } from "lucide-react";

/** Hero variant: text on top (or left on desktop), banner image on bottom (or right on desktop). */
export function HeroImageSplit({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  if (!intro && !tagline && !bannerImageUrl && !ctaLabel) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[var(--site-bg)] text-[var(--site-dark)] px-4 sm:px-6 py-8 sm:py-24 transition-colors duration-300">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Title & Tagline */}
            <div>
              {tagline ? (
                <p
                  className="text-[11px] sm:text-sm font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--site-accent)" }}
                >
                  {tagline}
                </p>
              ) : null}
              {collegeName ? (
                <h1
                  className="font-[family-name:var(--site-heading-font)] text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-[1.15] break-words"
                  style={{ color: "var(--site-primary)" }}
                >
                  {collegeName}
                </h1>
              ) : null}
            </div>

            {/* Intro */}
            {intro ? (
              <p className="text-sm sm:text-lg leading-relaxed text-[var(--site-dark)] opacity-85 font-medium max-w-2xl">
                {intro}
              </p>
            ) : null}

            {/* CTA Buttons */}
            {ctaLabel ? (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={ctaHref || "#"}
                  className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl px-5 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-extrabold text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl"
                  style={{ backgroundColor: "var(--site-primary)" }}
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ) : null}
          </div>

          {/* Right Hero Image Card */}
          {bannerImageUrl ? (
            <div className="lg:col-span-5 w-full">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--site-card-border)] bg-[var(--site-card-bg)] shadow-xl transition-transform duration-500 hover:scale-[1.01]">
                <SiteImage
                  src={bannerImageUrl}
                  alt={collegeName || "Hero Banner"}
                  className="h-56 sm:h-80 lg:h-[420px] w-full object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
