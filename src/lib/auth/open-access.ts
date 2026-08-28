import { prisma } from "@/lib/db";

/**
 * Open-access mode: no sign-in, every visitor lands straight in the editor.
 */
export const AUTH_DISABLED = process.env.AUTH_DISABLED === "true";

const SUBDOMAIN = process.env.OPEN_ACCESS_SUBDOMAIN || "greenfield";
const NAME = process.env.OPEN_ACCESS_COLLEGE_NAME || "Greenfield University";

export async function openAccessCollege(targetSubdomain?: string) {
  const sub = targetSubdomain || SUBDOMAIN;

  try {
    const exact = await prisma.college.findUnique({
      where: { subdomain: sub },
    });
    if (exact) return exact;

    const existing = await prisma.college.findFirst({
      where: { isDemo: false, templateId: { not: null } },
      orderBy: { createdAt: "asc" },
    });
    if (existing) return existing;

    const fallback = await prisma.college.findFirst({
      where: { isDemo: false },
      orderBy: { createdAt: "asc" },
    });
    if (fallback) return fallback;

    return await prisma.college.upsert({
      where: { subdomain: sub },
      update: {},
      create: { name: NAME, subdomain: sub, status: "DRAFT" },
    });
  } catch (cause) {
    /**
     * A database that cannot be reached is not a college.
     *
     * This used to return a hand-built object — a made-up id, a
     * `templateId` of `"reference-university-v1"` and a `themePaletteId` of
     * `"classic-navy"` — so that "the Visual Live Editor loads seamlessly".
     * It loaded, and everything it did afterwards was against a tenant that
     * does not exist: every save 404s or writes somewhere unintended, and the
     * theme id is not one of the four `EDITOR_THEMES` ships, so the studio
     * rendered it as no theme at all. A builder that appears to work and
     * silently discards the work is worse than one that says it is down.
     *
     * Null, so `getCurrentCollege` falls through to "not signed in" and the
     * caller's own guard decides — which for every editor route is the login
     * screen, and for the two auth screens is rendering normally.
     */
    console.error(
      "[auth] open-access lookup failed — no college to serve:",
      cause instanceof Error ? cause.message : cause,
    );
    return null;
  }
}
