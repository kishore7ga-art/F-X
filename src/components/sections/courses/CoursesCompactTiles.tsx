import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import type { CoursesContent } from "@/lib/sections/schemas";

/** Courses variant: dense four-up tiles. Suits colleges listing many
 * programmes where the name and duration are the important bits. */
export function CoursesCompactTiles({ content }: { content: CoursesContent }) {
  const { title, subtitle, courses } = content;

  return (
    <SectionShell background="light">
      <SectionHeading title={title} subtitle={subtitle} align="center" />

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course, index) => (
          <article
            key={`${course.name}-${index}`}
            className="flex flex-col border-t-4 bg-white p-4 shadow-sm"
            style={{ borderTopColor: "var(--site-secondary)" }}
          >
            <h3
              className="font-[family-name:var(--site-heading-font)] text-sm font-bold leading-snug"
              style={{ color: "var(--site-primary)" }}
            >
              {course.name}
            </h3>

            {course.duration ? (
              <p
                className="mt-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--site-accent)" }}
              >
                {course.duration}
              </p>
            ) : null}

            {course.eligibility ? (
              <p className="mt-3 border-t pt-2 text-[11px] leading-relaxed opacity-65">
                {course.eligibility}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
