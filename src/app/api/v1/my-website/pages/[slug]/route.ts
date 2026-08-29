/**
 * A PREVIEW MOCK. Unreachable unless `NEXT_PUBLIC_UI_PREVIEW=1`.
 *
 * This file is a route, and **a filesystem route beats the `/api/v1/*` rewrite
 * in `next.config.ts`** — so without a guard it would not fall back to the
 * backend, it would replace it, for every tenant. The guard cannot live in this
 * handler: the route would still exist, the rewrite would still never run, and
 * returning 404 when a flag is off breaks the endpoint rather than proxying it.
 *
 * It lives in `next.config.ts` instead, which is where the precedence is
 * decided: with the flag off, this path is rewritten to the backend in
 * `beforeFiles`, ahead of filesystem routes, and everything below becomes
 * unreachable code. Read the comment on `rewrites()` before changing either.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Mock PUT /api/v1/my-website/pages/[slug]
 *
 * The editor's save hook sends the full page and expects an EditorPage echoed
 * back. Returning the same body marks the page as saved (not dirty).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const { slug } = await params;
    // Echo back a well-formed EditorPage so the hook marks the save as clean
    return NextResponse.json({
      id: `page-${slug}`,
      slug: `/${slug}`,
      title: (body.title as string) ?? slug,
      sections: Array.isArray(body.sections) ? body.sections : [],
    });
  } catch {
    return NextResponse.json({ id: "page-error", slug: "/error", title: "Error", sections: [] });
  }
}

export async function DELETE() {
  return NextResponse.json({ ok: true });
}
