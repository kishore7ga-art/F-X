import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import type { CoursesContent } from "@/lib/sections/schemas";

/**
 * Courses variant: expandable accordion. Uses native <details>/<summary>, so it
 * stays a server component with no client JavaScript.
 */
export function CoursesAccordion({ content }: { content: CoursesContent }) {
  const { title, subtitle, courses } = content;

  return (
    <SectionShell background="white">
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="mt-10 divide-y rounded-xl border">
        {courses.map((course, index) => (
          <details
            key={`${course.name}-${index}`}
            className="group px-5 py-4"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span
                className="font-[family-name:var(--site-heading-font)] text-base font-semibold"
                style={{ color: "var(--site-primary)" }}
              >
                {course.name}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {course.duration ? (
                  <span className="text-xs font-semibold opacity-60">
                    {course.duration}
                  </span>
                ) : null}
                <span
                  className="text-lg leading-none transition group-open:rotate-45"
                  style={{ color: "var(--site-accent)" }}
                  aria-hidden="true"
                >
                  +
                </span>
              </span>
            </summary>

            <div className="mt-3 space-y-2 text-sm">
              {course.description ? (
                <p className="leading-relaxed opacity-80">{course.description}</p>
              ) : null}
              {course.eligibility ? (
                <p className="opacity-70">
                  <span className="font-semibold">Eligibility: </span>
                  {course.eligibility}
                </p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
