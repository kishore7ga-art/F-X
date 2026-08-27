/**
 * The section engine, as one browser bundle.
 *
 * The parity harness needs the *real* fencing, tokenising and stylesheet
 * assembly, and `fenceCssToSection` borrows the browser's CSS parser — so it
 * cannot run in Node. esbuild bundles this entry, the harness injects the
 * result, and the page then builds its runtime stylesheet with exactly the code
 * the editor ships.
 */
import * as fence from "../src/lib/section-css-fence";
import * as themes from "../src/lib/editor-themes";
import * as runtime from "../src/lib/section-runtime";
import { buildSectionRuntimeStylesheet } from "../src/lib/section-runtime-stylesheet";

Object.assign(globalThis as Record<string, unknown>, {
  XITE: { ...runtime, ...fence, ...themes, buildSectionRuntimeStylesheet },
});
