"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";

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
      {/* College Name */}
      <div>
        <label
          htmlFor="collegeName"
          className="block text-xs font-bold text-slate-900 mb-1.5"
        >
          What is your college called?<span className="text-blue-600 ml-0.5">*</span>
        </label>
        <p className="text-[11px] sm:text-xs font-medium text-slate-400 mb-2.5">
          This becomes the name on your site, and your web address.
        </p>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Building2 className="h-4 w-4" />
          </div>
          <input
            id="collegeName"
            name="collegeName"
            required
            maxLength={120}
            defaultValue={defaultName}
            placeholder="e.g. Madras Engineering College"
            autoComplete="organization"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
          />
        </div>
      </div>

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
