"use client";

import { useEffect, useState, useTransition } from "react";

import { fetchSectionHistory, restoreSection } from "@/lib/api-client";

type Version = {
  id: string;
  savedAt: string;
  saveTrigger: string;
  isCurrent: boolean;
};

/** Plain language, because "section_update" is not a thing anyone recognises. */
const TRIGGER_LABEL: Record<string, string> = {
  typing: "Edited text",
  drag: "Reordered",
  color: "Changed colours",
  font: "Changed fonts",
  image: "Changed an image",
  delete: "Removed content",
  resize: "Resized",
  section_update: "Updated section",
  restore: "Restored an earlier version",
};

const stamp = (iso: string) =>
  new Date(iso).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

import { History, RotateCcw, Clock, X, ChevronRight } from "lucide-react";

/**
 * The timeline behind "Restore previous version".
 */
export function VersionHistory({
  collegeSectionId,
  onRestored,
}: {
  collegeSectionId: string;
  onRestored: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRestoring, startRestore] = useTransition();

  useEffect(() => {
    if (!open) return;
    let live = true;
    fetchSectionHistory(collegeSectionId)
      .then(({ versions: rows }) => {
        if (!live) return;
        setVersions(rows);
        setError(null);
      })
      .catch((cause) => {
        if (!live) return;
        setError((cause as Error).message);
      });
    return () => {
      live = false;
    };
  }, [open, collegeSectionId]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 cursor-pointer group"
      >
        <History className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700" />
        <span>Version History & Restore</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-700" />
          <p className="text-xs font-bold text-slate-900">Version History</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}

      {versions === null && !error ? (
        <div className="space-y-2 py-1" aria-label="Loading versions">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : null}

      {versions?.length === 0 ? (
        <p className="text-xs font-medium text-slate-400 py-1">
          No earlier versions recorded yet.
        </p>
      ) : null}

      {versions?.length ? (
        <ul className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
          {versions.map((version) => (
            <li key={version.id}>
              <div className="flex items-center justify-between gap-2 rounded-xl p-2.5 transition-colors hover:bg-slate-50 border border-transparent hover:border-slate-200/80">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {TRIGGER_LABEL[version.saveTrigger] ?? "Updated"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] font-medium text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{stamp(version.savedAt)}</span>
                  </div>
                </div>

                {version.isCurrent ? (
                  <span className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/70">
                    Current
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isRestoring}
                    onClick={() =>
                      startRestore(async () => {
                        setError(null);
                        try {
                          await restoreSection(collegeSectionId, version.id);
                          setVersions(
                            (await fetchSectionHistory(collegeSectionId))
                              .versions,
                          );
                          onRestored();
                        } catch (cause) {
                          setError((cause as Error).message);
                        }
                      })
                    }
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Restore</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
