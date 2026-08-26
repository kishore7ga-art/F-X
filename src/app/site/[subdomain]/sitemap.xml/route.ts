import { tenantSitemapXml } from "@/lib/seo-routes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * A tenant's sitemap, at their site's own root.
 *
 * A static segment, so it wins over the `[...path]` catch-all beside it — which
 * would otherwise look for a *page* slugged `/sitemap.xml`, find none, and 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subdomain: string }> },
) {
  const { subdomain } = await params;
  return tenantSitemapXml(subdomain);
}
