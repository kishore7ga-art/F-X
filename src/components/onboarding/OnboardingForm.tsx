"use client";

import { useActionState } from "react";

import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { COLLEGE_TYPES } from "@/lib/college-types";

/**
 * Two questions, because two is what the next screen needs to act without
 * asking again: the name that goes on the site, and the type that picks the
 * template.
 *
 * The type is radio inputs styled as cards rather than a <select> — five
 * options with a line of context each read better open than collapsed, and it
 * keeps the whole form usable without JavaScript.
 */
export function OnboardingForm({
  defaultName,
  defaultType = null,
  submitLabel = "Continue",
}: {
  defaultName: string;
  /** Preselected when the college has answered before and is changing it. */
  defaultType?: string | null;
  submitLabel?: string;
}) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    {},
  );

  return (
    <form action={action} className="space-y-8">
      <div>
        <label
          htmlFor="collegeName"
          className="block text-sm font-semibold text-brand-ink"
        >
          What is your college called?
        </label>
        <p className="mt-1 text-sm text-brand-ink/50">
          This becomes the name on your site, and your web address.
        </p>
        <input
          id="collegeName"
          name="collegeName"
          required
          maxLength={120}
          defaultValue={defaultName}
          placeholder="Greenfield Institute of Technology"
          autoComplete="organization"
          className="mt-3 w-full rounded-xl border border-brand-ink/15 px-4 py-3 text-base outline-none transition focus:border-brand-ink"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-brand-ink">
          What kind of institution is it?
        </legend>
        <p className="mt-1 text-sm text-brand-ink/50">
          We use this to pick a starting design. You can change it later.
        </p>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {COLLEGE_TYPES.map((type, index) => (
            <label
              key={type.value}
              className="group flex cursor-pointer items-start gap-3 rounded-xl border border-brand-ink/15 p-4 transition hover:border-brand-ink/40 has-[:checked]:border-brand-ink has-[:checked]:bg-brand-mist"
            >
              <input
                type="radio"
                name="collegeType"
                value={type.value}
                // Falls back to the first option only when nothing was chosen
                // before, so revisiting shows the real answer rather than a
                // default that looks like one.
                defaultChecked={
                  defaultType ? type.value === defaultType : index === 0
                }
                required
                className="mt-0.5 h-4 w-4 accent-brand-ink"
              />
              <span>
                <span className="block text-sm font-semibold text-brand-ink">
                  {type.label}
                </span>
                <span className="mt-0.5 block text-xs text-brand-ink/50">
                  {type.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error ? (
        <p className="text-sm font-medium text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-ink px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
