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

/**
 * The timeline behind "Restore previous version".
 *
 * Loaded when opened rather than with the editor: most sessions never ask for
 * it, and it is a query per section that would otherwise run on every render.
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

  // State is only ever written from the resolved promise, never synchronously
  // in the effect body. A different section remounts the whole editor panel,
  // so there is no stale timeline to clear here either.
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
        className="text-xs font-semibold text-black/45 underline-offset-2 transition hover:text-black hover:underline"
      >
        Version history
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-black/60">Version history</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-black/40 transition hover:text-black"
        >
          Close
        </button>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {versions === null && !error ? (
        <div className="space-y-1.5" aria-label="Loading versions">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-7 animate-pulse rounded bg-black/5" />
          ))}
        </div>
      ) : null}

      {versions?.length === 0 ? (
        <p className="text-xs text-black/45">
          No earlier versions yet. Every edit from now on is kept here.
        </p>
      ) : null}

      {versions?.length ? (
        <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {versions.map((version) => (
            <li key={version.id}>
              <div className="flex items-center justify-between gap-2 rounded px-2 py-1.5 transition hover:bg-black/5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">
                    {TRIGGER_LABEL[version.saveTrigger] ?? "Updated"}
                  </p>
                  <p className="text-[11px] text-black/45">
                    {stamp(version.savedAt)}
                  </p>
                </div>
                {version.isCurrent ? (
                  <span className="shrink-0 text-[11px] font-semibold text-green-700">
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
                    className="shrink-0 rounded border px-2 py-1 text-[11px] font-semibold transition hover:bg-black/5 disabled:opacity-50"
                  >
                    Restore
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
