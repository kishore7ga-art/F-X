"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { serverApiPost, ServerApiError } from "@/lib/api/server";
import { collegeTypeSchema } from "@/lib/college-types";

export type OnboardingState = { error?: string };

/**
 * Onboarding, as calls to the API.
 *
 * Every one of these wrote to Postgres from this service, over a second copy of
 * the same credential. That is exactly the path that told people "The service is
 * temporarily unavailable" and refused to advance past step 2 — while the API
 * was healthy the whole time, holding the very data being asked for.
 *
 * The actions remain actions. They are form submissions that end in a redirect,
 * they work without client JavaScript, and the browser posting to its own origin
 * is the correct shape for that. What changed is where the writing happens.
 */

const onboardingSchema = z.object({
  collegeName: z.string().trim().min(2, "Enter your college name").max(120),
  collegeType: collegeTypeSchema,
});

/**
 * Validated on both sides, on purpose.
 *
 * The backend's check is the one that counts — it is the only one an attacker
 * cannot skip. This one exists so a typo comes back as a message under the
 * field instead of a round trip, and so the two error shapes an action can
 * produce stay distinguishable.
 */
export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const parsed = onboardingSchema.safeParse({
    collegeName: formData.get("collegeName"),
    collegeType: formData.get("collegeType"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  let next: string;
  try {
    ({ next } = await serverApiPost<{ subdomain: string; next: string }>(
      "/api/v1/onboarding",
      parsed.data,
    ));
  } catch (cause) {
    if (cause instanceof ServerApiError) {
      // The backend's own message when it rejected the input; its generic one
      // when something broke. Either way the form says something true.
      return { error: cause.message };
    }
    throw cause;
  }

  // Outside the try: redirect() signals by throwing, and catching it here would
  // turn a successful save into an error message.
  redirect(next);
}

/**
 * "Build Site": the backend picks the template from the type given at
 * onboarding, takes the theme from that template's demo college, and
 * provisions the starter pages and sections.
 *
 * No arguments and no body — the college comes from the session, which is the
 * only place a tenant should ever come from.
 */
export async function buildSiteForType() {
  const { next } = await serverApiPost<{ subdomain: string; next: string }>(
    "/api/v1/onboarding/build",
  );
  redirect(next);
}
