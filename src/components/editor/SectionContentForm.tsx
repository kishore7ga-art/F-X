"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { saveSectionContent } from "@/lib/api-client";
import { FieldRenderer } from "@/components/editor/fields/FieldRenderer";
import { VersionHistory } from "@/components/editor/VersionHistory";
import { useEditor } from "@/components/editor/EditorContext";
import type { EditorSection } from "@/lib/editor/queries";
import {
  isRetryableSaveError,
  SaveQueue,
  type SaveState,
  type SaveTrigger,
} from "@/lib/editor/save-queue";
import { SECTION_FORM_FIELDS } from "@/lib/sections/form-fields";

type Values = Record<string, unknown>;

const IMMEDIATE_KINDS = new Set(["image", "boolean"]);

const TRIGGER_BY_KIND: Record<string, SaveTrigger> = {
  image: "image",
  boolean: "section_update",
  list: "section_update",
};

const clockOf = (at: number) =>
  new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function SectionContentForm({
  section,
  onClose,
}: {
  section: EditorSection;
  onClose: () => void;
}) {
  const { updateSectionContent } = useEditor();
  const fields = SECTION_FORM_FIELDS[section.sectionType];

  const [values, setValues] = useState<Values>(
    () => (section.content as Values) ?? {}
  );
  const [save, setSave] = useState<SaveState>(() =>
    section.lastSavedAt
      ? { status: "saved", at: new Date(section.lastSavedAt).getTime(), fresh: false }
      : { status: "idle" }
  );

  const latest = useRef(values);

  const queue = useMemo(
    () =>
      new SaveQueue<Values>({
        send: (payload, trigger) =>
          saveSectionContent(section.id, payload, trigger),
        onState: setSave,
        isRetryable: isRetryableSaveError,
      }),
    [section.id]
  );

  useEffect(() => {
    return () => {
      queue.flush();
      queue.dispose();
    };
  }, [queue]);

  function kindOf(name: string) {
    return fields.find((field) => field.name === name)?.kind ?? "text";
  }

  function setField(name: string, value: unknown) {
    const next = { ...latest.current, [name]: value };
    latest.current = next;
    setValues(next);
    updateSectionContent(section.id, next);

    const kind = kindOf(name);
    queue.push(
      section.id,
      next,
      TRIGGER_BY_KIND[kind] ?? "typing",
      IMMEDIATE_KINDS.has(kind)
    );
  }

  return (
    <div className="flex h-full max-h-inherit flex-col overflow-hidden bg-white text-slate-900 font-sans" key={section.id}>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto max-h-[55vh] px-4 py-3">
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            values={values}
            onChange={setField}
          />
        ))}
      </div>

      <footer className="shrink-0 space-y-2 border-t border-slate-200 px-4 py-3 bg-slate-50">
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
      <p className="text-xs text-amber-700 font-medium">
        Offline — {state.queued} change{state.queued === 1 ? "" : "s"} waiting.
        They will save when the connection returns.
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-red-600">Not saved — {state.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-bold text-red-700 transition hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  if (state.status === "saving" || state.status === "pending") {
    return <p className="text-xs text-slate-500 font-medium">Saving…</p>;
  }

  if (state.status === "saved") {
    return state.fresh ? (
      <p className="text-xs text-emerald-600 font-semibold">Saved successfully</p>
    ) : (
      <p className="text-xs text-slate-400 font-medium">Last saved {clockOf(state.at)}</p>
    );
  }

  return <p className="text-xs text-slate-400 font-medium">Changes save as you type</p>;
}
