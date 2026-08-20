/**
 * Production entrypoint: serve Next.js frontend application.
 */
import { spawn } from "node:child_process";

/**
 * Checks the session key before Next starts.
 *
 * Deliberately plain JavaScript with no imports. This is the one process that
 * has to start for every published college site to be reachable, and reaching
 * into `src/` for a TypeScript module would make that depend on Node's type
 * stripping — unflagged only from 22.18, while the image is pinned to `node:22`.
 * A guard that can itself fail to load is worse than no guard.
 *
 * Severity is split on purpose:
 *
 *   - A key that has been published is fatal. Sessions are HS256 JWTs, so a key
 *     anyone can read means anyone can mint a session, and serving traffic with
 *     one is worse than serving none. Production was found running exactly this.
 *
 *   - A *missing* key only warns. This service verifies sessions but never
 *     issues them, and every published college website works without one.
 *     Taking those sites down would be a larger outage than the bug it guards
 *     against — that sessions stop renewing and Google sign-in answers 500.
 */
const PUBLISHED_SECRETS = [
  "super-secret-session-key-for-xite-local-dev-32chars",
  "super-secret-admin-session-key-32chars",
  "changeme",
  "change-me",
  "secret",
  "password",
];

const GENERATE = "openssl rand -base64 48";

function checkSessionSecret() {
  const value = (process.env.SESSION_SECRET ?? "").trim().replace(/^["']|["']$/g, "");

  if (!value) {
    console.warn(
      "[secrets] SESSION_SECRET is not set. Published sites serve normally, but " +
        "sessions will not renew and Google sign-in will fail. Set it to the same " +
        "value the API signs with.",
    );
    return;
  }

  const published = PUBLISHED_SECRETS.some(
    (known) => value.toLowerCase() === known.toLowerCase(),
  );

  if (published || value.length < 32) {
    console.error(
      [
        "",
        "[secrets] Refusing to start.",
        "",
        published
          ? "  SESSION_SECRET is a placeholder published in this repository."
          : `  SESSION_SECRET is ${value.length} characters; at least 32 are required.`,
        "  Sessions are signed with it, so anyone holding it can issue themselves",
        "  one. Generate a replacement with:",
        "",
        `      ${GENERATE}`,
        "",
        "  and set the same value on this service and on the API.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
}

checkSessionSecret();

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

console.log("[start] starting Next.js frontend server...");
process.exit(await run("npx", ["next", "start"]));
