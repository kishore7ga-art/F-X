"use client";

import { useActionState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { COLLEGE_TYPES } from "@/lib/college-types";

const TYPE_ICONS: Record<string, string> = {
  engineering: "⚙️",
  arts_science: "🎨",
  medical: "🏥",
  management: "📊",
  law: "⚖️",
};

export function OnboardingForm({
  defaultName,
  defaultType = null,
  submitLabel = "Continue",
}: {
  defaultName: string;
  defaultType?: string | null;
  submitLabel?: string;
}) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    {}
  );

  return (
    <form action={action} className="space-y-7">
      {state?.error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-200 shadow-xs">
          {state.error}
        </div>
      )}

      {/* College Name Input (Visible if empty/unconfigured, Hidden if already provided) */}
      {!defaultName ? (
        <div className="space-y-1.5">
          <label
            htmlFor="collegeName"
            className="block text-xs font-extrabold uppercase tracking-wider text-slate-700"
          >
            College / Institution Name
          </label>
          <input
            type="text"
            id="collegeName"
            name="collegeName"
            required
            defaultValue=""
            placeholder="e.g. Kishore7ga Institute of Technology & Science"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#4285F4] focus:ring-4 focus:ring-[#4285F4]/10 shadow-xs"
          />
        </div>
      ) : (
        <input type="hidden" name="collegeName" value={defaultName} />
      )}

      {/* Institution Type Selection */}
      <fieldset className="space-y-2">
        <legend className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
          Select Institution Category
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {COLLEGE_TYPES.map((type, index) => (
            <label
              key={type.value}
              className="group relative flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-all hover:border-slate-300 hover:shadow-sm has-[:checked]:border-[#4285F4] has-[:checked]:bg-[#4285F4]/[0.04] has-[:checked]:shadow-sm has-[:checked]:shadow-[#4285F4]/10 cursor-pointer"
            >
              <input
                type="radio"
                name="collegeType"
                value={type.value}
                defaultChecked={
                  defaultType ? type.value === defaultType : index === 0
                }
                required
                className="sr-only"
              />

              {/* Icon */}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg group-has-[:checked]:bg-[#4285F4]/10 transition-colors">
                {TYPE_ICONS[type.value] ?? "🏫"}
              </span>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900 group-has-[:checked]:text-[#4285F4] transition-colors">
                  {type.label}
                </p>
                <p className="text-[11px] font-medium text-slate-500 truncate">
                  {type.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-extrabold text-white transition-all hover:bg-slate-800 hover:shadow-lg disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <span>Setting up portal...</span>
        ) : (
          <>
            <span>{submitLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
