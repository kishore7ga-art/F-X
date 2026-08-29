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

/** Mock /api/v1/default-website — no default pages needed for local UI preview. */
export async function GET() {
  return NextResponse.json({ pages: [] });
}
