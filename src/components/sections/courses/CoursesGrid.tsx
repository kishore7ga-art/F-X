import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import type { CoursesContent } from "@/lib/sections/schemas";

/** Courses variant: responsive card grid. */
export function CoursesGrid({ content }: { content: CoursesContent }) {
  const { title, subtitle, courses } = content;

  return (
    <SectionShell background="light">
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <article
            key={`${course.name}-${index}`}
            className="flex flex-col rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h3
              className="font-[family-name:var(--site-heading-font)] text-lg font-semibold leading-snug"
              style={{ color: "var(--site-primary)" }}
            >
              {course.name}
            </h3>

            {course.duration ? (
              <span
                className="mt-3 self-start rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: "var(--site-secondary)" }}
              >
                {course.duration}
              </span>
            ) : null}

            {course.description ? (
              <p className="mt-4 text-sm leading-relaxed opacity-80">
                {course.description}
              </p>
            ) : null}

            {course.eligibility ? (
              <p className="mt-4 border-t pt-3 text-xs opacity-70">
                <span className="font-semibold">Eligibility: </span>
                {course.eligibility}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
