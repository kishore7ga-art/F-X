"use client";

import type { FieldDef } from "@/lib/sections/form-fields";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition-all duration-150";

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
      <label className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/30 p-3 hover:bg-slate-50/80 transition-colors cursor-pointer group">
        <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">{field.label}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
        />
      </label>
    );
  }

  const text = typeof value === "string" ? value : "";

  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-[11px]">{field.label}</span>
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
