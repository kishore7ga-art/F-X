/**
 * Production entrypoint: serve Next.js frontend application.
 */
import { spawn } from "node:child_process";

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
