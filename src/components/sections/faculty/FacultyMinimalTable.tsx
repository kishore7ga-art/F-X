import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import type { FacultyContent } from "@/lib/sections/schemas";

/** Faculty variant: photo-free directory table. Practical for large
 * departments, and it degrades gracefully when photos are missing. */
export function FacultyMinimalTable({ content }: { content: FacultyContent }) {
  const { title, subtitle, members } = content;

  return (
    <SectionShell background="white">
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="mt-10 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr
              className="text-xs uppercase tracking-wide"
              style={{ backgroundColor: "var(--site-light)" }}
            >
              <th className="px-5 py-3 font-bold">Name</th>
              <th className="px-5 py-3 font-bold">Designation</th>
              <th className="px-5 py-3 font-bold">Department</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={`${member.name}-${index}`} className="border-t">
                <td
                  className="px-5 py-3 font-semibold"
                  style={{ color: "var(--site-primary)" }}
                >
                  {member.name}
                </td>
                <td className="px-5 py-3 opacity-80">{member.designation}</td>
                <td className="px-5 py-3 opacity-80">{member.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
