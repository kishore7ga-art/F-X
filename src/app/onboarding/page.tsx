import { Sparkles } from "lucide-react";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Set up your college — XITE" };

export default async function OnboardingPage() {
  const college = await requireCurrentCollege();
  const isEditing = Boolean(college.collegeType);

  const defaultName = college.name === "My College" ? "" : college.name;

  return (
    <main className="min-h-screen w-full flex overflow-hidden font-sans text-slate-900 bg-white">
      <div className="w-full min-h-screen flex flex-col lg:flex-row">

        {/* ─── LEFT 40% PANEL: SHOWCASE ─── */}
        <div className="hidden lg:flex lg:w-[40%] min-h-screen bg-[#F3F4F6] px-8 lg:px-12 py-5 flex-col justify-between relative overflow-hidden">
          {/* Geometric Background Contour Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full" viewBox="0 0 600 600" fill="none">
              <circle cx="100" cy="150" r="320" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="100" cy="150" r="220" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="500" cy="500" r="350" stroke="#CBD5E1" strokeWidth="1" />
            </svg>
          </div>

          <div />

          {/* Testimonial Quote Block */}
          <div className="relative z-10 max-w-lg my-auto">
            <img
              src="/user_avatar.jpg"
              alt="Ilaya Bharathi Profile Picture"
              className="mb-8 h-16 w-16 rounded-full object-cover shadow-md border-2 border-white ring-4 ring-indigo-500/20"
            />

            <blockquote className="text-xl lg:text-2xl font-medium text-slate-800 leading-relaxed tracking-tight">
              &ldquo;Setting up our college portal took just two minutes. We picked our type, named our institution, and the site was ready — beautifully designed from the start.&rdquo;
            </blockquote>

            {/* Author Name & Role */}
            <div className="mt-8">
              <p className="text-base font-extrabold text-slate-900">Ilaya Bharathi</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500">Director &amp; Founder / Madras Engineering College</p>
            </div>

            {/* Pagination Dots */}
            <div className="mt-10 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-slate-900" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            </div>
          </div>

          <div />
        </div>

        {/* ─── RIGHT 60% PANEL: ONBOARDING FORM ─── */}
        <div className="w-full lg:w-[60%] min-h-screen bg-white px-6 sm:px-10 lg:px-16 py-5 flex flex-col justify-between z-10 overflow-y-auto">

          {/* Header Bar */}
          <div className="flex h-11 items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs shrink-0">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <span className="font-black text-2xl tracking-tight text-slate-900 leading-none">
                XITE
              </span>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-6 rounded-full bg-[#4285F4]" />
                <span className="h-1.5 w-6 rounded-full bg-[#4285F4]" />
                <span className="h-1.5 w-6 rounded-full bg-slate-200" />
              </div>
              <span className="text-xs font-medium text-slate-400 ml-2">2 / 3</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="mx-auto w-full max-w-lg my-auto py-6 sm:py-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {isEditing ? "Change your details" : "Tell us about your college"}
            </h1>

            <p className="mt-2.5 text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
              {isEditing
                ? "Your site keeps everything you have written — only the name and type change."
                : "Two quick questions, then you can start building your site."}
            </p>

            <div className="mt-8">
              <OnboardingForm
                defaultName={defaultName}
                defaultType={college.collegeType}
                submitLabel={isEditing ? "Save changes" : "Continue"}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-4">
            <span>&copy; 2026 XITE</span>
            <div className="flex items-center gap-1 hover:text-slate-800">
              <span>Step 2 of 3</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
