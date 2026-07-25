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

const MAX_ATTEMPTS = Number(process.env.MIGRATE_RETRIES ?? 5);
const FAIL_FAST = process.env.MIGRATE_FAIL_FAST === "true";

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true });
    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!process.env.DATABASE_URL) {
  console.error(
    "[start] DATABASE_URL is not set. The app will start but every page that " +
      "touches the database will fail. Set it in your host's environment.",
  );
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

process.exit(await run("npx", ["next", "start"]));
