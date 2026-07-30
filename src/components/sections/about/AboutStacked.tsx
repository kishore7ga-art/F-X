import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { AboutContent } from "@/lib/sections/schemas";

/** About variant: centred history, then mission/vision as cards, then the
 * principal's message as a full-width band. */
export function AboutStacked({ content }: { content: AboutContent }) {
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
      <SectionHeading title={title} align="center" />

      {history ? (
        <p className="mx-auto mt-8 max-w-3xl text-center leading-relaxed opacity-85">
          {history}
        </p>
      ) : null}

      {mission || vision ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {[
            { label: "Our Mission", body: mission },
            { label: "Our Vision", body: vision },
          ]
            .filter((card) => card.body)
            .map((card) => (
              <div
                key={card.label}
                className="rounded-xl border-t-4 bg-[var(--site-card-bg)] p-6 shadow-sm"
                style={{ borderTopColor: "var(--site-accent)" }}
              >
                <h3
                  className="font-[family-name:var(--site-heading-font)] text-lg font-semibold"
                  style={{ color: "var(--site-primary)" }}
                >
                  {card.label}
                </h3>
                <p className="mt-2 leading-relaxed opacity-85">{card.body}</p>
              </div>
            ))}
        </div>
      ) : null}

      {principalMessage ? (
        <div className="mt-10 flex flex-col items-center gap-5 rounded-xl bg-[var(--site-card-bg)] p-8 text-center shadow-sm sm:flex-row sm:text-left">
          {principalPhotoUrl ? (
            <SiteImage
              src={principalPhotoUrl}
              alt={principalName}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <div>
            <blockquote className="text-sm italic leading-relaxed opacity-85">
              “{principalMessage}”
            </blockquote>
            <p className="mt-3 text-sm font-semibold" style={{ color: "var(--site-primary)" }}>
              {principalName}
              {principalDesignation ? (
                <span className="font-normal opacity-70"> · {principalDesignation}</span>
              ) : null}
            </p>
          </div>
        </div>
      ) : null}
    </SectionShell>
  );
}
