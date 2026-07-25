import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { FacultyContent } from "@/lib/sections/schemas";

/** Faculty variant: compact horizontal roster rows. */
export function FacultyRoster({ content }: { content: FacultyContent }) {
  const { title, subtitle, members } = content;

  return (
    <SectionShell background="light">
      <SectionHeading title={title} subtitle={subtitle} />

      <ul className="mt-10 divide-y rounded-xl bg-white shadow-sm">
        {members.map((member, index) => (
          <li
            key={`${member.name}-${index}`}
            className="flex items-center gap-4 p-5"
          >
            {member.photoUrl ? (
              <SiteImage
                src={member.photoUrl}
                alt={member.name}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: "var(--site-secondary)" }}
              >
                {member.name.charAt(0)}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold" style={{ color: "var(--site-primary)" }}>
                {member.name}
              </h3>
              <p className="truncate text-sm opacity-75">
                {[member.designation, member.department]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
