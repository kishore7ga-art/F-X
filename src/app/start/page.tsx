import Link from "next/link";
import { redirect } from "next/navigation";

import { buildSiteForType } from "@/app/actions/onboarding";
import { requireCurrentCollege } from "@/lib/auth/current";
import { collegeType } from "@/lib/college-types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Start building — XITE" };

/**
 * The fork: let us choose the design, or choose it yourself.
 *
 * Both cards end at the same place — /editor/[subdomain] with College.templateId
 * set. The only difference is who picked it.
 */
export default async function StartPage() {
  const college = await requireCurrentCollege();

  // Neither card can act without a type: one needs it to pick a template, and
  // the other would leave a nameless college behind.
  if (!college.collegeType) redirect("/onboarding");

  const type = collegeType(college.collegeType);

  // A college that already has a design is here because /start is now the front
  // door, not because it wants to start over. Getting back into its own editor
  // should not require picking a template again.
  const hasSite = Boolean(college.templateId);

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:py-24">
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-ink/35">
          Step 3 of 3
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
          How would you like to start, {college.name}?
        </h1>
        <p className="mt-3 text-base text-brand-ink/55">
          Either way you land in the same editor, and you can change the design
          afterwards without losing a word.
        </p>
        <p className="mt-2 text-sm text-brand-ink/45">
          Not right?{" "}
          <Link
            href="/onboarding"
            className="font-semibold text-brand-ink underline-offset-2 hover:underline"
          >
            Change your college name or type
          </Link>
          .
        </p>

        {hasSite ? (
          <Link
            href={`/editor/${college.subdomain}`}
            className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-brand-ink/15 bg-brand-mist/60 px-6 py-5 transition hover:-translate-y-0.5 hover:border-brand-ink/40"
          >
            <span>
              <span className="block text-base font-bold text-brand-ink">
                Continue editing your site
              </span>
              <span className="mt-0.5 block text-sm text-brand-ink/55">
                Pick up where you left off at /{college.subdomain}
              </span>
            </span>
            <span className="shrink-0 text-sm font-bold text-brand-ink">→</span>
          </Link>
        ) : null}

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Build Site — we pick, from the type they gave us. */}
          <form action={buildSiteForType} className="contents">
            <button
              type="submit"
              className="group flex flex-col rounded-2xl border-2 border-brand-ink p-8 text-left transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-ink text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="m13 3-8 10h6l-2 8 8-10h-6l2-8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="mt-5 text-xl font-bold text-brand-ink">
                Build Site
              </span>
              <span className="mt-2 text-[15px] leading-relaxed text-brand-ink/55">
                We pick the design that suits{" "}
                {type ? type.label.toLowerCase() : "your"} colleges and open the
                editor with your pages already there.
              </span>
              {type ? (
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-mist px-3 py-1.5 text-xs font-semibold text-brand-ink/60">
                  Starts on {type.templateName}
                </span>
              ) : null}
              <span className="mt-6 text-sm font-bold text-brand-ink group-hover:underline">
                Start building →
              </span>
            </button>
          </form>

          {/* Templates — they pick, through the existing gallery. */}
          <Link
            href="/templates"
            className="group flex flex-col rounded-2xl border border-brand-ink/15 p-8 transition hover:-translate-y-1 hover:border-brand-ink/40 hover:shadow-xl"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-mist text-brand-ink">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M4 5h7v6H4V5Zm9 0h7v4h-7V5ZM4 13h7v6H4v-6Zm9-2h7v8h-7v-8Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="mt-5 text-xl font-bold text-brand-ink">
              Browse Templates
            </span>
            <span className="mt-2 text-[15px] leading-relaxed text-brand-ink/55">
              Look through all five designs, preview each one with your colours
              and fonts, then choose.
            </span>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-mist px-3 py-1.5 text-xs font-semibold text-brand-ink/60">
              5 designs · live demos
            </span>
            <span className="mt-6 text-sm font-bold text-brand-ink group-hover:underline">
              See the templates →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
