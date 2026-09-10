"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { ApiError, uploadImage } from "@/lib/api-client";
import type { AspectRatio, ImageProps, ObjectFit } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { Divider, Field, PxField, Segmented, SelectField, TextField } from "./fields";

/** Mirrors the server's ceiling so the answer arrives before the upload does. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const RATIOS: ReadonlyArray<{ value: AspectRatio; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "1 / 1", label: "1:1" },
  { value: "4 / 3", label: "4:3" },
  { value: "3 / 2", label: "3:2" },
  { value: "16 / 9", label: "16:9" },
  { value: "21 / 9", label: "21:9" },
];

const FITS: ReadonlyArray<{ value: ObjectFit; label: string; title: string }> = [
  { value: "cover", label: "Cover", title: "Fill the frame, cropping if needed" },
  { value: "contain", label: "Contain", title: "Show the whole image inside the frame" },
  { value: "fill", label: "Fill", title: "Stretch to the frame" },
];

export function ImagePanel({ tab, props, onChange }: PanelProps<ImageProps>) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("That file is not an image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setStatus(`That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 5MB.`);
      return;
    }
    setStatus(`Uploading ${file.name}…`);
    try {
      const { url } = await uploadImage(file);
      onChange({ src: url });
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof ApiError ? `Could not upload: ${error.message}` : "Could not upload. Check your connection.");
    }
  };

  if (tab === "media") {
    return (
      <>
        <Field label="Image URL">
          <TextField value={props.src} placeholder="https://…" onCommit={(src) => onChange({ src })} width="w-[260px]" mono />
        </Field>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-700 transition cursor-pointer shrink-0"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {status && <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{status}</span>}
        <Divider />
        <Field label="Alt text">
          <TextField value={props.alt} placeholder="Describe the image" onCommit={(alt) => onChange({ alt })} width="w-[200px]" />
        </Field>
      </>
    );
  }
  // layout
  return (
    <>
      <SelectField label="Aspect ratio" value={props.aspectRatio} options={RATIOS} onChange={(aspectRatio) => onChange({ aspectRatio })} />
      <Segmented label="Fit" value={props.objectFit} options={FITS} onChange={(objectFit) => onChange({ objectFit })} />
      <PxField label="Radius" value={props.radius} max={64} onChange={(radius) => onChange({ radius })} />
    </>
  );
}
