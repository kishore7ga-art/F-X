import { EditorStudio } from "@/components/editor/EditorStudio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Visual Live Editor Studio — XITE",
};

export default function EditorPage() {
  return <EditorStudio subdomain="greenfield" collegeName="Greenfield University" />;
}
