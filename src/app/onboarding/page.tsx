import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Set up your college — XITE" };

export default async function OnboardingPage() {
  const college = await requireCurrentCollege();
  const isEditing = Boolean(college.collegeType);

  const defaultName = college.name === "My College" ? "" : college.name;

  return (
    <main className="min-h-dvh bg-slate-50/50 flex flex-col justify-center py-16 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl shadow-slate-200/50">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
          Step 2 of 3
        </p>
        
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          {isEditing ? "Change your details" : "Tell us about your college"}
        </h1>
        
        <p className="mt-2.5 text-sm sm:text-base text-slate-500 leading-relaxed">
          {isEditing
            ? "Your site keeps everything you have written — only the name and type change."
            : "Two questions, then you can start building."}
        </p>

        <div className="mt-8">
          <OnboardingForm
            defaultName={defaultName}
            defaultType={college.collegeType}
            submitLabel={isEditing ? "Save changes" : "Continue"}
          />
        </div>
      </div>
    </main>
  );
}
