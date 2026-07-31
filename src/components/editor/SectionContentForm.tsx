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

import { CheckCircle2, Loader2, AlertCircle, WifiOff } from "lucide-react";

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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white text-slate-900 font-sans" key={section.id}>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            values={values}
            onChange={setField}
          />
        ))}
      </div>

      <footer className="shrink-0 border-t border-slate-100 px-6 py-4 bg-slate-50/60 backdrop-blur-xs space-y-3">
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
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50/80 border border-amber-200/70 rounded-xl p-2.5">
        <WifiOff className="h-4 w-4 shrink-0 text-amber-600" />
        <p className="flex-1">
          Offline — {state.queued} change{state.queued === 1 ? "" : "s"} waiting.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-red-700 bg-red-50/80 border border-red-200/70 rounded-xl p-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="truncate">Not saved — {state.message}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (state.status === "saving" || state.status === "pending") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
        <span>Saving changes…</span>
      </div>
    );
  }

  if (state.status === "saved") {
    return state.fresh ? (
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        <span>Saved successfully</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <span>Last saved {clockOf(state.at)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      <span>Changes save automatically as you type</span>
    </div>
  );
}
