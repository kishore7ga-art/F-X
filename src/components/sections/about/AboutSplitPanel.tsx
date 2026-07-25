import { SiteImage } from "@/components/site/SiteImage";
import type { AboutContent } from "@/lib/sections/schemas";

/** About variant: dark mission/vision panel butted against a light history
 * panel — a full-bleed two-tone band with no outer padding. */
export function AboutSplitPanel({ content }: { content: AboutContent }) {
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
    <section className="grid md:grid-cols-2">
      <div
        className="px-6 py-14 sm:px-10 sm:py-16"
        style={{ backgroundColor: "var(--site-primary)" }}
      >
        <h2 className="font-[family-name:var(--site-heading-font)] text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h2>
        <div
          className="mt-4 h-1 w-14"
          style={{ backgroundColor: "var(--site-accent)" }}
        />

        <div className="mt-7 space-y-6">
          {[
            { label: "Mission", body: mission },
            { label: "Vision", body: vision },
          ]
            .filter((item) => item.body)
            .map((item) => (
              <div key={item.label}>
                <h3
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: "var(--site-accent)" }}
                >
                  {item.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                  {item.body}
                </p>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-[var(--site-light)] px-6 py-14 sm:px-10 sm:py-16">
        {history ? (
          <p className="leading-relaxed opacity-85">{history}</p>
        ) : null}

        {principalMessage || principalName ? (
          <div className="mt-8 border-t pt-6">
            {principalMessage ? (
              <p className="text-sm italic leading-relaxed opacity-80">
                “{principalMessage}”
              </p>
            ) : null}
            <div className="mt-4 flex items-center gap-3">
              {principalPhotoUrl ? (
                <SiteImage
                  src={principalPhotoUrl}
                  alt={principalName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : null}
              <span className="text-sm">
                <span
                  className="block font-semibold"
                  style={{ color: "var(--site-primary)" }}
                >
                  {principalName}
                </span>
                {principalDesignation ? (
                  <span className="block text-xs uppercase tracking-wide opacity-60">
                    {principalDesignation}
                  </span>
                ) : null}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
