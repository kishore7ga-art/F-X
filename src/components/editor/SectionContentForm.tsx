"use client";

import { useEffect, useState, useTransition } from "react";

import { updateSectionContent } from "@/app/actions/sections";
import { FieldRenderer } from "@/components/editor/fields/FieldRenderer";
import type { EditorSection } from "@/lib/editor/queries";
import { SECTION_FORM_FIELDS } from "@/lib/sections/form-fields";

type Values = Record<string, unknown>;

/** Content-edit form for the selected section. Fields come from the section
 * type's descriptor; the server re-validates against its Zod schema on save. */
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
  const [isSaving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Re-seed the form when a different section is selected, or when the server
  // sends back fresh content after a save.
  useEffect(() => {
    setValues((section.content as Values) ?? {});
    setError(null);
  }, [section.id, section.content]);

  function setField(name: string, value: unknown) {
    setValues((current) => ({ ...current, [name]: value }));
    setSavedAt(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startSaving(async () => {
      try {
        await updateSectionContent({
          collegeSectionId: section.id,
          content: values,
        });
        setSavedAt(Date.now());
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not save. Check the highlighted fields.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col bg-white"
      key={section.id}
    >
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
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {savedAt && !isSaving ? (
          <p className="text-xs text-green-700">Saved.</p>
        ) : null}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </footer>
    </form>
  );
}
