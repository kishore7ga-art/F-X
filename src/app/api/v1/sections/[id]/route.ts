import { NextResponse } from "next/server";

import {
  listSectionHistory,
  restoreSectionVersion,
  updateSectionContent,
} from "@/app/actions/sections";

/**
 * Versioned HTTP API for section content.
 *
 * The editor already had all of this as Server Actions, which work but are
 * invisible: an action posts an opaque RSC payload, so the Network tab shows
 * nothing readable and there is no endpoint another service could call.
 *
 * These handlers are the same logic behind a real URL. That makes every save
 * observable in devtools, and it is the seam a separate backend would be split
 * along — the frontend already talks to it over HTTP either way, so moving it
 * to another host later is a base-URL change rather than a rewrite.
 *
 * Auth is the session cookie, sent automatically same-origin. Tenant scoping
 * still happens inside the action, never from anything the caller sends.
 */
export const dynamic = "force-dynamic";

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed";
  // 404 for "not yours" as well as "not there": confirming a section exists but
  // belongs to someone else is itself a leak.
  const status = /not found|no longer exists/i.test(message)
    ? 404
    : /not signed in/i.test(message)
      ? 401
      : 400;
  return NextResponse.json({ error: message }, { status });
}

/** GET /api/v1/sections/:id/…  — the section's version timeline. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    return NextResponse.json({
      versions: await listSectionHistory({ collegeSectionId: id }),
    });
  } catch (error) {
    return fail(error);
  }
}

/** PATCH /api/v1/sections/:id — save content. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = (await request.json()) as {
      content?: unknown;
      trigger?: string;
    };
    const result = await updateSectionContent({
      collegeSectionId: id,
      content: body.content,
      trigger: (body.trigger ?? "typing") as never,
    });
    return NextResponse.json(result);
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/v1/sections/:id — restore a version. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = (await request.json()) as { versionId?: string };
    if (!body.versionId) {
      return NextResponse.json({ error: "versionId required" }, { status: 400 });
    }
    const result = await restoreSectionVersion({
      collegeSectionId: id,
      versionId: body.versionId,
    });
    return NextResponse.json(result);
  } catch (error) {
    return fail(error);
  }
}
