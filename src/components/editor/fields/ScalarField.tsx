"use client";

import type { FieldDef } from "@/lib/sections/form-fields";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-xs transition";

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
