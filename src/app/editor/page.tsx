import { redirect } from "next/navigation";

import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Editor Studio — XITE" };

/**
 * Top-level /editor route handler.
 *
 * Automatically resolves the signed-in/open-access college and redirects to its
 * tenant-scoped editor canvas (/editor/:subdomain) or onboarding (/start).
 */
export default async function TopLevelEditorPage() {
  const college = await requireCurrentCollege();

  if (!college.templateId) {
    redirect("/start");
  }

  redirect(`/editor/${college.subdomain}`);
}
