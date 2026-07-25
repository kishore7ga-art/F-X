import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { AboutContent } from "@/lib/sections/schemas";

/** About variant: the principal's message leads as a large pull-quote, with
 * history / mission / vision as three supporting columns beneath. */
export function AboutQuoteLead({ content }: { content: AboutContent }) {
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

  const columns = [
    { label: "History", body: history },
    { label: "Mission", body: mission },
    { label: "Vision", body: vision },
  ].filter((column) => column.body);

  return (
    <SectionShell background="light">
      <SectionHeading title={title} align="center" />

      {principalMessage ? (
        <figure className="mx-auto mt-10 max-w-3xl text-center">
          <blockquote
            className="font-[family-name:var(--site-heading-font)] text-xl italic leading-snug sm:text-2xl"
            style={{ color: "var(--site-primary)" }}
          >
            “{principalMessage}”
          </blockquote>
          <figcaption className="mt-5 flex items-center justify-center gap-3">
            {principalPhotoUrl ? (
              <SiteImage
                src={principalPhotoUrl}
                alt={principalName}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : null}
            <span className="text-left text-sm">
              <span className="block font-semibold">{principalName}</span>
              {principalDesignation ? (
                <span className="block text-xs uppercase tracking-wide opacity-60">
                  {principalDesignation}
                </span>
              ) : null}
            </span>
          </figcaption>
        </figure>
      ) : null}

      {columns.length > 0 ? (
        <div className="mt-12 grid gap-8 border-t pt-10 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.label}>
              <h3
                className="text-xs font-bold uppercase tracking-[0.15em]"
                style={{ color: "var(--site-accent)" }}
              >
                {column.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-85">
                {column.body}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
}
