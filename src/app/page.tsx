import { redirect } from "next/navigation";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const college = await getCurrentCollegeOrNull();

  if (college) {
    redirect(`/editor/${college.subdomain || "greenfield"}`);
  }

  redirect("/login");
}
