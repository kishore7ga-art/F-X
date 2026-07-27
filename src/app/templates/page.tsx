import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteImage } from "@/components/site/SiteImage";
import { requireCurrentCollege } from "@/lib/auth/current";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Screen 1 — template gallery. Minimal for now; it exists so the theme picker
 * has an entry point. Expands when a second template is added.
 */
export default async function TemplateGalleryPage() {
  // The gallery now hangs off /start rather than being the first screen, so a
  // college that has not been asked its name and type yet is sent back to be
  // asked. Arriving here directly would otherwise skip onboarding entirely.
  const college = await requireCurrentCollege();
  if (!college.collegeType) redirect("/onboarding");

  const templates = await prisma.template.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { sections: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Choose a template</h1>
      <p className="mt-2 text-sm text-black/60">
        Pick a design, then choose colours and fonts on the next screen.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/templates/${template.id}`}
            className="group overflow-hidden rounded-xl border transition hover:shadow-md"
          >
            <div className="aspect-[4/3] bg-zinc-100">
              {template.thumbnailUrl ? (
                <SiteImage
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="p-4">
              <h2 className="font-semibold group-hover:underline">
                {template.name}
              </h2>
              <p className="mt-1 text-xs text-black/55">
                {template._count.sections} sections
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
