import { NextResponse } from "next/server";

import {
  classifyDatabaseError,
  DATABASE_FAILURE_HINTS,
  type DatabaseFailureKind,
} from "@/lib/db-errors";
import { parseDatabaseHost, probeDatabaseSocket } from "@/lib/db-probe";
import { AUTH_DISABLED } from "@/lib/auth/open-access";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Operational health check: `GET /api/health`.
 *
 * Exists so a failing deployment can be diagnosed from a browser, without
 * shell access or reading container logs. Returns 503 when the database is
 * unreachable so uptime monitors notice.
 *
 * Reports the host and a classified reason — never credentials, never the raw
 * driver message.
 *
 * `auth` is here for a narrower reason: "is my change live yet?" is otherwise
 * unanswerable from outside. A deploy that silently reused a cached image looks
 * exactly like one where the environment variable never saved, and both look
 * like the feature not working. Absent field means old code, "required" means
 * the flag is unset, "open" means it took.
 */
export async function GET() {
  const startedAt = Date.now();
  const target = parseDatabaseHost(process.env.DATABASE_URL);
  const host = target ? `${target.host}:${target.port}` : null;

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return NextResponse.json({
      status: "ok",
      database: "connected",
      host,
      auth: AUTH_DISABLED ? "open" : "required",
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    let { kind, code } = classifyDatabaseError(error);

    // Prisma reports every transport failure as the same P2010, so a bad
    // hostname and a dead port look identical. Probe the socket to tell them
    // apart — they need completely different fixes.
    if (target && kind !== "auth" && kind !== "missing-url") {
      const probe = await probeDatabaseSocket(target.host, target.port);
      if (!probe.reachable) {
        kind = probe.kind as DatabaseFailureKind;
        code = probe.detail ?? code;
      } else if (kind === "unknown") {
        // TCP is fine, so this is not a networking problem: wrong credentials,
        // wrong database name, or a TLS mismatch.
        kind = "auth";
      }
    }

    console.error(`[health] database unreachable: ${kind} (${code})`);

    return NextResponse.json(
      {
        status: "degraded",
        database: "unreachable",
        reason: kind,
        code,
        host,
        auth: AUTH_DISABLED ? "open" : "required",
        hint: DATABASE_FAILURE_HINTS[kind],
        databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      },
      { status: 503 },
    );
  }
}
