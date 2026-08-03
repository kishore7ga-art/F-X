import { redirect } from "next/navigation";

import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Editor Studio — XITE" };

/**
 * Direct post-login router.
 *
 * Redirects immediately to the Visual Live Editor Studio (/editor/:subdomain).
 */
export default async function StartPage() {
  const college = await requireCurrentCollege();
  redirect(`/editor/${college.subdomain}`);
}
