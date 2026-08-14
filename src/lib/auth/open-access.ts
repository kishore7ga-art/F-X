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
  } catch {
    // If local Prisma database / DATABASE_URL is not configured on xite-F,
    // return a synthetic college object so the Visual Live Editor loads seamlessly!
    return {
      id: `open-access-${sub}`,
      name: sub === "greenfield" ? NAME : sub.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      subdomain: sub,
      customDomain: null,
      templateId: "reference-university-v1",
      themePaletteId: "classic-navy",
      themeFontId: "inter-roboto",
      collegeType: "Engineering",
      status: "DRAFT",
      isDemo: false,
      createdAt: new Date(),
    };
  }
}
