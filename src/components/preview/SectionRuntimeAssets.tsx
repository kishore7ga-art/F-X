import {
  SECTION_RUNTIME_STYLESHEET_HREFS,
  SECTION_RUNTIME_TAILWIND_CDN_SRC,
} from "@/lib/section-runtime";
import { themeFontsHref, themeStylesheet } from "@/lib/editor-themes";

/** The canvas element the theme tokens are scoped to, on every surface. */
const CANVAS_SCOPE = ".xite-site-canvas";

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
      <link rel="stylesheet" href={themeFontsHref()} />
      {/*
        All four themes' tokens, in the first byte of HTML.

        A `data-xite-theme` attribute on the canvas selects between them, so a
        published site renders in its tenant's theme on the very first paint —
        no flash of the default palette, and no client-side pass over the
        section markup. The section HTML itself is exactly what was published:
        the colours resolve through `var()` with the authored value as the
        fallback.

        The last sentence of this comment used to be "so a site with no theme
        set renders identically to before", and that was not true: the
        stylesheet opened with an *ungated* block of the default theme's tokens,
        so the variables were defined on every canvas and the fallback was never
        reached. A site with no theme rendered in Academic Blue. It is true now
        — every token block requires the attribute.
      */}
      {/* Generated from static constants in `editor-themes.ts`; no request
          data reaches it. */}
      <style dangerouslySetInnerHTML={{ __html: themeStylesheet(CANVAS_SCOPE) }} />
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- parse-time execution is the point; see above. */}
      <script src={SECTION_RUNTIME_TAILWIND_CDN_SRC} />
    </>
  );
}
