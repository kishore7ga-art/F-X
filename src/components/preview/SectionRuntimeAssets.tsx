import {
  SECTION_RUNTIME_STYLESHEET_HREFS,
  SECTION_RUNTIME_TAILWIND_CDN_SRC,
} from "@/lib/section-runtime";

/**
 * The environment's external assets, in the server-rendered HTML.
 *
 * They have to arrive with the document rather than be appended afterwards.
 * Tailwind's Play CDN is a compiler that runs in the page: it reads the DOM,
 * generates the CSS for the classes it finds, and watches for more. Appended
 * after `DOMContentLoaded` — which is what the editor and the site both used to
 * do — it loads, defines `window.tailwind`, and produces **no stylesheet at all**.
 * Every section authored with Tailwind classes was therefore rendering unstyled
 * on the live site while looking right in the Admin, whose iframe carries the
 * script in its `<head>` from the start.
 *
 * The stylesheets are here for the smaller version of the same problem: injected
 * from an effect they land a paint or two late, so the site's first frame is in a
 * fallback font.
 *
 * A Server Component, so all of this is in the first byte of HTML.
 */
export function SectionRuntimeAssets() {
  return (
    <>
      {SECTION_RUNTIME_STYLESHEET_HREFS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- parse-time execution is the point; see above. */}
      <script src={SECTION_RUNTIME_TAILWIND_CDN_SRC} />
    </>
  );
}
