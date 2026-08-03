import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChooseTypePage() {
  redirect("/editor/greenfield");
}
