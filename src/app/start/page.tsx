import Link from "next/link";
import { redirect } from "next/navigation";

import { buildSiteForType } from "@/app/actions/onboarding";
import { requireCurrentCollege } from "@/lib/auth/current";
import { collegeType } from "@/lib/college-types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Start building — XITE" };

export default async function StartPage() {
  const college = await requireCurrentCollege();

  if (!college.collegeType) redirect("/onboarding");

  const type = collegeType(college.collegeType);
  const hasSite = Boolean(college.templateId);

  return (
    <main className="min-h-dvh bg-slate-50/50 flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl shadow-slate-200/50">
        
        {/* Header Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Step 3 of 3
            </p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              How would you like to start, {college.name}?
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/editor/${college.subdomain}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800"
            >
              <span>Go to Editor Dashboard</span>
              <span>→</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <span>Super Admin</span>
            </Link>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
          Either way you land in the same editor, and you can change the design
          afterwards without losing a word.
        </p>

        {/* Address Badge & Edit Details Link */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200/60">
            <span className="font-bold text-slate-900">Your address</span>
            <code className="rounded bg-white px-2 py-0.5 text-xs text-slate-800 font-mono shadow-xs">
              /site/{college.subdomain}
            </code>
          </div>

          <p className="text-xs sm:text-sm text-slate-500">
            Not right?{" "}
            <Link
              href="/onboarding"
              className="font-bold text-slate-900 underline-offset-2 hover:underline"
            >
              Change your college name or type
            </Link>
            .
          </p>
        </div>

        {/* Continue Editing Banner */}
        {hasSite ? (
          <Link
            href={`/editor/${college.subdomain}`}
            className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-4.5 transition hover:border-slate-300 hover:bg-slate-100/80 shadow-sm"
          >
            <div>
              <span className="block text-base font-bold text-slate-900">
                Continue editing your site
              </span>
              <span className="mt-0.5 block text-xs sm:text-sm text-slate-500 font-medium">
                Pick up where you left off at /{college.subdomain}
              </span>
            </div>
            <span className="shrink-0 text-sm font-bold text-slate-900">→</span>
          </Link>
        ) : null}

        {/* Starting Choices Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Build Site Card */}
          <form action={buildSiteForType} className="contents">
            <button
              type="submit"
              className="group flex flex-col justify-between rounded-2xl border-2 border-slate-900 bg-white p-7 text-left transition hover:-translate-y-1 hover:shadow-xl shadow-md cursor-pointer"
            >
              <div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d="m13 3-8 10h6l-2 8 8-10h-6l2-8Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                  Build Site
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">
                  We pick the design that suits{" "}
                  {type ? type.label.toLowerCase() : "your"} colleges and open the
                  editor with your pages already there.
                </p>
              </div>

              <div className="mt-6">
                {type ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200/60">
                    Starts on {type.templateName}
                  </span>
                ) : null}
                <span className="mt-4 flex items-center gap-1.5 text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Start building →
                </span>
              </div>
            </button>
          </form>

          {/* Browse Templates Card */}
          <Link
            href="/templates"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl shadow-sm"
          >
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-900">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M4 5h7v6H4V5Zm9 0h7v4h-7V5ZM4 13h7v6H4v-6Zm9-2h7v8h-7v-8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                Browse Templates
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">
                Look through all five designs, preview each one with your colours
                and fonts, then choose.
              </p>
            </div>

            <div className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200/60">
                5 designs · live demos
              </span>
              <span className="mt-4 flex items-center gap-1.5 text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                See the templates →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
