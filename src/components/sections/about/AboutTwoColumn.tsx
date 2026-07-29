import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { AboutContent } from "@/lib/sections/schemas";
import { Target, Compass, Quote } from "lucide-react";

/** About variant: narrative on the left, principal's message card on the right. */
export function AboutTwoColumn({ content }: { content: AboutContent }) {
  const {
    title,
    history,
    mission,
    vision,
    principalName,
    principalDesignation,
    principalPhotoUrl,
    principalMessage,
  } = content;

  const photoSrc =
    principalPhotoUrl && !principalPhotoUrl.includes("svg") && !principalPhotoUrl.includes("macbook")
      ? principalPhotoUrl
      : "/hero-madras-college.jpg";

  return (
    <SectionShell background="white">
      <SectionHeading title={title} />

      <div className="mt-10 grid gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          {history ? (
            <p className="text-base leading-relaxed text-slate-600 font-medium">
              {history}
            </p>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            {mission ? (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mb-3">
                  <Target className="h-5 w-5" />
                </div>
                <h3
                  className="font-[family-name:var(--site-heading-font)] text-lg font-extrabold text-slate-900"
                >
                  Our Mission
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                  {mission}
                </p>
              </div>
            ) : null}

            {vision ? (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm mb-3">
                  <Compass className="h-5 w-5" />
                </div>
                <h3
                  className="font-[family-name:var(--site-heading-font)] text-lg font-extrabold text-slate-900"
                >
                  Our Vision
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                  {vision}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {principalMessage || principalName ? (
          <aside className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-7 shadow-xl">
            <Quote className="absolute top-4 right-4 h-12 w-12 text-slate-200/60" />
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-md">
                <SiteImage
                  src={photoSrc}
                  alt={principalName || "Principal"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                {principalName ? (
                  <p className="text-base font-extrabold text-slate-900">
                    {principalName}
                  </p>
                ) : null}
                {principalDesignation ? (
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mt-0.5">
                    {principalDesignation}
                  </p>
                ) : null}
              </div>
            </div>

            {principalMessage ? (
              <blockquote className="mt-5 text-sm italic leading-relaxed text-slate-600 font-medium border-l-2 border-blue-600 pl-4 py-1">
                “{principalMessage}”
              </blockquote>
            ) : null}
          </aside>
        ) : null}
      </div>
    </SectionShell>
  );
}
