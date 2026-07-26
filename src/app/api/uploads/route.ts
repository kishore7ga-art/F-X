import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { UPLOAD_DIR, uploadUrl } from "@/lib/uploads";

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/gif": ".gif",
};

/**
 * Section image upload. Writes to `public/uploads` for the MVP; the spec's
 * production target is an S3-compatible bucket, which becomes a swap of this
 * one handler.
 */
export async function POST(request: Request) {
  // Uploads are for signed-in colleges only — this endpoint writes to disk.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const extension = ALLOWED[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPG, PNG, WEBP, GIF or SVG." },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is larger than 5 MB." },
      { status: 413 },
    );
  }

  // Filename comes from us, never from the client — no path traversal.
  const filename = `${randomUUID()}${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    path.join(UPLOAD_DIR, filename),
    Buffer.from(await file.arrayBuffer()),
  );

  return NextResponse.json({ url: uploadUrl(filename) });
}
