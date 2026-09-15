"use client";

import type { ButtonProps, ButtonSize } from "@/lib/editor/element-resolver";
import { calculateOppositeContrast } from "@/lib/editor-themes";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, Segmented, TextField, Toggle } from "./fields";

const SIZES: ReadonlyArray<{ value: ButtonSize; label: string }> = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
];

export function ButtonPanel({ props, onChange }: PanelProps<ButtonProps>) {
  const handleFillChange = (background: string) => {
    const textColor = calculateOppositeContrast(background).textColor;
    onChange({ background, textColor });
  };

  return (
    <>
      <Field label="Link">
        <TextField
          value={props.href}
          placeholder="/admissions or https://…"
          onCommit={(href) => onChange({ href })}
          width="w-[180px]"
          mono
        />
      </Field>
      <Toggle
        label="New tab"
        checked={Boolean(props.newTab)}
        onChange={(newTab) => onChange({ newTab })}
      />
      <Divider />
      <Segmented label="Size" value={props.size} options={SIZES} onChange={(size) => onChange({ size })} />
      <Divider />
      <ColorField
        label="Fill"
        value={props.background}
        fallback="#2563eb"
        onChange={handleFillChange}
      />
      <PxField label="Radius" value={props.radius} max={50} onChange={(radius) => onChange({ radius })} />
    </>
  );
}

