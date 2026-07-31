"use client";

import { ImageField } from "@/components/editor/fields/ImageField";
import { ScalarField } from "@/components/editor/fields/ScalarField";
import { emptyListItem, type FieldDef } from "@/lib/sections/form-fields";

type Values = Record<string, unknown>;

import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

/** Renders one field definition, recursing for repeatable lists. */
export function FieldRenderer({
  field,
  values,
  onChange,
}: {
  field: FieldDef;
  values: Values;
  onChange: (name: string, value: unknown) => void;
}) {
  const value = values[field.name];

  if (field.kind === "image") {
    return (
      <ImageField
        label={field.label}
        value={typeof value === "string" ? value : ""}
        onChange={(url) => onChange(field.name, url)}
      />
    );
  }

  if (field.kind === "list") {
    const items = Array.isArray(value) ? (value as Values[]) : [];

    const setItems = (next: Values[]) => onChange(field.name, next);

    return (
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {field.label}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {items.length} {items.length === 1 ? field.itemNoun : `${field.itemNoun}s`}
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <span className="truncate text-xs font-bold text-slate-800">
                  {String(item[field.titleField] || `Untitled ${field.itemNoun}`)}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <ListButton
                    label="Move up"
                    disabled={index === 0}
                    onClick={() => setItems(swap(items, index, index - 1))}
                  >
                    <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
                  </ListButton>
                  <ListButton
                    label="Move down"
                    disabled={index === items.length - 1}
                    onClick={() => setItems(swap(items, index, index + 1))}
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                  </ListButton>
                  <ListButton
                    label={`Remove ${field.itemNoun}`}
                    onClick={() =>
                      setItems(items.filter((_, i) => i !== index))
                    }
                    variant="danger"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </ListButton>
                </div>
              </div>

              <div className="space-y-3">
                {field.fields.map((child) => (
                  <FieldRenderer
                    key={child.name}
                    field={child}
                    values={item}
                    onChange={(childName, childValue) =>
                      setItems(
                        items.map((existing, i) =>
                          i === index
                            ? { ...existing, [childName]: childValue }
                            : existing,
                        ),
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setItems([...items, emptyListItem(field.fields)])}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 text-slate-500" />
          <span>Add {field.itemNoun}</span>
        </button>
      </div>
    );
  }

  return (
    <ScalarField
      field={field}
      value={value}
      onChange={(next) => onChange(field.name, next)}
    />
  );
}

function swap<T>(items: T[], a: number, b: number): T[] {
  const next = [...items];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

function ListButton({
  label,
  disabled,
  onClick,
  variant = "default",
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  variant?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors disabled:opacity-30 cursor-pointer ${
        variant === "danger"
          ? "border-red-100 bg-red-50/50 hover:bg-red-100/80 hover:border-red-200"
          : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}
