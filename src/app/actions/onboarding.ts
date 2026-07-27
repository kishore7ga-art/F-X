"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { startWithThisDesign } from "@/app/actions/design";
import { getSession } from "@/lib/auth/session";
import {
  collegeTypeSchema,
  subdomainFromName,
  templateNameFor,
} from "@/lib/college-types";
import { prisma } from "@/lib/db";
import { isDatabaseUnavailable, DATABASE_UNAVAILABLE_MESSAGE } from "@/lib/db-errors";

export type OnboardingState = { error?: string };

const onboardingSchema = z.object({
  collegeName: z.string().trim().min(2, "Enter your college name").max(120),
  collegeType: collegeTypeSchema,
});

/** Subdomains the platform needs for itself. */
const RESERVED = new Set([
  "www",
  "api",
  "admin",
  "app",
  "editor",
  "site",
  "preview",
  "templates",
  "login",
  "signup",
  "start",
  "onboarding",
  "uploads",
]);

/**
 * A free subdomain derived from the college's name.
 *
 * Onboarding asks for two things and a URL has to come from somewhere.
 * Uniqueness is settled here rather than in the slug helper, because only a
 * query knows what is already taken.
 */
async function availableSubdomain(name: string): Promise<string> {
  const base = subdomainFromName(name);

  for (let suffix = 0; suffix < 50; suffix++) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    if (RESERVED.has(candidate)) continue;
    const taken = await prisma.college.findUnique({
      where: { subdomain: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }

  // Fifty collisions on one name is not a real college naming its site; it is
  // something looping. A timestamped slug ends it rather than spinning.
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Records what onboarding asked for.
 *
 * In open-access mode a college already exists — the session resolves one on
 * first touch — so this updates that row rather than creating a second. A user
 * who has just told us their college's name should not end up with two.
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

  const session = await getSession();
  if (!session) return { error: "Not signed in" };

  try {
    const college = await prisma.college.findUnique({
      where: { id: session.collegeId },
      select: { id: true, subdomain: true, _count: { select: { sections: true } } },
    });
    if (!college) return { error: "College not found" };

    // The URL is only rewritten while nothing is built on it. Once a site has
    // sections, its address is in the editor URL, the public URL and possibly
    // somebody's bookmarks — renaming it then breaks all three to gain nothing.
    const subdomain =
      college._count.sections === 0
        ? await availableSubdomain(parsed.data.collegeName)
        : college.subdomain;

    await prisma.college.update({
      where: { id: college.id },
      data: {
        name: parsed.data.collegeName,
        collegeType: parsed.data.collegeType,
        subdomain,
      },
    });
  } catch (cause) {
    if (isDatabaseUnavailable(cause)) {
      console.error("[onboarding] database unavailable");
      return { error: DATABASE_UNAVAILABLE_MESSAGE };
    }
    throw cause;
  }

  redirect("/start");
}

/**
 * "Build Site": picks the template for this college's type and opens the
 * editor on it.
 *
 * Deliberately not random. The type was asked for precisely so this choice can
 * be made without asking again, and a college that answers "Medical" twice
 * should not get two different sites.
 *
 * The theme comes from that template's demo college, so the site opens looking
 * like the demo the gallery advertises rather than defaulting to whatever
 * palette happens to sort first.
 */
export async function buildSiteForType() {
  const session = await getSession();
  if (!session) redirect("/login");

  const college = await prisma.college.findUnique({
    where: { id: session.collegeId },
    select: { id: true, collegeType: true },
  });
  if (!college) redirect("/onboarding");
  if (!college.collegeType) redirect("/onboarding");

  const templateName = templateNameFor(college.collegeType);

  const template = await prisma.template.findUnique({
    where: { name: templateName },
    select: { id: true },
  });
  if (!template) {
    throw new Error(
      `Template "${templateName}" is not seeded — run the seed before building a site.`,
    );
  }

  const demo = await prisma.college.findFirst({
    where: { isDemo: true, templateId: template.id },
    select: { themePaletteId: true, themeFontId: true },
  });

  const [palette, font] = await Promise.all([
    demo?.themePaletteId
      ? Promise.resolve({ id: demo.themePaletteId })
      : prisma.themePalette.findFirst({ orderBy: { name: "asc" }, select: { id: true } }),
    demo?.themeFontId
      ? Promise.resolve({ id: demo.themeFontId })
      : prisma.themeFont.findFirst({ orderBy: { name: "asc" }, select: { id: true } }),
  ]);

  if (!palette || !font) {
    throw new Error("No theme palettes or font packs configured");
  }

  // Reuses the existing path rather than a second copy of it: same template
  // assignment, same starter provisioning, same redirect into the editor. Both
  // entry points hand off to the identical code.
  await startWithThisDesign({
    templateId: template.id,
    paletteId: palette.id,
    fontId: font.id,
  });
}
