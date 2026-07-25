import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { FacultyContent } from "@/lib/sections/schemas";

/**
 * Faculty variant: members grouped under their department heading. The grouping
 * is derived from the existing `department` field — no new content required.
 */
export function FacultyDepartmentGroups({
  content,
}: {
  content: FacultyContent;
}) {
  const { title, subtitle, members } = content;

  const groups = new Map<string, typeof members>();
  for (const member of members) {
    const key = member.department || "Faculty";
    groups.set(key, [...(groups.get(key) ?? []), member]);
  }

  return (
    <SectionShell background="white">
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="mt-10 space-y-9">
        {[...groups.entries()].map(([department, group]) => (
          <div key={department}>
            <h3
              className="border-b pb-2 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--site-accent)" }}
            >
              {department}
            </h3>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((member, index) => (
                <li
                  key={`${member.name}-${index}`}
                  className="flex items-center gap-3"
                >
                  {member.photoUrl ? (
                    <SiteImage
                      src={member.photoUrl}
                      alt={member.name}
                      className="h-12 w-12 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded text-sm font-bold text-white"
                      style={{ backgroundColor: "var(--site-secondary)" }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold"
                      style={{ color: "var(--site-primary)" }}
                    >
                      {member.name}
                    </p>
                    {member.designation ? (
                      <p className="truncate text-xs opacity-70">
                        {member.designation}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
