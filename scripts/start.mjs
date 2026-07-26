/**
 * Production entrypoint: apply migrations, then serve.
 *
 * `prisma migrate deploy && next start` was too brittle. A database that is
 * merely slow to accept connections killed the container, and because the
 * process exited the reverse proxy had no backend at all — the visible symptom
 * was an opaque 502 with nothing in the app logs to explain it.
 *
 * So: retry migrations with backoff, and if they still fail, start the server
 * anyway and say so loudly. A running app that reports a database error is far
 * easier to diagnose than a crash loop behind a 502. Set MIGRATE_FAIL_FAST=true
 * to restore exit-on-failure behaviour.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const MAX_ATTEMPTS = Number(process.env.MIGRATE_RETRIES ?? 5);
const FAIL_FAST = process.env.MIGRATE_FAIL_FAST === "true";

function run(command, args, env) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ...env },
    });
    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Catch a DATABASE_URL that was copied from the template but never filled in.
 * Setting it to a placeholder is worse than leaving it unset, because a set
 * value overrides the bundled Postgres in docker-compose.yml — so the symptom
 * is an unreachable host rather than an obvious configuration mistake.
 */
const PLACEHOLDER_MARKERS = [
  "USER:PASSWORD",
  "HOST-pooler",
  "@HOST.",
  "REGION",
  "PROJECTREF",
  "replace-with",
  "placeholder",
];

/**
 * A DATABASE_URL pointing at localhost is the other way this goes wrong, and
 * the more common one: `.env.example` ends with a LOCAL DEVELOPMENT line, and
 * pasting the whole file into a dashboard carries it into production. Inside a
 * container localhost is the container itself, where no Postgres is listening,
 * so every query fails with ECONNREFUSED against a host that looks plausible.
 */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function pointsAtLocalhost(connectionString) {
  try {
    // URL keeps IPv6 literals bracketed; strip them before comparing.
    const { hostname } = new URL(connectionString);
    return LOCAL_HOSTS.has(hostname.replace(/^\[|\]$/g, ""));
  } catch {
    return false;
  }
}

/**
 * Only containers make localhost wrong. Running `npm start` directly on a
 * machine with its own Postgres is a legitimate setup, and warning about it
 * there would be noise.
 */
const inContainer = existsSync("/.dockerenv");

/**
 * The bundled Postgres from docker-compose.yml, rebuilt from the same parts
 * compose uses for its `${DATABASE_URL:-...}` default. Available only when the
 * db service is in play, which is what POSTGRES_PASSWORD signals.
 */
function bundledDatabaseUrl() {
  const password = process.env.POSTGRES_PASSWORD;
  if (!password) return null;
  return (
    `postgresql://collegeadmin:${encodeURIComponent(password)}` +
    "@db:5432/college_saas?schema=public"
  );
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "[start] DATABASE_URL is not set. The app will start but every page that " +
      "touches the database will fail. Set it in your host's environment.",
  );
} else {
  const marker = PLACEHOLDER_MARKERS.find((m) => databaseUrl.includes(m));

  // Both faults are the same mistake with two faces — a value copied out of the
  // template that names somewhere the database is not — so they get the same
  // rescue and differ only in how the line is described.
  const fault = marker
    ? `still contains the template placeholder "${marker}"`
    : inContainer && pointsAtLocalhost(databaseUrl)
      ? "points at localhost, which inside a container is the container " +
        "itself\n  and never the database"
      : null;

  if (fault) {
    const fallback = bundledDatabaseUrl();

    // Neither a placeholder nor localhost is ever a real destination, so
    // preferring the bundled database over one cannot cost anyone a working
    // connection — but it does rescue the common case of pasting .env.example
    // into a dashboard. Without this the bad value silently wins and every
    // page fails against a host that was never going to answer.
    console.error(
      "\n" +
        "=".repeat(72) +
        `\n[start] DATABASE_URL ${fault}.\n` +
        (fallback
          ? "\n  IGNORING it and using the bundled Postgres (db:5432) instead.\n" +
            "\n  Delete DATABASE_URL from your host's environment to silence " +
            "this,\n  or replace it with a real connection string to use your " +
            "own database.\n"
          : "\n  It is set, so it OVERRIDES the Postgres container that " +
            "docker-compose.yml\n  would otherwise provide — which is why the " +
            "host cannot be reached.\n" +
            "\n  Fix it either way:\n" +
            "    - Delete DATABASE_URL entirely to use the bundled database, or\n" +
            "    - Replace it with a real connection string from your provider.\n") +
        "=".repeat(72) +
        "\n",
    );

    // Child processes below (migrate, seed, next start) inherit process.env,
    // so this one assignment redirects the whole boot.
    if (fallback) process.env.DATABASE_URL = fallback;
  }
}

let migrated = false;
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  console.log(`[start] applying migrations (attempt ${attempt}/${MAX_ATTEMPTS})`);
  if ((await run("npx", ["prisma", "migrate", "deploy"])) === 0) {
    migrated = true;
    break;
  }
  if (attempt < MAX_ATTEMPTS) {
    const delaySeconds = Math.min(2 ** attempt, 30);
    console.warn(`[start] migration failed, retrying in ${delaySeconds}s`);
    await sleep(delaySeconds * 1000);
  }
}

if (!migrated) {
  console.error("[start] migrations did not apply after all retries.");
  if (FAIL_FAST) process.exit(1);
  console.error("[start] starting the server anyway so the error is visible.");
}

/**
 * Migrations only create tables. Templates, theme palettes, font packs and the
 * section-variant library are reference data that lives in the seed, so without
 * this step a fresh database boots "connected" but with an empty template
 * gallery and no way to build a site.
 *
 * The seed upserts on natural keys, so this is a no-op on every boot after the
 * first, and it never overwrites a college's edited content.
 *
 * SEED_DEMO_COLLEGE=false omits the sample college and its README-published
 * login, which must not exist on a deployed instance. Set SEED_ON_START=false
 * to skip seeding entirely.
 */
if (migrated && process.env.SEED_ON_START !== "false") {
  console.log("[start] seeding reference data (templates, variants, themes)");
  if ((await run("npx", ["prisma", "db", "seed"], {
    SEED_DEMO_COLLEGE: "false",
  })) !== 0) {
    // Non-fatal for the same reason migrations are: serving an app that can
    // report the problem beats a crash loop behind a 502.
    console.error(
      "[start] seeding failed. The app will start, but the template gallery " +
        "may be empty. Re-run with `npx prisma db seed` once the cause is fixed.",
    );
  }
}

process.exit(await run("npx", ["next", "start"]));
