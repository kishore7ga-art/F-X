"use client";

import { ImageField } from "@/components/editor/fields/ImageField";
import { ScalarField } from "@/components/editor/fields/ScalarField";
import { emptyListItem, type FieldDef } from "@/lib/sections/form-fields";

type Values = Record<string, unknown>;

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
      <fieldset className="rounded-lg border border-black/10 p-3">
        <legend className="px-1 text-xs font-bold uppercase tracking-widest text-black/45">
          {field.label}
        </legend>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-md border border-black/10 bg-black/[0.02] p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-black/60">
                  {String(item[field.titleField] || `Untitled ${field.itemNoun}`)}
                </span>
                <div className="flex shrink-0 gap-1">
                  <ListButton
                    label="Move up"
                    disabled={index === 0}
                    onClick={() => setItems(swap(items, index, index - 1))}
                  >
                    ▲
                  </ListButton>
                  <ListButton
                    label="Move down"
                    disabled={index === items.length - 1}
                    onClick={() => setItems(swap(items, index, index + 1))}
                  >
                    ▼
                  </ListButton>
                  <ListButton
                    label={`Remove ${field.itemNoun}`}
                    onClick={() =>
                      setItems(items.filter((_, i) => i !== index))
                    }
                  >
                    ✕
                  </ListButton>
                </div>
              </div>

              <div className="space-y-2.5">
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
          className="mt-3 w-full rounded-md border border-dashed border-black/25 py-2 text-xs font-semibold text-black/60 transition hover:border-black hover:text-black"
        >
          + Add {field.itemNoun}
        </button>
      </fieldset>
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
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded border border-black/15 bg-white text-[10px] text-black/60 transition hover:text-black disabled:opacity-30"
    >
      {children}
    </button>
  );
}
