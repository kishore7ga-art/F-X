"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { subdomainFromName } from "@/lib/college-types";

export type PageSeoState = { error?: string; savedAt?: string };

/**
 * Empty means "not set", so blanking a field clears the override rather than
 * storing "". A stored empty string would render an empty <title>, which is
 * worse than no title at all.
 */
const blankToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const seoSchema = z.object({
  pageId: z.string().min(1),
  // Search engines truncate around these lengths; the limits keep someone from
  // writing a paragraph that will never be shown in full.
  metaTitle: z.preprocess(blankToNull, z.string().trim().max(70).nullable()),
  metaDescription: z.preprocess(
    blankToNull,
    z.string().trim().max(200).nullable(),
  ),
  ogImage: z.preprocess(blankToNull, z.string().trim().max(500).nullable()),
  canonicalSlug: z.preprocess(
    blankToNull,
    z
      .string()
      .trim()
      .max(60)
      .nullable()
      .refine(
        (value) => value === null || value === subdomainFromName(value),
        "Use lowercase letters, numbers and hyphens only",
      ),
  ),
});

/**
 * Saves one page's SEO fields.
 *
 * Scoped to the caller's college through the session, never from the request —
 * a page id is guessable, and this writes what search engines will read.
 */
export async function savePageSeo(
  _prev: PageSeoState,
  formData: FormData,
): Promise<PageSeoState> {
  const parsed = seoSchema.safeParse({
    pageId: formData.get("pageId"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    ogImage: formData.get("ogImage"),
    canonicalSlug: formData.get("canonicalSlug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields" };
  }

  const session = await getSession();
  if (!session) return { error: "Not signed in" };

  const { pageId, ...seo } = parsed.data;

  const page = await prisma.page.findFirst({
    where: { id: pageId, collegeId: session.collegeId },
    include: { college: { select: { subdomain: true } } },
  });
  if (!page) return { error: "Page not found for this college" };

  await prisma.page.update({ where: { id: page.id }, data: seo });

  // The public page renders these into <head>, so it has to be rebuilt.
  revalidatePath(`/site/${page.college.subdomain}`);
  revalidatePath(`/editor/${page.college.subdomain}`);

  return { savedAt: new Date().toISOString() };
}
