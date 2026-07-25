"use client";

import type { FieldDef } from "@/lib/sections/form-fields";

const inputClass =
  "mt-1 w-full rounded border border-black/15 px-2.5 py-1.5 text-sm outline-none focus:border-black";

/** Renders the non-list, non-image field kinds. */
export function ScalarField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldDef, { kind: "text" | "textarea" | "boolean" }>;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.kind === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4"
        />
        <span className="font-semibold text-black/70">{field.label}</span>
      </label>
    );
  }

  const text = typeof value === "string" ? value : "";

  return (
    <label className="block">
      <span className="text-xs font-semibold text-black/60">{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea
          value={text}
          rows={field.rows ?? 3}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={text}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );
}
