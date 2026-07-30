import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import type { CoursesContent } from "@/lib/sections/schemas";

/** Courses variant: large numbered rows, prospectus style. */
export function CoursesNumberedList({ content }: { content: CoursesContent }) {
  const { title, subtitle, courses } = content;

  return (
    <SectionShell background="light">
      <SectionHeading title={title} subtitle={subtitle} />

      <ol className="mt-10 space-y-4">
        {courses.map((course, index) => (
          <li
            key={`${course.name}-${index}`}
            className="flex gap-5 rounded-xl bg-[var(--site-card-bg)] p-5 shadow-sm sm:p-6"
          >
            <span
              className="font-[family-name:var(--site-heading-font)] text-3xl font-bold leading-none opacity-25"
              style={{ color: "var(--site-primary)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3
                  className="font-[family-name:var(--site-heading-font)] text-base font-semibold sm:text-lg"
                  style={{ color: "var(--site-primary)" }}
                >
                  {course.name}
                </h3>
                {course.duration ? (
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--site-accent)" }}
                  >
                    {course.duration}
                  </span>
                ) : null}
              </div>

              {course.description ? (
                <p className="mt-2 text-sm leading-relaxed opacity-80">
                  {course.description}
                </p>
              ) : null}
              {course.eligibility ? (
                <p className="mt-2 text-xs opacity-65">
                  <span className="font-semibold">Eligibility: </span>
                  {course.eligibility}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
