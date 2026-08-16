import { redirect } from "next/navigation";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const college = await getCurrentCollegeOrNull();
  redirect(`/editor/${college?.subdomain || "greenfield"}`);
}
