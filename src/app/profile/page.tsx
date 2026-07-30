import { ProfileForm } from "@/components/profile/ProfileForm";
import { requireCurrentCollege } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "User Profile — XITE" };

export default async function ProfilePage() {
  const college = await requireCurrentCollege();

  return <ProfileForm college={college} />;
}
