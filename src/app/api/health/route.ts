import { NextResponse } from "next/server";

import {
  classifyDatabaseError,
  DATABASE_FAILURE_HINTS,
  type DatabaseFailureKind,
} from "@/lib/db-errors";
import {
  parseDatabaseHost,
  parseDatabaseIdentity,
  probeDatabaseSocket,
} from "@/lib/db-probe";
import { AUTH_DISABLED } from "@/lib/auth/open-access";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Can this service reach the backend?
 *
 * Reported rather than assumed. "Are the two talking?" has been guesswork all
 * day, answerable only by reading container logs — and a 502 from the browser
 * says nothing about whether the frontend can see the API privately, which is
 * a different question with a different fix.
 *
 * Unset means not split: this deployment serves its own /api/v1 and there is
 * no second service to reach.
 */
function transportCode(error: unknown): string {
  const cause = (error as { cause?: { code?: string } } | null)?.cause;
  if (cause?.code) return cause.code;
  const name = (error as Error | null)?.name;
  return name && name !== "TypeError" ? name : "unreachable";
}

async function backendStatus() {
  const base = (
    process.env.BACKEND_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    ""
  ).replace(/\/$/, "");

  if (!base) return { configured: false as const };

  const startedAt = Date.now();
  try {
    // Short deadline: this is a health probe, not a request anyone is waiting
    // on. A backend that takes three seconds to answer is already the finding.
    const response = await fetch(`${base}/api/health`, {
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    return {
      configured: true as const,
      url: base,
      reachable: response.ok,
      status: response.status,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      configured: true as const,
      url: base,
      reachable: false,
      // fetch wraps every transport failure as a bare TypeError, which says
      // nothing — the syscall underneath is the whole diagnosis. ENOTFOUND is
      // the wrong hostname, ECONNREFUSED the wrong port, TimeoutError an
      // unroutable network, and those need three different fixes.
      error: transportCode(error),
    };
  }
}

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

    // Seeding is deliberately non-fatal, so "connected" on its own can still
    // mean a site nobody can build: a reachable database with no templates to
    // pick. Counting them here is the difference between diagnosing that from
    // a browser and needing container logs. Guarded separately so a missing
    // table reads as 0 rather than being misclassified as a connection fault.
    let templates: number | null = null;
    try {
      templates = await prisma.template.count();
    } catch {
      templates = null;
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      host,
      auth: AUTH_DISABLED ? "open" : "required",
      templates,
      backend: await backendStatus(),
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
        // Only on the failure branch, and only when the credentials are what
        // was rejected: enough to compare two services side by side, never the
        // password.
        ...(kind === "auth"
          ? { attemptedAs: parseDatabaseIdentity(process.env.DATABASE_URL) }
          : {}),
        auth: AUTH_DISABLED ? "open" : "required",
        // Reported on this branch too. A database outage is exactly when you
        // need to know whether the two services can still see each other —
        // omitting it here meant the field vanished the moment it mattered.
        backend: await backendStatus(),
        hint: DATABASE_FAILURE_HINTS[kind],
        databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      },
      { status: 503 },
    );
  }
}
