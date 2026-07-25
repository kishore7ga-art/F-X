import { redirect } from "next/navigation";

import { getCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

/** Send visitors to their editor if signed in, otherwise to sign-in. */
export default async function HomePage() {
  const college = await getCurrentCollege();
  redirect(college ? `/editor/${college.subdomain}` : "/login");
}
