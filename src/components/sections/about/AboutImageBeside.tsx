import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { AboutContent } from "@/lib/sections/schemas";

/** About variant: large principal portrait on the left, all copy on the right. */
export function AboutImageBeside({ content }: { content: AboutContent }) {
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

  return (
    <SectionShell background="white">
      <div className="grid gap-8 md:gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="w-full max-w-xs mx-auto md:max-w-none">
          {principalPhotoUrl ? (
            <SiteImage
              src={principalPhotoUrl}
              alt={principalName}
              className="aspect-3/4 w-full rounded-xl object-cover shadow-md"
            />
          ) : (
            <div
              className="flex aspect-3/4 w-full items-center justify-center rounded-xl text-6xl font-bold text-white shadow-md"
              style={{ backgroundColor: "var(--site-secondary)" }}
            >
              {(principalName || title).charAt(0)}
            </div>
          )}

          {principalName ? (
            <div className="mt-4">
              <p className="text-sm font-semibold" style={{ color: "var(--site-primary)" }}>
                {principalName}
              </p>
              {principalDesignation ? (
                <p className="text-xs uppercase tracking-wide opacity-60">
                  {principalDesignation}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div>
          <SectionHeading title={title} />

          <div className="mt-8 space-y-6">
            {principalMessage ? (
              <p
                className="border-l-4 pl-4 text-base italic leading-relaxed opacity-85"
                style={{ borderLeftColor: "var(--site-accent)" }}
              >
                “{principalMessage}”
              </p>
            ) : null}

            {history ? (
              <p className="leading-relaxed opacity-85">{history}</p>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { label: "Mission", body: mission },
                { label: "Vision", body: vision },
              ]
                .filter((item) => item.body)
                .map((item) => (
                  <div key={item.label}>
                    <h3
                      className="text-xs font-bold uppercase tracking-[0.15em]"
                      style={{ color: "var(--site-secondary)" }}
                    >
                      {item.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed opacity-85">
                      {item.body}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
