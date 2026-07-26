"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { updateSectionContent } from "@/app/actions/sections";
import { FieldRenderer } from "@/components/editor/fields/FieldRenderer";
import { VersionHistory } from "@/components/editor/VersionHistory";
import type { EditorSection } from "@/lib/editor/queries";
import {
  isRetryableSaveError,
  SaveQueue,
  type SaveState,
  type SaveTrigger,
} from "@/lib/editor/save-queue";
import { SECTION_FORM_FIELDS } from "@/lib/sections/form-fields";

type Values = Record<string, unknown>;

/** A picked image or flipped toggle is finished the moment it happens. */
const IMMEDIATE_KINDS = new Set(["image", "boolean"]);

/** Which trigger a field's save is recorded under in version history. */
const TRIGGER_BY_KIND: Record<string, SaveTrigger> = {
  image: "image",
  boolean: "section_update",
  list: "section_update",
};

const clockOf = (at: number) =>
  new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/**
 * Content-edit form for the selected section.
 *
 * No Save button: edits go into the editor's save queue, which debounces,
 * coalesces, retries, and holds work when the connection drops. All of that
 * lives in lib/editor/save-queue so the other mutating actions can share it
 * rather than each growing their own copy.
 */
export function SectionContentForm({
  section,
  onClose,
}: {
  section: EditorSection;
  onClose: () => void;
}) {
  const fields = SECTION_FORM_FIELDS[section.sectionType];

  const [values, setValues] = useState<Values>(
    () => (section.content as Values) ?? {},
  );
  const [save, setSave] = useState<SaveState>(() =>
    section.lastSavedAt
      ? { status: "saved", at: new Date(section.lastSavedAt).getTime(), fresh: false }
      : { status: "idle" },
  );

  const latest = useRef(values);

  const queue = useMemo(
    () =>
      new SaveQueue<Values>({
        send: (payload, trigger) =>
          updateSectionContent({
            collegeSectionId: section.id,
            content: payload,
            trigger,
          }),
        onState: setSave,
        isRetryable: isRetryableSaveError,
      }),
    [section.id],
  );

  // Flush anything still queued before this form goes away, so closing the
  // panel mid-sentence keeps the sentence.
  useEffect(() => {
    return () => {
      queue.flush();
      queue.dispose();
    };
  }, [queue]);

  // There is deliberately no effect syncing `values` from `section.content`.
  // Every save revalidates and sends content back, and re-seeding from it would
  // overwrite whatever was typed while the request was in flight — the editor
  // would eat words at the speed someone types well. Selecting a different
  // section remounts this form (see the `key` in EditorShell), so the initial
  // state above is always the right starting point.

  function kindOf(name: string) {
    return fields.find((field) => field.name === name)?.kind ?? "text";
  }

  function setField(name: string, value: unknown) {
    const next = { ...latest.current, [name]: value };
    latest.current = next;
    setValues(next);

    const kind = kindOf(name);
    queue.push(
      section.id,
      next,
      TRIGGER_BY_KIND[kind] ?? "typing",
      IMMEDIATE_KINDS.has(kind),
    );
  }

  return (
    <div className="flex h-full flex-col bg-white" key={section.id}>
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/40">
            Edit section
          </p>
          <h2 className="text-sm font-bold">{section.label}</h2>
          <p className="text-xs text-black/45">Design: {section.variantName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close editor panel"
          className="rounded p-1 text-black/40 transition hover:bg-black/5 hover:text-black"
        >
          ✕
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            values={values}
            onChange={setField}
          />
        ))}
      </div>

      <footer className="space-y-2 border-t px-4 py-3">
        <SaveIndicator state={save} onRetry={() => queue.flush()} />
        <VersionHistory
          collegeSectionId={section.id}
          onRestored={() => setSave({ status: "idle" })}
        />
      </footer>
    </div>
  );
}

function SaveIndicator({
  state,
  onRetry,
}: {
  state: SaveState;
  onRetry: () => void;
}) {
  if (state.status === "offline") {
    return (
      <p className="text-xs text-amber-700">
        Offline — {state.queued} change{state.queued === 1 ? "" : "s"} waiting.
        They will save when the connection returns.
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-red-600">Not saved — {state.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
        >
          Retry
        </button>
      </div>
    );
  }

  if (state.status === "saving" || state.status === "pending") {
    return <p className="text-xs text-black/45">Saving…</p>;
  }

  if (state.status === "saved") {
    return state.fresh ? (
      <p className="text-xs text-green-700">Saved successfully</p>
    ) : (
      <p className="text-xs text-black/45">Last saved {clockOf(state.at)}</p>
    );
  }

  return <p className="text-xs text-black/35">Changes save as you type</p>;
}
