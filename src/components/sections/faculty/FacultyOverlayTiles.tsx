import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { FacultyContent } from "@/lib/sections/schemas";

/** Faculty variant: full-bleed photo tiles with the name band laid over the
 * bottom of each image. */
export function FacultyOverlayTiles({ content }: { content: FacultyContent }) {
  const { title, subtitle, members } = content;

  return (
    <SectionShell background="dark">
      <SectionHeading title={title} subtitle={subtitle} tone="onDark" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, index) => (
          <article
            key={`${member.name}-${index}`}
            className="relative isolate overflow-hidden rounded-lg"
          >
            {member.photoUrl ? (
              <SiteImage
                src={member.photoUrl}
                alt={member.name}
                className="h-64 w-full object-cover"
              />
            ) : (
              <div
                className="flex h-64 w-full items-center justify-center text-4xl font-bold text-white"
                style={{ backgroundColor: "var(--site-secondary)" }}
              >
                {member.name.charAt(0)}
              </div>
            )}

            {/* Tall, mostly-opaque scrim: portraits are light at the bottom,
                so a short gradient leaves the name unreadable. */}
            <div
              className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-16"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in srgb, var(--site-dark) 97%, transparent) 0%, color-mix(in srgb, var(--site-dark) 85%, transparent) 55%, transparent 100%)",
              }}
            >
              <h3 className="font-[family-name:var(--site-heading-font)] text-sm font-bold text-white">
                {member.name}
              </h3>
              {member.designation ? (
                <p className="text-xs text-white/75">{member.designation}</p>
              ) : null}
              {member.department ? (
                <p
                  className="mt-1 text-[11px] uppercase tracking-wide"
                  style={{ color: "var(--site-accent)" }}
                >
                  {member.department}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
