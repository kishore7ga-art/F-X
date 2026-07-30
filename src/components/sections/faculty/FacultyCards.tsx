import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { FacultyContent } from "@/lib/sections/schemas";

/** Faculty variant: photo cards in a grid. */
export function FacultyCards({ content }: { content: FacultyContent }) {
  const { title, subtitle, members } = content;

  return (
    <SectionShell background="white">
      <SectionHeading title={title} subtitle={subtitle} align="center" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, index) => (
          <article
            key={`${member.name}-${index}`}
            className="overflow-hidden rounded-xl bg-[var(--site-light)] text-center shadow-sm"
          >
            {member.photoUrl ? (
              <SiteImage
                src={member.photoUrl}
                alt={member.name}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div
                className="flex h-48 w-full items-center justify-center text-3xl font-bold text-white"
                style={{ backgroundColor: "var(--site-secondary)" }}
              >
                {member.name.charAt(0)}
              </div>
            )}

            <div className="p-5">
              <h3
                className="font-[family-name:var(--site-heading-font)] text-base font-semibold"
                style={{ color: "var(--site-primary)" }}
              >
                {member.name}
              </h3>
              {member.designation ? (
                <p className="mt-1 text-sm opacity-80">{member.designation}</p>
              ) : null}
              {member.department ? (
                <p className="mt-2 text-xs uppercase tracking-wide opacity-60">
                  {member.department}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
