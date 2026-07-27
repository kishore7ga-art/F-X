import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Set up your college — XITE" };

/**
 * Asked once per college, not once per person: a second college needs its own
 * name and type, and there is no sensible answer to inherit from the first.
 *
 * A college that has already answered goes straight past.
 */
export default async function OnboardingPage() {
  const college = await requireCurrentCollege();
  if (college.collegeType) redirect("/start");

  // "My College" is the placeholder open-access assigns before anyone has been
  // asked. Offering it back as a prefilled answer would invite accepting it.
  const defaultName = college.name === "My College" ? "" : college.name;

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-xl px-5 py-16 sm:py-24">
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-ink/35">
          Step 2 of 3
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
          Tell us about your college
        </h1>
        <p className="mt-3 text-base text-brand-ink/55">
          Two questions, then you can start building.
        </p>

        <div className="mt-10">
          <OnboardingForm defaultName={defaultName} />
        </div>
      </div>
    </main>
  );
}
