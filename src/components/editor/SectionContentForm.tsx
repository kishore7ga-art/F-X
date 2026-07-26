"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { updateSectionContent } from "@/app/actions/sections";
import { FieldRenderer } from "@/components/editor/fields/FieldRenderer";
import type { EditorSection } from "@/lib/editor/queries";
import { SECTION_FORM_FIELDS } from "@/lib/sections/form-fields";

type Values = Record<string, unknown>;

type SaveState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "saving" }
  | { status: "saved"; at: number }
  | { status: "error"; message: string; attempt: number };

/** Typing settles before we write; a discrete click has nothing to settle. */
const TYPING_DEBOUNCE_MS = 800;
const IMMEDIATE_KINDS = new Set(["image", "boolean"]);

/** 1s, 2s, 4s, 8s, capped — enough to ride out a redeploy without spinning. */
const retryDelay = (attempt: number) => Math.min(2 ** attempt * 1000, 15_000);

const clockOf = (at: number) =>
  new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/**
 * Content-edit form for the selected section. Fields come from the section
 * type's descriptor; the server re-validates against its Zod schema on save.
 *
 * There is no Save button. Every edit is written on its own — typing after it
 * settles, a picked image or a flipped toggle at once — and the footer says
 * where each write got to. A failed save keeps retrying with backoff and keeps
 * saying so, because the one thing worse than an editor that loses work is one
 * that loses work while showing "Saved".
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
      ? { status: "saved", at: new Date(section.lastSavedAt).getTime() }
      : { status: "idle" },
  );

  // The newest values, readable from a timer without re-arming it on every
  // keystroke. State drives the render; this drives the write.
  const latest = useRef(values);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);

  const flush = useCallback(async () => {
    const mine = ++generation.current;
    setSave({ status: "saving" });

    try {
      const { savedAt } = await updateSectionContent({
        collegeSectionId: section.id,
        content: latest.current,
      });
      // A newer edit already started saving; its result is the one that counts.
      if (mine !== generation.current) return;
      setSave({ status: "saved", at: new Date(savedAt).getTime() });
    } catch (cause) {
      if (mine !== generation.current) return;
      const message =
        cause instanceof Error
          ? cause.message
          : "Could not save. Check the highlighted fields.";
      setSave((current) => {
        const attempt = current.status === "error" ? current.attempt + 1 : 1;
        // Validation failures are not transient — retrying an invalid field
        // forever would just hammer the server with the same rejection.
        if (!isTransient(cause)) return { status: "error", message, attempt: 0 };
        timer.current = setTimeout(flush, retryDelay(attempt));
        return { status: "error", message, attempt };
      });
    }
  }, [section.id]);

  const schedule = useCallback(
    (immediate: boolean) => {
      if (timer.current) clearTimeout(timer.current);
      setSave({ status: "pending" });
      timer.current = setTimeout(flush, immediate ? 0 : TYPING_DEBOUNCE_MS);
    },
    [flush],
  );

  function setField(name: string, value: unknown) {
    const next = { ...latest.current, [name]: value };
    latest.current = next;
    setValues(next);
    schedule(IMMEDIATE_KINDS.has(kindOf(name) ?? ""));
  }

  function kindOf(name: string) {
    return fields.find((field) => field.name === name)?.kind;
  }

  // Re-seed only when a different section is selected. Deliberately not on
  // `section.content`: every autosave revalidates and sends content back, and
  // re-seeding from it would overwrite whatever was typed in the meantime.
  useEffect(() => {
    const seeded = (section.content as Values) ?? {};
    latest.current = seeded;
    setValues(seeded);
    setSave(
      section.lastSavedAt
        ? { status: "saved", at: new Date(section.lastSavedAt).getTime() }
        : { status: "idle" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id]);

  // Write anything still pending before this form goes away, so closing the
  // panel mid-sentence does not discard the sentence.
  useEffect(
    () => () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
      void updateSectionContent({
        collegeSectionId: section.id,
        content: latest.current,
      }).catch(() => {
        // Nothing left to tell: the form is unmounting.
      });
    },
    [section.id],
  );

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

      <footer className="border-t px-4 py-3">
        <SaveIndicator
          state={save}
          onRetry={() => {
            if (timer.current) clearTimeout(timer.current);
            void flush();
          }}
        />
      </footer>
    </div>
  );
}

/**
 * A rejected Zod schema will be rejected identically forever, so only network
 * and server faults are worth retrying.
 */
function isTransient(cause: unknown): boolean {
  const message = cause instanceof Error ? cause.message.toLowerCase() : "";
  return !/required|invalid|must be|expected|too short|too long/.test(message);
}

function SaveIndicator({
  state,
  onRetry,
}: {
  state: SaveState;
  onRetry: () => void;
}) {
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
    return (
      <p className="text-xs text-black/45">
        <span className="text-green-700">Saved</span> {clockOf(state.at)}
      </p>
    );
  }

  return <p className="text-xs text-black/35">Changes save as you type</p>;
}
