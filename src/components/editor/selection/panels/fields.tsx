"use client";

/**
 * The handful of field shapes every element panel is built from. Styled to
 * sit in the same row as the section toolbar's controls, so switching from a
 * section to a button inside it changes the fields and nothing else.
 */

import { useState } from "react";
import { hexFromValue } from "@/lib/sections/section-edit";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
      <span className="text-[10.5px] font-bold text-slate-500 whitespace-nowrap">{label}</span>
      {children}
    </div>
  );
}

export function ColorField({
  label,
  value,
  fallback = "#000000",
  allowEmpty = false,
  onChange,
}: {
  label: string;
  value: string;
  fallback?: string;
  /** Shows a "none" button that clears the value (hover colours, borders). */
  allowEmpty?: boolean;
  onChange: (value: string) => void;
}) {
  const hex = hexFromValue(value, fallback);
  return (
    <Field label={label}>
      <div className="relative w-[22px] h-[22px] rounded-[6px] border border-slate-300 shadow-xs overflow-hidden cursor-pointer shrink-0">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
          aria-label={label}
        />
        <div className="w-full h-full" style={{ background: value ? hex : "repeating-linear-gradient(45deg,#e2e8f0 0 4px,#fff 4px 8px)" }} />
      </div>
      <TextField value={value} placeholder={allowEmpty ? "none" : hex} onCommit={onChange} width="w-[70px]" mono />
      {allowEmpty && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-[10px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer"
          title="Clear"
        >
          ✕
        </button>
      )}
    </Field>
  );
}

/**
 * A text input that commits on Enter or blur. Holds its own draft: a
 * controlled input re-derived from the element on every keystroke would hand
 * the caret back to the end of a normalised string.
 */
export function TextField({
  value,
  placeholder,
  onCommit,
  width = "w-[140px]",
  mono = false,
}: {
  value: string;
  placeholder?: string;
  onCommit: (value: string) => void;
  width?: string;
  mono?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  // The draft follows a new value from the element (a commit elsewhere, an undo).
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setDraft(value);
  }
  const commit = () => {
    if (draft !== value) onCommit(draft);
  };
  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={`${width} rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 outline-none focus:border-indigo-400 ${mono ? "font-mono" : "font-medium"}`}
    />
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string; title?: string }>;
  onChange: (value: T) => void;
}) {
  const row = (
    <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 shrink-0">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
            opt.value === value ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
  return label ? <Field label={label}>{row}</Field> : row;
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 outline-none focus:border-indigo-400 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** A numeric px value with a slider: radius, padding, font size. */
export function PxField({
  label,
  value,
  min = 0,
  max = 64,
  onChange,
}: {
  label: string;
  value: string;
  min?: number;
  max?: number;
  onChange: (value: string) => void;
}) {
  const numeric = Math.min(max, Math.max(min, parseFloat(value) || 0));
  return (
    <Field label={label}>
      <input
        type="range"
        min={min}
        max={max}
        value={numeric}
        onChange={(e) => onChange(`${e.target.value}px`)}
        className="w-20 accent-slate-900 cursor-pointer"
        aria-label={label}
      />
      <TextField value={value} onCommit={onChange} width="w-[56px]" mono />
    </Field>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-1.5 shrink-0 text-[10.5px] font-bold text-slate-600 cursor-pointer"
    >
      <span className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors ${checked ? "bg-slate-900 justify-end" : "bg-slate-300 justify-start"}`}>
        <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
      </span>
      {label}
    </button>
  );
}

export const Divider = () => <div className="h-5 w-px bg-slate-200 shrink-0" />;
