import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteImage } from "@/components/site/SiteImage";
import { requireCurrentCollege } from "@/lib/auth/current";
import { listTemplates } from "@/lib/site/templates";

export const dynamic = "force-dynamic";

const TEMPLATE_PREVIEWS: Record<
  string,
  { image: string; tag: string }
> = {
  Radian: {
    image: "/template-brightwood.jpg",
    tag: "Engineering & Tech",
  },
  Meridian: {
    image: "/template-evergreen.jpg",
    tag: "Arts & Science",
  },
  Beacon: {
    image: "/template-calistoga.jpg",
    tag: "Medical & Nursing",
  },
  Harbour: {
    image: "/template-oakwood.jpg",
    tag: "Polytechnics & Management",
  },
  Almanac: {
    image: "/macbook-madras-college.png",
    tag: "Heritage & University",
  },
};

export default async function TemplateGalleryPage() {
  const college = await requireCurrentCollege();
  if (!college.collegeType) redirect("/onboarding");

  const templates = await listTemplates();

  return (
    <main className="min-h-dvh bg-slate-50/50 py-12 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
              <span>5 Academic Designs</span>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Choose a template
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-500 font-medium">
              Pick a real institution design, then customize colors and fonts on the next screen.
            </p>
          </div>

          <Link
            href="/start"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <span>← Back to Step 3</span>
          </Link>
        </div>

        {/* Real Templates Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const customPreview = TEMPLATE_PREVIEWS[template.name] || {
              image: template.thumbnailUrl || "/template-brightwood.jpg",
              tag: "Academic Template",
            };

            return (
              <Link
                key={template.id}
                href={`/templates/${template.id}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-slate-300"
              >
                {/* Real Preview Image Header */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <SiteImage
                    src={customPreview.image}
                    alt={template.name}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-sm">
                    {customPreview.tag}
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h2>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        {template.sectionCount} sections
                      </span>
                    </div>

                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {template.description ||
                        "A fully customizable, NAAC-ready design built specifically for educational institutions."}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Live Preview
                    </span>
                    <span className="flex items-center gap-1 text-sm font-extrabold text-slate-900 group-hover:translate-x-1 transition-transform">
                      Select Template →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
