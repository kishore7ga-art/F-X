import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { SiteImage } from "@/components/site/SiteImage";
import type { AboutContent } from "@/lib/sections/schemas";

/** About variant: narrative + highlights on the left, full height campus/chancellor image on the right. */
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

  const displayTitle = title || "About Us";
  const displayHistory = history || "Founded in 1996, Kishore7ga Institute of Technology & Science (KITS) is a premier UGC autonomous institution with NAAC A++ accreditation (3.78 Score). Offering 18+ NBA accredited engineering, management, and doctoral programs, KITS is renowned for research innovation, world-class labs, and 100% career guidance.";
  const displayMission = mission || "To provide rigorous, industry-aligned technical education and foster groundbreaking research to address complex global challenges.";
  const displayVision = vision || "To be recognized as a world-class center of excellence in technical education, scientific research, and ethical leadership.";
  const displayPrincipalName = principalName || "Dr. K. S. Kishore";
  const displayPrincipalDesignation = principalDesignation || "FOUNDER & CHANCELLOR";
  const displayPrincipalMessage = principalMessage || "Our commitment is to cultivate critical thinking, technological mastery, and ethical values so our graduates shape the future of global innovation.";
  const photoSrc = principalPhotoUrl && !principalPhotoUrl.includes("svg") ? principalPhotoUrl : "/template-brightwood.jpg";

  return (
    <SectionShell background="light">
      <SectionHeading title={displayTitle} />

      <div className="mt-10 grid gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <p className="text-base leading-relaxed text-[var(--site-dark)] opacity-90 font-medium">
            {displayHistory}
          </p>

          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-[var(--site-card-border)] bg-[var(--site-card-bg)] p-5 shadow-xs">
              <h3 className="font-[family-name:var(--site-heading-font)] text-base font-extrabold text-blue-600">
                Our Mission
              </h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--site-dark)] opacity-80">
                {displayMission}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--site-card-border)] bg-[var(--site-card-bg)] p-5 shadow-xs">
              <h3 className="font-[family-name:var(--site-heading-font)] text-base font-extrabold text-amber-500">
                Our Vision
              </h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--site-dark)] opacity-80">
                {displayVision}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-[var(--site-card-border)] bg-[var(--site-card-bg)] shadow-xl">
          <SiteImage
            src={photoSrc}
            alt={displayPrincipalName}
            className="h-80 lg:h-[420px] w-full object-cover"
          />
          <div className="p-6 bg-[var(--site-card-bg)]">
            <p className="text-base font-extrabold text-[var(--site-dark)]">
              {displayPrincipalName}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mt-0.5">
              {displayPrincipalDesignation}
            </p>
            <p className="mt-3 text-xs italic opacity-85">
              &ldquo;{displayPrincipalMessage}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
