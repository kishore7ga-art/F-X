import Link from "next/link";

/** Shown only to the owning college while its site is still a draft. */
export function DraftBanner({ subdomain }: { subdomain: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-900">
      <span>
        This site is a <strong>draft</strong> — only you can see it. Visitors
        get a 404 until you publish.
      </span>
      <Link
        href={`/editor/${subdomain}`}
        className="rounded bg-amber-900 px-2.5 py-1 font-semibold text-amber-50"
      >
        Open editor
      </Link>
    </div>
  );
}
