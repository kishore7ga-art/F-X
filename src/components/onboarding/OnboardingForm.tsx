"use client";

import { useActionState } from "react";

import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { COLLEGE_TYPES } from "@/lib/college-types";

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
    <form action={action} className="space-y-6">
      {/* College name passed as hidden field — already shown in heading */}
      <input type="hidden" name="collegeName" value={defaultName} />

      {/* Institution Type */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-900">
          What kind of institution is it?<span className="text-blue-600 ml-0.5">*</span>
        </legend>
        <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-slate-400 mb-3">
          We use this to pick a starting design. You can change it later.
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {COLLEGE_TYPES.map((type, index) => (
            <label
              key={type.value}
              className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-sm has-[:checked]:border-[#4285F4] has-[:checked]:bg-[#4285F4]/5 has-[:checked]:ring-1 has-[:checked]:ring-[#4285F4]/30"
            >
              <input
                type="radio"
                name="collegeType"
                value={type.value}
                defaultChecked={
                  defaultType ? type.value === defaultType : index === 0
                }
                required
                className="mt-0.5 h-4 w-4 accent-[#4285F4]"
              />
              <span>
                <span className="block text-xs sm:text-sm font-bold text-slate-900">
                  {type.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-400 leading-snug">
                  {type.hint}
                </span>
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
        className="mt-2 w-full rounded-xl bg-[#4285F4] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#4285F4]/20 transition hover:bg-[#3367D6] hover:shadow-lg hover:shadow-[#4285F4]/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
