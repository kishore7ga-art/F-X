import { requireCurrentCollege, requireOnboarded } from "@/lib/auth/current";
import { EditorStudio } from "@/components/editor/EditorStudio";
import { SectionRuntimeAssets } from "@/components/preview/SectionRuntimeAssets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Visual Live Editor Studio — XITE",
};

/**
 * The college whose editor this is — or, in preview mode, a stand-in.
 *
 * ── Why the flag, and why it is checked here rather than removed ───────────
 *
 * Opening the editor normally needs a signed-in college, an onboarded one, a
 * backend and a database. That is correct for the product and a poor way to
 * look at the editor's own UI, so there is a preview mode that skips all four.
 *
 * It is guarded rather than deleted because the ungated version of this file is
 * an **authentication bypass on the platform apex**: `webxite.org/editor` is
 * the same origin as the sign-in page, and the session cookie is scoped to
 * `.webxite.org`. The gate that belongs here is the same one
 * `/editor/[subdomain]` uses, and it is not optional in production.
 *
 * `NEXT_PUBLIC_UI_PREVIEW` is read at build time, so a production build has no
 * branch to reach: the mock is not "unlikely", it is not compiled in. The same
 * flag decides, in `next.config.ts`, whether the mock API routes may intercept
 * `/api/v1/*` at all — one switch for the whole preview mode, because two
 * switches is how half of it ends up enabled.
 */
const UI_PREVIEW = process.env.NEXT_PUBLIC_UI_PREVIEW === "1";

const PREVIEW_COLLEGE = {
  subdomain: "greenfield",
  name: "Greenfield University",
};

export default async function EditorPage() {
  // Gated on onboarding for the same reason /editor/[subdomain] is: the login
  // response's `next` is a hint to the browser, and typing this path skips it.
  const college = UI_PREVIEW
    ? PREVIEW_COLLEGE
    : requireOnboarded(await requireCurrentCollege("greenfield"));

  // The same environment the published site renders in — Tailwind's Play CDN has
  // to be in the HTML rather than appended later, or sections written with Tailwind
  // classes render unstyled in the studio and styled once published.
  return (
    <>
      <SectionRuntimeAssets />
      <EditorStudio subdomain={college.subdomain} collegeName={college.name} />
    </>
  );
}
