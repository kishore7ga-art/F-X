import { redirect } from "next/navigation";
import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const college = await requireCurrentCollege();

  if (college.subdomain) {
    redirect(`/editor/${college.subdomain}`);
  }

  redirect("/onboarding");
}
