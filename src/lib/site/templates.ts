import { serverApi } from "@/lib/api/server";

/**
 * The design gallery, from the backend.
 *
 * Three pages queried `template` directly and each shaped the result its own
 * way — the marketing grid, the signed-in gallery and the template detail
 * screen. One read here, one endpoint behind it.
 */

export type TemplateSummary = {
  id: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  demoUrl: string | null;
  sectionCount: number;
};

export type ThemePaletteOption = {
  id: string;
  name: string;
  colors: unknown;
};

export type ThemeFontOption = {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
};

export async function listTemplates(): Promise<TemplateSummary[]> {
  const payload = await serverApi<{ templates: TemplateSummary[] }>(
    "/api/v1/templates",
  );
  return payload?.templates ?? [];
}

/**
 * The gallery for the marketing page, which must never be the reason that page
 * fails.
 *
 * Someone arriving to read what the product is should not meet a 500 because
 * the database is restarting. An empty grid is a worse page; a broken one is no
 * page. This is the one caller that swallows the failure, and it says so.
 */
export async function listTemplatesForLanding(): Promise<TemplateSummary[]> {
  try {
    return await listTemplates();
  } catch (error) {
    console.error(
      "[landing] could not load templates:",
      (error as Error).message,
    );
    return [];
  }
}

export async function getTemplateDetail(templateId: string): Promise<{
  template: TemplateSummary;
  palettes: ThemePaletteOption[];
  fonts: ThemeFontOption[];
} | null> {
  return serverApi(`/api/v1/templates/${encodeURIComponent(templateId)}`);
}
