"use client";

import { useState, useTransition } from "react";
import { Globe, RefreshCw } from "lucide-react";
import { setPublishStatus } from "@/app/actions/publish";
import { cn } from "@/lib/utils";

/** Draft / Published switch in the editor. */
export function PublishToggle({
  collegeId,
  status,
  compact = false,
}: {
  collegeId: string;
  status: string;
  compact?: boolean;
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

  if (compact) {
    return (
      <div className="group relative flex items-center">
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          aria-label={isPublished ? "Unpublish Site" : "Publish Site"}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 shadow-sm",
            isPublished
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-900 text-white hover:bg-slate-800"
          )}
        >
          {isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Globe className="h-4 w-4 text-white" />
          )}
        </button>
        <div className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:flex items-center whitespace-nowrap z-50">
          {isPending
            ? "Updating..."
            : isPublished
              ? "Status: Published (Click to Unpublish)"
              : "Status: Draft (Click to Publish Site)"}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
        </div>
      </div>
    );
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
