import { SiteImage } from "@/components/site/SiteImage";
import type { HeroContent } from "@/lib/sections/schemas";
import { Award, ArrowRight, ShieldCheck, Users, GraduationCap, Building2 } from "lucide-react";

/** Hero variant: text on the left, banner image on the right with quick stats bar. */
export function HeroImageSplit({ content }: { content: HeroContent }) {
  const { collegeName, tagline, intro, bannerImageUrl, ctaLabel, ctaHref } =
    content;

  const imageSrc =
    bannerImageUrl && !bannerImageUrl.includes("macbook") && !bannerImageUrl.includes("svg")
      ? bannerImageUrl
      : "/hero-madras-college.jpg";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--site-light)] to-white px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 border border-blue-200/80 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>NAAC A+ Accredited Institution</span>
            </div>

            {/* Title */}
            <div>
              {tagline ? (
                <p
                  className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--site-accent)" }}
                >
                  {tagline}
                </p>
              ) : null}
              <h1
                className="font-[family-name:var(--site-heading-font)] text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.15]"
                style={{ color: "var(--site-primary)" }}
              >
                {collegeName}
              </h1>
            </div>

            {/* Intro */}
            {intro ? (
              <p className="text-base sm:text-lg leading-relaxed text-[var(--site-dark)] opacity-85 font-medium max-w-2xl">
                {intro}
              </p>
            ) : null}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {ctaLabel ? (
                <a
                  href={ctaHref || "#"}
                  className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-extrabold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: "var(--site-primary)" }}
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : null}

              <a
                href="#courses"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <span>Explore Programmes</span>
              </a>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
              <SiteImage
                src={imageSrc}
                alt={collegeName}
                className="h-80 w-full object-cover sm:h-[420px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 backdrop-blur-md p-4 border border-white/40 shadow-lg">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Campus Overview
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  State-of-the-Art Research & Innovation Hub
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-16 grid grid-cols-2 gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md sm:grid-cols-4">
          <div className="flex items-center gap-3.5 border-r border-slate-100 last:border-0 pr-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">4,000+</p>
              <p className="text-xs font-semibold text-slate-500">Active Students</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 border-r border-slate-100 last:border-0 pr-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">14</p>
              <p className="text-xs font-semibold text-slate-500">Academic Depts</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 border-r border-slate-100 last:border-0 pr-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">98%</p>
              <p className="text-xs font-semibold text-slate-500">Placement Rate</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pr-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">42-Acre</p>
              <p className="text-xs font-semibold text-slate-500">Green Campus</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
