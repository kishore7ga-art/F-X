import { normalizeSections, pickSections, type SectionItem } from "@/lib/site-sections";

import { serverApi } from "./api/server";

/**
 * A published site's sections, fetched during the server render.
 *
 * The browser used to do this on mount, which meant the HTML a visitor received
 * was a spinner and the college's own site arrived a round trip later — a visible
 * flash on every load, and nothing but a spinner for anything that reads the page
 * without running scripts.
 *
 * It tries the same three sources, in the same order, as the browser does: the
 * public endpoint, the editor endpoint, then the platform default. An empty array
 * is a real answer here — it means "the client should try" — and the viewer
 * carries on with its own fetch and its localStorage fallback, so a backend that
 * is briefly unreachable at render time costs a flash rather than a blank site.
 */
export async function loadSiteSections(subdomain: string): Promise<SectionItem[]> {
  const paths = [
    `/api/v1/public/site/${encodeURIComponent(subdomain)}`,
    `/api/v1/editor/${encodeURIComponent(subdomain)}`,
    "/api/v1/default-website",
  ];

  for (const path of paths) {
    try {
      const data = await serverApi<unknown>(path);
      if (!data) continue;
      const sections = pickSections(data);
      if (sections.length > 0) return normalizeSections(sections);
    } catch {
      // Unreachable or erroring backend: fall through to the next source, and to
      // the client if none of them answer.
    }
  }

  return [];
}
