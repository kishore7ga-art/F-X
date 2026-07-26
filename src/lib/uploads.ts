import path from "node:path";

/**
 * Where uploaded images live on disk.
 *
 * Still under `public/` because docker-compose mounts a volume there, so the
 * files survive redeploys. They are *not* served by Next's static handler
 * though — see src/app/uploads/[...file]/route.ts for why that silently fails
 * in production.
 */
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Public URL for a stored filename, matching the route that serves it. */
export const uploadUrl = (filename: string) => `/uploads/${filename}`;
