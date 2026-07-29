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
    <form action={action} className="space-y-7">
      <div>
        <label
          htmlFor="collegeName"
          className="block text-sm font-bold text-slate-900"
        >
          What is your college called?
        </label>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
          This becomes the name on your site, and your web address.
        </p>
        <input
          id="collegeName"
          name="collegeName"
          required
          maxLength={120}
          defaultValue={defaultName}
          placeholder="e.g. Crescent Institute of Technology"
          autoComplete="organization"
          className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 shadow-sm"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-bold text-slate-900">
          What kind of institution is it?
        </legend>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
          We use this to pick a starting design. You can change it later.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {COLLEGE_TYPES.map((type, index) => (
            <label
              key={type.value}
              className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50 has-[:checked]:ring-1 has-[:checked]:ring-slate-900"
            >
              <input
                type="radio"
                name="collegeType"
                value={type.value}
                defaultChecked={
                  defaultType ? type.value === defaultType : index === 0
                }
                required
                className="mt-0.5 h-4 w-4 accent-slate-900"
              />
              <span>
                <span className="block text-sm font-bold text-slate-900">
                  {type.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 leading-snug">
                  {type.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error ? (
        <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.99] disabled:opacity-50 mt-2"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
