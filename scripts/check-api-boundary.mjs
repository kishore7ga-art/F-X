/**
 * Fails the build when the frontend reaches past the API.
 *
 * The goal this defends: every piece of data on xite.co.in comes from
 * api.xite.co.in. Two ways that erodes, both of which have already happened
 * here — a file importing Prisma and querying Postgres itself, and a `fetch()`
 * to a URL typed inline instead of going through the shared client.
 *
 * It is a ratchet, not a gate. Migrating 64 database calls out of this service
 * takes several passes, so a check that simply demanded zero would have to stay
 * switched off until the very last one — which is exactly when a regression
 * guard is least useful. Instead the files that still hold direct access are
 * listed below, and the rules are:
 *
 *   - a file NOT on the list may not import Prisma          (no new debt)
 *   - a file ON the list that no longer needs to be there   (no stale excuses)
 *
 * The second half matters as much as the first: the list cannot quietly outlive
 * the problem, because finishing a migration and forgetting to delete the entry
 * fails the build too.
 *
 * Delete entries as batches land. When the list is empty, remove it and the
 * frontend has no database access at all.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const SRC = join(process.cwd(), "src");

/**
 * Files still holding direct database access, with the batch that removes them.
 * Sorted by the migration order agreed in the audit.
 */
const PRISMA_ALLOWED = new Map([
  ["lib/db.ts", "the client itself — deleted last, with DATABASE_URL"],
  ["app/api/health/route.ts", "health probe: it exists to report on this very connection"],
  ["app/api/auth/google/callback/route.ts", "batch 6"],
  ["lib/auth/open-access.ts", "batch 7"],
]);

/**
 * Files permitted to name a URL directly.
 *
 * The two clients have to — they are what everything else goes through. The
 * health route probes the backend using the same configured base rather than a
 * literal. Google's token endpoint is Google's, not ours.
 */
const FETCH_ALLOWED = new Set([
  "lib/api-client.ts",
  "lib/api/server.ts",
  "app/api/health/route.ts",
  "lib/auth/google.ts",
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== "generated") walk(path, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

const files = walk(SRC).map((path) => ({
  rel: relative(SRC, path).split(sep).join("/"),
  body: readFileSync(path, "utf8"),
}));

const problems = [];

// --- Rule 1: no new direct database access ----------------------------------

/**
 * The Prisma *client* — not everything the generator emits.
 *
 * `@/generated/prisma/enums` is where `SectionType` lives, and six files import
 * it to name a section type in a registry, a schema or a form definition. None
 * of them opens a connection or runs a query; the enum is shared vocabulary
 * that happens to be generated from the schema. Flagging those would mean
 * either an allowlist of files that are not doing anything wrong, or deleting
 * the enum and hand-copying its members — which is the drift this codebase
 * already has a checksum guarding against.
 *
 * So the rule is the client and the models, and specifically not the enums.
 */
const importsPrisma = (body) =>
  /from\s+["']@\/lib\/db["']/.test(body) ||
  /from\s+["']@\/generated\/prisma\/(client|models)/.test(body) ||
  /\bnew\s+PrismaClient\b/.test(body);

const usingPrisma = new Set();

for (const { rel, body } of files) {
  if (!importsPrisma(body)) continue;
  usingPrisma.add(rel);
  if (PRISMA_ALLOWED.has(rel)) continue;

  problems.push(
    `${rel}\n      imports the Prisma client. Data belongs behind api.xite.co.in —\n` +
      `      call it through lib/api/server.ts (server) or lib/api-client.ts (browser).`,
  );
}

// --- Rule 1b: the allowlist may not outlive the problem ----------------------

for (const [rel, note] of PRISMA_ALLOWED) {
  if (usingPrisma.has(rel)) continue;
  problems.push(
    `${rel}\n      no longer imports Prisma, but is still listed in\n` +
      `      scripts/check-api-boundary.mjs (${note}). Remove the entry.`,
  );
}

// --- Rule 2: no hardcoded URLs outside the clients --------------------------

for (const { rel, body } of files) {
  if (FETCH_ALLOWED.has(rel)) continue;

  // `fetch("https://...")` or fetch(`https://...`) — a literal host, rather
  // than a path resolved against the client's configured base.
  const hardcoded = body.match(/fetch\(\s*[`"']https?:\/\/[^`"')]+/g);
  if (!hardcoded) continue;

  problems.push(
    `${rel}\n      fetch() names a host directly: ${hardcoded[0].slice(0, 60)}…\n` +
      `      Use the shared API client so the base URL stays one setting.`,
  );
}

// --- Report ------------------------------------------------------------------

if (problems.length) {
  console.error("\n[boundary] The frontend is reaching past the API:\n");
  for (const problem of problems) console.error(`  - ${problem}\n`);
  process.exit(1);
}

const remaining = [...PRISMA_ALLOWED.keys()].filter(
  (rel) => rel !== "lib/db.ts" && rel !== "app/api/health/route.ts",
);

console.log(
  `[boundary] ok — no new database access, no hardcoded API URLs.` +
    (remaining.length
      ? `\n[boundary] ${remaining.length} file(s) still to migrate: ${remaining.join(", ")}`
      : `\n[boundary] nothing left to migrate — remove DATABASE_URL and the allowlist.`),
);
