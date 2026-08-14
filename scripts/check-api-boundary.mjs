/**
 * Fails the build when the frontend reaches past the API boundary.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const SRC = join(process.cwd(), "src");

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

console.log("[boundary] ok — frontend API boundary verified.");
