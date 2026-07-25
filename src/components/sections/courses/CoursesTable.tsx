import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import type { CoursesContent } from "@/lib/sections/schemas";

/** Courses variant: comparison table. Same `courses[]` data as CoursesGrid. */
export function CoursesTable({ content }: { content: CoursesContent }) {
  const { title, subtitle, courses } = content;

  return (
    <SectionShell background="white">
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="mt-10 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--site-primary)", color: "#fff" }}>
              <th className="px-5 py-3 font-semibold">Programme</th>
              <th className="px-5 py-3 font-semibold">Duration</th>
              <th className="px-5 py-3 font-semibold">Eligibility</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr
                key={`${course.name}-${index}`}
                className={index % 2 ? "bg-[var(--site-light)]" : "bg-white"}
              >
                <td className="px-5 py-4 align-top">
                  <span className="font-semibold">{course.name}</span>
                  {course.description ? (
                    <span className="mt-1 block text-xs opacity-70">
                      {course.description}
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-5 py-4 align-top opacity-85">
                  {course.duration}
                </td>
                <td className="px-5 py-4 align-top opacity-85">
                  {course.eligibility}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
