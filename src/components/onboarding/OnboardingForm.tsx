"use client";

import { useActionState } from "react";

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
      {/* College name passed as hidden field — already shown in heading */}
      <input type="hidden" name="collegeName" value={defaultName} />

      {/* Institution Type */}
      <fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          {COLLEGE_TYPES.map((type, index) => (
            <label
              key={type.value}
              className="group relative flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-all hover:border-slate-300 hover:shadow-sm has-[:checked]:border-[#4285F4] has-[:checked]:bg-[#4285F4]/[0.04] has-[:checked]:shadow-sm has-[:checked]:shadow-[#4285F4]/10"
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
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {type.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-400 leading-snug">
                  {type.hint}
                </span>
              </span>

              {/* Check indicator */}
              <span className="absolute top-3 right-3 hidden h-5 w-5 items-center justify-center rounded-full bg-[#4285F4] text-white group-has-[:checked]:flex">
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Error */}
      {state.error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
          {state.error}
        </div>
      ) : null}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#4285F4] py-3.5 px-4 text-sm font-semibold text-white shadow-md shadow-[#4285F4]/20 transition hover:bg-[#3367D6] hover:shadow-lg hover:shadow-[#4285F4]/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
