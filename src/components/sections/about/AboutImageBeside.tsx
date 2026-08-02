import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { AboutContent } from "@/lib/sections/schemas";

/** About variant: narrative + highlights on the left, full height campus/chancellor image on the right. */
export function AboutImageBeside({ content }: { content: AboutContent }) {
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

  return (
    <SectionShell background="light">
      {title ? <SectionHeading title={title} /> : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          {history ? (
            <p className="text-base leading-relaxed text-[var(--site-dark)] opacity-90 font-medium">
              {history}
            </p>
          ) : null}

          <div className="space-y-4 pt-2">
            {mission ? (
              <div className="rounded-2xl border border-[var(--site-card-border)] bg-[var(--site-card-bg)] p-5 shadow-xs">
                <h3 className="font-[family-name:var(--site-heading-font)] text-base font-extrabold text-blue-600">
                  Our Mission
                </h3>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--site-dark)] opacity-80">
                  {mission}
                </p>
              </div>
            ) : null}

            {vision ? (
              <div className="rounded-2xl border border-[var(--site-card-border)] bg-[var(--site-card-bg)] p-5 shadow-xs">
                <h3 className="font-[family-name:var(--site-heading-font)] text-base font-extrabold text-amber-500">
                  Our Vision
                </h3>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--site-dark)] opacity-80">
                  {vision}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {principalPhotoUrl || principalName || principalMessage ? (
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-[var(--site-card-border)] bg-[var(--site-card-bg)] shadow-xl">
            {principalPhotoUrl ? (
              <SiteImage
                src={principalPhotoUrl}
                alt={principalName || "Leadership"}
                className="h-80 lg:h-[420px] w-full object-cover"
              />
            ) : null}
            <div className="p-6 bg-[var(--site-card-bg)]">
              {principalName ? (
                <p className="text-base font-extrabold text-[var(--site-dark)]">
                  {principalName}
                </p>
              ) : null}
              {principalDesignation ? (
                <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mt-0.5">
                  {principalDesignation}
                </p>
              ) : null}
              {principalMessage ? (
                <p className="mt-3 text-xs italic opacity-85">
                  &ldquo;{principalMessage}&rdquo;
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
