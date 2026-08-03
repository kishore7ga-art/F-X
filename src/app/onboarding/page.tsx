import { redirect } from "next/navigation";

import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Editor Studio — XITE" };

/**
 * Direct post-login router for /onboarding.
 *
 * Directs straight to the Visual Live Editor Studio (/editor/:subdomain).
 */
export default async function OnboardingPage() {
  const college = await requireCurrentCollege();
  redirect(`/editor/${college.subdomain}`);
}
