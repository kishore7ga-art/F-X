import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Catch-all fallback for legacy /editor URLs.
 * Automatically redirects to /choose-type instead of returning 404.
 */
export default function LegacyEditorRedirect() {
  redirect("/choose-type");
}
