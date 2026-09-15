import { NextRequest, NextResponse } from "next/server";

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
export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const target = parseDatabaseHost(process.env.DATABASE_URL);
  const host = target ? `${target.host}:${target.port}` : null;
  const isHtml = request.headers.get("accept")?.includes("text/html");

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

    const backend = await backendStatus();
    const latencyMs = Date.now() - startedAt;

    if (isHtml) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>XITE — System Status</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; box-sizing: border-box; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; width: 100%; max-width: 480px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #34d399; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
    h1 { margin: 20px 0 8px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    p { margin: 0 0 24px; font-size: 14px; color: #a1a1aa; line-height: 1.5; }
    .metrics { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
    .metric-row { display: flex; justify-content: space-between; align-items: center; background: #09090b; border: 1px solid #27272a; border-radius: 10px; padding: 12px 16px; font-size: 13px; }
    .metric-label { color: #a1a1aa; font-weight: 500; }
    .metric-val { color: #f4f4f5; font-weight: 600; font-family: monospace; }
    .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 12px; background: #f4f4f5; color: #09090b; font-size: 14px; font-weight: 700; border-radius: 10px; text-decoration: none; transition: opacity 0.2s; box-sizing: border-box; }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="badge-dot"></span>
      All Systems Operational
    </div>
    <h1>System Status</h1>
    <p>Everything is running smoothly across database and API services.</p>
    <div class="metrics">
      <div class="metric-row"><span class="metric-label">Database</span><span class="metric-val">Connected</span></div>
      <div class="metric-row"><span class="metric-label">Backend API</span><span class="metric-val">${backend.reachable ? "Reachable (200 OK)" : "Offline"}</span></div>
      <div class="metric-row"><span class="metric-label">Response Time</span><span class="metric-val">${latencyMs}ms</span></div>
    </div>
    <a href="/" class="btn">← Return to XITE Home</a>
  </div>
</body>
</html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      host,
      auth: AUTH_DISABLED ? "open" : "required",
      templates,
      backend,
      latencyMs,
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
        /**
         * "unreachable" is only true when nothing answered.
         *
         * A rejected login means the database was reached, replied, and said
         * no — the opposite of unreachable, and calling it that sends people
         * hunting hostnames and Docker networks for a problem that is one
         * wrong word in a connection string. The reason field was already
         * right; the headline contradicted it.
         */
        database: kind === "auth" ? "rejected" : "unreachable",
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
