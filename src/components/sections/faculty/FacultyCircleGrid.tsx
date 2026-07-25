import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { FacultyContent } from "@/lib/sections/schemas";

/** Faculty variant: circular portraits in a light, airy grid. */
export function FacultyCircleGrid({ content }: { content: FacultyContent }) {
  const { title, subtitle, members } = content;

  return (
    <SectionShell background="light">
      <SectionHeading title={title} subtitle={subtitle} align="center" />

      <div className="mt-12 grid gap-8 sm:grid-cols-3 lg:grid-cols-4">
        {members.map((member, index) => (
          <article
            key={`${member.name}-${index}`}
            className="flex flex-col items-center text-center"
          >
            {member.photoUrl ? (
              <SiteImage
                src={member.photoUrl}
                alt={member.name}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-md"
              />
            ) : (
              <div
                className="flex h-28 w-28 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md ring-4 ring-white"
                style={{ backgroundColor: "var(--site-secondary)" }}
              >
                {member.name.charAt(0)}
              </div>
            )}

            <h3
              className="mt-4 font-[family-name:var(--site-heading-font)] text-sm font-semibold"
              style={{ color: "var(--site-primary)" }}
            >
              {member.name}
            </h3>
            {member.designation ? (
              <p className="mt-0.5 text-xs opacity-75">{member.designation}</p>
            ) : null}
            {member.department ? (
              <p className="mt-1.5 text-[11px] uppercase tracking-wide opacity-55">
                {member.department}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
