"use client";

import { useRef, useState } from "react";
import { Upload, Video, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Youtube } from "../YouTubeIcon";

import { ApiError, uploadMedia } from "@/lib/api-client";
import type { ImageProps, ObjectFit, ShadowPreset } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, RangeField, Segmented, TextField } from "./fields";

/** Mirrors the server's ceiling so the answer arrives before the upload does. */
const MAX_MEDIA_BYTES = 30 * 1024 * 1024;

const FITS: ReadonlyArray<{ value: ObjectFit; label: string; title: string }> = [
  { value: "cover", label: "Cover", title: "Fill the frame, cropping if needed" },
  { value: "contain", label: "Contain", title: "Show the whole image inside the frame" },
  { value: "fill", label: "Fill", title: "Stretch to the frame" },
];

const SHADOWS: ReadonlyArray<{ value: ShadowPreset; label: string }> = [
  { value: "none", label: "None" },
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "xl", label: "XL" },
];

export interface ExtendedImagePanelProps extends PanelProps<ImageProps> {
  onReplaceMedia?: (targetType: "image" | "video" | "youtube", props?: Record<string, unknown>) => void;
}

export function ImagePanel({ tab, props, onChange, onReplaceMedia }: ExtendedImagePanelProps) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setStatus("Please select an image or video file.");
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setStatus(`File is ${(file.size / 1024 / 1024).toFixed(1)}MB. Limit is 30MB.`);
      return;
    }

    if (file.type.startsWith("video/")) {
      setStatus(`Uploading video ${file.name}…`);
      try {
        const { url } = await uploadMedia(file);
        if (onReplaceMedia) {
          onReplaceMedia("video", { src: url });
        }
        setStatus(null);
      } catch (error) {
        setStatus(error instanceof ApiError ? `Upload failed: ${error.message}` : "Upload failed.");
      }
      return;
    }

    setStatus(`Uploading ${file.name}…`);
    try {
      const { url } = await uploadMedia(file);
      onChange({ src: url });
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof ApiError ? `Upload failed: ${error.message}` : "Upload failed.");
    }
  };

  if (tab === "media") {
    return (
      <>
        {/* Replace Media Type switcher */}
        {onReplaceMedia && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200 shrink-0">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white shadow-xs">
              <ImageIcon className="h-3 w-3" />
              Image
            </span>
            <button
              type="button"
              onClick={() => onReplaceMedia("video")}
              title="Replace this image with an HTML5 video"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <Video className="h-3 w-3 text-cyan-600" />
              Video
            </button>
            <button
              type="button"
              onClick={() => onReplaceMedia("youtube")}
              title="Replace this image with a YouTube video"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <Youtube className="h-3 w-3 text-rose-600" />
              YouTube
            </button>
          </div>
        )}

        <Divider />

        <Field label="Image URL">
          <TextField value={props.src || ""} placeholder="https://…" onCommit={(src) => onChange({ src })} width="w-[200px]" mono />
        </Field>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {status && <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{status}</span>}

        <Divider />

        <Field label="Alt text">
          <TextField value={props.alt || ""} placeholder="Describe the image" onCommit={(alt) => onChange({ alt })} width="w-[160px]" />
        </Field>

        <button
          type="button"
          onClick={() => onChange({ src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80" })}
          title="Reset to sample placeholder"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer shrink-0"
        >
          Reset Image
        </button>
      </>
    );
  }

  if (tab === "style") {
    return (
      <>
        <Field label="Link URL">
          <div className="flex items-center gap-1">
            <LinkIcon className="h-3 w-3 text-slate-400" />
            <TextField value={props.href || ""} placeholder="https://… or #section" onCommit={(href) => onChange({ href })} width="w-[170px]" mono />
          </div>
        </Field>
        <Divider />
        <PxField label="Border width" value={props.borderWidth || "0px"} max={16} onChange={(borderWidth) => onChange({ borderWidth })} />
        <ColorField label="Border color" value={props.borderColor || "#e2e8f0"} onChange={(borderColor) => onChange({ borderColor })} />
        <Divider />
        <Segmented label="Shadow" value={props.shadow || "none"} options={SHADOWS} onChange={(shadow) => onChange({ shadow })} />
        <PxField label="Padding" value={props.padding || "0px"} max={48} onChange={(padding) => onChange({ padding })} />
        <RangeField label="Opacity" value={props.opacity || "1"} min={0.1} max={1} step={0.05} fallback={1} onChange={(opacity) => onChange({ opacity })} />
      </>
    );
  }

  // fit & radius
  return (
    <>
      <Segmented label="Fit" value={props.objectFit || "cover"} options={FITS} onChange={(objectFit) => onChange({ objectFit })} />
      <PxField label="Radius" value={props.radius || "0px"} max={64} onChange={(radius) => onChange({ radius })} />
    </>
  );
}
