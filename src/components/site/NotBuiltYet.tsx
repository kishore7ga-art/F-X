import Link from "next/link";

/**
 * Shown when a college exists but has no pages yet.
 *
 * A bare 404 says "there is nothing here and never was", which is wrong and
 * unhelpful: the college is real, it simply has not chosen a design. The
 * distinction matters because the two need opposite responses — one is a typo,
 * the other is one click away from being a website.
 */
export function NotBuiltYet({
  collegeName,
  subdomain,
}: {
  collegeName: string;
  subdomain: string;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-white px-5">
      <div className="max-w-md text-center">
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-black/35">
          Not published yet
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
          {collegeName} is still being built
        </h1>
        <p className="mt-4 text-base leading-relaxed text-black/55">
          This address is reserved at{" "}
          <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">
            /site/{subdomain}
          </code>
          , but no design has been chosen yet, so there are no pages to show.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/start"
            className="w-full rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:w-auto"
          >
            Choose a design
          </Link>
          <Link
            href="/"
            className="w-full rounded-xl border border-black/15 px-6 py-3 text-sm font-semibold text-black transition hover:border-black/40 sm:w-auto"
          >
            Back to XITE
          </Link>
        </div>
      </div>
    </main>
  );
}
