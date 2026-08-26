"use client";

/**
 * Route-level error boundary.
 *
 * Next strips error messages from production Server Component renders, so an
 * unhandled failure previously showed the user nothing at all. This at least
 * explains what happened and surfaces the digest, which is the only way to
 * correlate a browser error with a line in the server log.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-sm text-black/60">
        This page couldn&apos;t be loaded. It is usually a temporary problem
        reaching the database.
      </p>

      {error.digest ? (
        <p className="mt-4 rounded-md bg-black/5 px-3 py-2 font-mono text-xs text-black/60">
          Error reference: {error.digest}
        </p>
      ) : null}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Try again
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
            `/api/health` is a Route Handler that answers JSON, not a page.
            `<Link>` would prefetch it and hand it to the client router, which
            has no route to render for it — a full navigation is what is wanted,
            and a full navigation is what an anchor does. */}
        <a
          href="/api/health"
          className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:bg-black/5"
        >
          Check service status
        </a>
      </div>
    </main>
  );
}
