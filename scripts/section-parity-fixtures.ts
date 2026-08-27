/**
 * The sections the parity harness renders.
 *
 * Two sources, deliberately.
 *
 * `live/*.html` are the platform's own default sections, taken verbatim from
 * `GET /api/v1/default-website` — the same strings a tenant's first page is
 * seeded with. They are here because a synthetic fixture only tests what its
 * author thought to test, and the divergence this harness exists to catch was
 * in a construct nobody would have written on purpose (a `clamp()` on `vw`
 * inside a header's container padding).
 *
 * The rest are written to cover one hazard each, across the section types the
 * platform offers. Together they exercise: viewport units, `:root` custom
 * properties, a section's own `@media` breakpoints, Tailwind utility classes,
 * `<style>`-block CSS, inline `style` attributes, headings, lists, images,
 * SVG, form controls, buttons, tables, grid and flex.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, "section-parity-sections");

export type Fixture = { name: string; code: string };

export const FIXTURES: Fixture[] = readdirSync(DIR)
  .filter((file) => file.endsWith(".html"))
  .sort()
  .map((file) => ({
    name: file.replace(/\.html$/, ""),
    code: readFileSync(path.join(DIR, file), "utf8"),
  }));
