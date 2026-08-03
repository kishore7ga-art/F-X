import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Top-level fallback for /editor.
 * Redirects directly to /choose-type.
 */
export default function EditorTopLevelRedirect() {
  redirect("/choose-type");
}
