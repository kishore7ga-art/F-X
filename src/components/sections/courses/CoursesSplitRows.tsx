import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import type { CoursesContent } from "@/lib/sections/schemas";

/** Courses variant: wide rows with the programme name in a coloured left rail
 * and its details on the right. Reads well for long programme names. */
export function CoursesSplitRows({ content }: { content: CoursesContent }) {
  const { title, subtitle, courses } = content;

  return (
    <SectionShell background="white">
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="mt-10 space-y-3">
        {courses.map((course, index) => (
          <article
            key={`${course.name}-${index}`}
            className="grid overflow-hidden rounded-lg border sm:grid-cols-[minmax(0,240px)_1fr]"
          >
            <div
              className="flex flex-col justify-center gap-1.5 p-5"
              style={{ backgroundColor: "var(--site-light)" }}
            >
              <h3
                className="font-[family-name:var(--site-heading-font)] text-base font-semibold leading-snug"
                style={{ color: "var(--site-primary)" }}
              >
                {course.name}
              </h3>
              {course.duration ? (
                <span
                  className="self-start rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: "var(--site-secondary)" }}
                >
                  {course.duration}
                </span>
              ) : null}
            </div>

            <div className="space-y-2 p-5">
              {course.description ? (
                <p className="text-sm leading-relaxed opacity-80">
                  {course.description}
                </p>
              ) : null}
              {course.eligibility ? (
                <p className="text-xs opacity-65">
                  <span className="font-semibold">Eligibility: </span>
                  {course.eligibility}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
