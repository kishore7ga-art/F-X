import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { AboutContent } from "@/lib/sections/schemas";

/** About variant: history / mission / vision as a vertical timeline, with the
 * principal's message closing it out. Same AboutContent fields, no additions. */
export function AboutTimeline({ content }: { content: AboutContent }) {
  const {
    title,
    history,
    mission,
    vision,
    principalName,
    principalDesignation,
    principalPhotoUrl,
    principalMessage,
  } = content;

  const steps = [
    { label: "Our Story", body: history },
    { label: "Our Mission", body: mission },
    { label: "Our Vision", body: vision },
  ].filter((step) => step.body);

  return (
    <SectionShell background="white">
      <SectionHeading title={title} />

      <ol className="mt-10 space-y-0">
        {steps.map((step, index) => (
          <li key={step.label} className="relative flex gap-5 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: "var(--site-primary)" }}
              >
                {index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  className="mt-1 w-px flex-1"
                  style={{ backgroundColor: "var(--site-secondary)", opacity: 0.35 }}
                />
              ) : null}
            </div>

            <div className="pt-1">
              <h3
                className="font-[family-name:var(--site-heading-font)] text-lg font-semibold"
                style={{ color: "var(--site-secondary)" }}
              >
                {step.label}
              </h3>
              <p className="mt-1.5 leading-relaxed opacity-85">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {principalMessage || principalName ? (
        <div
          className="mt-10 flex flex-col gap-4 rounded-xl p-6 sm:flex-row sm:items-center"
          style={{ backgroundColor: "var(--site-light)" }}
        >
          {principalPhotoUrl ? (
            <SiteImage
              src={principalPhotoUrl}
              alt={principalName}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <div>
            {principalMessage ? (
              <p className="text-sm italic leading-relaxed opacity-85">
                “{principalMessage}”
              </p>
            ) : null}
            <p className="mt-2 text-sm font-semibold" style={{ color: "var(--site-primary)" }}>
              {principalName}
              {principalDesignation ? (
                <span className="font-normal opacity-65"> · {principalDesignation}</span>
              ) : null}
            </p>
          </div>
        </div>
      ) : null}
    </SectionShell>
  );
}
