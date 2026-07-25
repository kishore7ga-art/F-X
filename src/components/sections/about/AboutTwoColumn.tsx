import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { AboutContent } from "@/lib/sections/schemas";

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

  return (
    <SectionShell background="white">
      <SectionHeading title={title} />

      <div className="mt-10 grid gap-10 md:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          {history ? <p className="leading-relaxed opacity-85">{history}</p> : null}

          {mission ? (
            <div>
              <h3
                className="font-[family-name:var(--site-heading-font)] text-lg font-semibold"
                style={{ color: "var(--site-secondary)" }}
              >
                Our Mission
              </h3>
              <p className="mt-1 leading-relaxed opacity-85">{mission}</p>
            </div>
          ) : null}

          {vision ? (
            <div>
              <h3
                className="font-[family-name:var(--site-heading-font)] text-lg font-semibold"
                style={{ color: "var(--site-secondary)" }}
              >
                Our Vision
              </h3>
              <p className="mt-1 leading-relaxed opacity-85">{vision}</p>
            </div>
          ) : null}
        </div>

        {principalMessage || principalName ? (
          <aside className="rounded-xl bg-[var(--site-light)] p-6">
            {principalPhotoUrl ? (
              <SiteImage
                src={principalPhotoUrl}
                alt={principalName}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : null}
            {principalMessage ? (
              <blockquote className="mt-4 text-sm italic leading-relaxed opacity-85">
                “{principalMessage}”
              </blockquote>
            ) : null}
            {principalName ? (
              <p className="mt-4 text-sm font-semibold" style={{ color: "var(--site-primary)" }}>
                {principalName}
              </p>
            ) : null}
            {principalDesignation ? (
              <p className="text-xs uppercase tracking-wide opacity-70">
                {principalDesignation}
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>
    </SectionShell>
  );
}
