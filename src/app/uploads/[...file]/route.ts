import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { NextResponse } from "next/server";

import { UPLOAD_DIR } from "@/lib/uploads";

/**
 * Serves an uploaded image.
 *
 * `public/` is not enough. Next resolves that directory from a manifest fixed
 * at build time, so a file written after the build — which is every upload —
 * is served in `next dev` and 404s under `next start`. The upload itself
 * succeeds, the URL is stored, and the image simply never appears: a failure
 * that shows up only in production and never says anything.
 *
 * Reading from disk per request costs a stat and a stream, which is what a
 * static handler does anyway.
 */
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string[] }> },
) {
  const { file } = await params;

  // Resolve, then prove the result is still inside the upload directory. A
  // segment like ".." would otherwise read anything the process can.
  const target = path.resolve(UPLOAD_DIR, ...file);
  const root = path.resolve(UPLOAD_DIR);
  if (target !== root && !target.startsWith(root + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(target).toLowerCase()];
  if (!contentType) return new NextResponse("Not found", { status: 404 });

  let size: number;
  try {
    const info = await stat(target);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });
    size = info.size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const stream = Readable.toWeb(
    createReadStream(target),
  ) as unknown as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(size),
      // Filenames are UUIDs assigned at upload, so a given URL's bytes never
      // change and this can be cached hard — by the browser and by any CDN in
      // front of it.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
