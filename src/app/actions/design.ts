"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { serverApiPost } from "@/lib/api/server";

/**
 * Choosing a design, as calls to the API.
 *
 * Provisioning a site used to run here: reading the template, writing the three
 * theme keys onto the college, creating four pages and a section per template
 * slot — all against this service's own database connection, for something the
 * API owns.
 *
 * What stays is what belongs on this side: the redirect afterwards, and telling
 * Next.js which rendered pages the change just invalidated.
 */

export type StartWithDesignInput = {
  templateId: string;
  paletteId: string;
  fontId: string;
};

/**
 * Screen 2's "Start with this design": saves the chosen template and theme,
 * provisions starter sections if the college has none, then opens the editor.
 *
 * Existing content is never touched — re-picking a theme only rewrites three
 * foreign keys.
 */
export async function startWithThisDesign(input: StartWithDesignInput) {
  const { next } = await serverApiPost<{ subdomain: string; next: string }>(
    "/api/v1/design",
    input,
  );
  redirect(next);
}

/**
 * Template-level refresh: the whole site's look, not one section's.
 *
 * The backend keeps every word the college has written — content is stored
 * keyed by section type rather than by template, so re-pointing the ids carries
 * the text across — and hides rather than deletes a section type the new
 * template lacks, so it returns on the next cycle.
 *
 * The three paths revalidated here are the three that render those sections, and
 * they are this side's business: only Next.js knows what it has cached.
 * `changed: false` means there was nothing to cycle to, which is not an error —
 * the button is disabled for the same reason.
 */
export async function cycleTemplate() {
  const { subdomain, changed } = await serverApiPost<{
    subdomain: string;
    changed: boolean;
  }>("/api/v1/design/cycle");

  if (!changed) return;

  revalidatePath(`/editor/${subdomain}`);
  revalidatePath(`/site/${subdomain}`);
  revalidatePath(`/preview/${subdomain}`);
}
