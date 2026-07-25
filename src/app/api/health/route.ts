import { NextResponse } from "next/server";

import { databaseErrorCode } from "@/lib/db-errors";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Operational health check: `GET /api/health`.
 *
 * Exists so a failing deployment can be diagnosed from outside the server,
 * without shell access or reading container logs. Returns 503 when the
 * database is unreachable so uptime monitors notice.
 *
 * Deliberately reports only an error *code*, never the driver message — those
 * contain the database host and would leak internal topology to the public.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    const code = databaseErrorCode(error);
    console.error(`[health] database unreachable (${code})`);

    return NextResponse.json(
      {
        status: "degraded",
        database: "unreachable",
        code,
        hint:
          code === "P1000"
            ? "Credentials rejected — check the username/password in DATABASE_URL."
            : "Check DATABASE_URL, and that the database service is running and reachable from this container.",
        databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      },
      { status: 503 },
    );
  }
}
