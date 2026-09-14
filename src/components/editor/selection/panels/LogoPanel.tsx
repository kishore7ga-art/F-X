"use client";

import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, Sparkles } from "lucide-react";

import { ApiError, uploadMedia } from "@/lib/api-client";
import type { LogoProps } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, TextField } from "./fields";

export function LogoPanel({ tab, props, onChange }: PanelProps<LogoProps>) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setStatus(`Uploading ${file.name}…`);
    try {
      const { url } = await uploadMedia(file);
      onChange({ src: url });
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof ApiError ? `Upload failed: ${error.message}` : "Upload failed.");
    }
  };

  if (tab === "logo") {
    return (
      <>
        <Field label="Logo Image">
          <TextField value={props.src || ""} placeholder="https://… (optional for text logo)" onCommit={(src) => onChange({ src })} width="w-[180px]" mono />
        </Field>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload Logo
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

        <Field label="Brand Text">
          <TextField value={props.text || ""} placeholder="Institution / Brand name" onCommit={(text) => onChange({ text })} width="w-[140px]" />
        </Field>

        <PxField label="Logo height" value={props.size || "40px"} min={20} max={120} onChange={(size) => onChange({ size })} />
      </>
    );
  }

  // style & link
  return (
    <>
      <Field label="Link">
        <div className="flex items-center gap-1">
          <LinkIcon className="h-3 w-3 text-slate-400" />
          <TextField value={props.href || "/"} placeholder="/" onCommit={(href) => onChange({ href })} width="w-[140px]" mono />
        </div>
      </Field>
      <Divider />
      <ColorField label="Color" value={props.color || "#0f172a"} onChange={(color) => onChange({ color })} />
      <ColorField label="Background" value={props.background || "transparent"} allowEmpty onChange={(background) => onChange({ background })} />
      <PxField label="Radius" value={props.radius || "0px"} max={48} onChange={(radius) => onChange({ radius })} />
      <PxField label="Padding" value={props.padding || "0px"} max={32} onChange={(padding) => onChange({ padding })} />
    </>
  );
}
