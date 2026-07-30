"use client";

import { useState, useTransition } from "react";

import { setPublishStatus } from "@/app/actions/publish";

/** Draft / Published switch in the editor header. */
export function PublishToggle({
  collegeId,
  status,
}: {
  collegeId: string;
  status: string;
}) {
  const isPublished = status === "PUBLISHED";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      try {
        await setPublishStatus({ collegeId, publish: !isPublished });
      } catch {
        setError("Could not change publish status");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
          isPublished
            ? "bg-green-100 text-green-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {isPublished ? "Published" : "Draft"}
      </span>

      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={isPublished}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
          isPublished
            ? "border hover:bg-black/5"
            : "bg-green-700 text-slate-900 hover:opacity-90"
        }`}
      >
        {isPending
          ? "Saving…"
          : isPublished
            ? "Unpublish"
            : "Publish site"}
      </button>

      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
