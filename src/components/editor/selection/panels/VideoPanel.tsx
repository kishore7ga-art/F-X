"use client";

import { useRef, useState } from "react";
import { Upload, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { Youtube } from "../YouTubeIcon";

import { ApiError, uploadMedia } from "@/lib/api-client";
import type { AspectRatio, ObjectFit, VideoProps } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, Segmented, SelectField, TextField, Toggle } from "./fields";

const MAX_MEDIA_BYTES = 30 * 1024 * 1024;

const RATIOS: ReadonlyArray<{ value: AspectRatio; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "16 / 9", label: "16:9" },
  { value: "4 / 3", label: "4:3" },
  { value: "1 / 1", label: "1:1" },
  { value: "21 / 9", label: "21:9" },
];

const FITS: ReadonlyArray<{ value: ObjectFit; label: string; title: string }> = [
  { value: "cover", label: "Cover", title: "Fill the frame, cropping if needed" },
  { value: "contain", label: "Contain", title: "Show the whole video inside the frame" },
  { value: "fill", label: "Fill", title: "Stretch to the frame" },
];

export interface ExtendedVideoPanelProps extends PanelProps<VideoProps> {
  onReplaceMedia?: (targetType: "image" | "video" | "youtube", props?: Record<string, unknown>) => void;
}

export function VideoPanel({ tab, props, onChange, onReplaceMedia }: ExtendedVideoPanelProps) {
  const videoFileInput = useRef<HTMLInputElement | null>(null);
  const posterFileInput = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const onUploadVideo = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MEDIA_BYTES) {
      setStatus(`Video is ${(file.size / 1024 / 1024).toFixed(1)}MB. Limit is 30MB.`);
      return;
    }
    setStatus(`Uploading video ${file.name}…`);
    try {
      const { url } = await uploadMedia(file);
      onChange({ src: url });
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof ApiError ? `Upload failed: ${error.message}` : "Upload failed.");
    }
  };

  const onUploadPoster = async (file: File | undefined) => {
    if (!file) return;
    setStatus(`Uploading poster ${file.name}…`);
    try {
      const { url } = await uploadMedia(file);
      onChange({ poster: url });
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof ApiError ? `Upload failed: ${error.message}` : "Upload failed.");
    }
  };

  if (tab === "media") {
    return (
      <>
        {/* Media Switcher */}
        {onReplaceMedia && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => onReplaceMedia("image")}
              title="Replace with an image"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <ImageIcon className="h-3 w-3 text-emerald-600" />
              Image
            </button>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white shadow-xs">
              <VideoIcon className="h-3 w-3" />
              Video
            </span>
            <button
              type="button"
              onClick={() => onReplaceMedia("youtube")}
              title="Replace with a YouTube video"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <Youtube className="h-3 w-3 text-rose-600" />
              YouTube
            </button>
          </div>
        )}

        <Divider />

        <Field label="Video URL">
          <TextField
            value={props.src || ""}
            placeholder="https://… (.mp4 / .webm)"
            onCommit={(src) => onChange({ src })}
            width="w-[180px]"
            mono
          />
        </Field>

        <button
          type="button"
          onClick={() => videoFileInput.current?.click()}
          className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload MP4
        </button>
        <input
          ref={videoFileInput}
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          className="hidden"
          onChange={(e) => {
            void onUploadVideo(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <Divider />

        <Field label="Poster image">
          <TextField
            value={props.poster || ""}
            placeholder="Poster URL (optional)"
            onCommit={(poster) => onChange({ poster })}
            width="w-[140px]"
            mono
          />
        </Field>

        <button
          type="button"
          onClick={() => posterFileInput.current?.click()}
          className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer shrink-0"
        >
          <Upload className="h-3 w-3" />
          Poster
        </button>
        <input
          ref={posterFileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void onUploadPoster(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {status && <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{status}</span>}
      </>
    );
  }

  if (tab === "playback") {
    return (
      <>
        <Toggle label="Autoplay" checked={props.autoplay} onChange={(autoplay) => onChange({ autoplay, muted: autoplay ? true : props.muted })} />
        <Divider />
        <Toggle label="Muted" checked={props.muted} onChange={(muted) => onChange({ muted })} />
        <Divider />
        <Toggle label="Loop" checked={props.loop} onChange={(loop) => onChange({ loop })} />
        <Divider />
        <Toggle label="Controls" checked={props.controls} onChange={(controls) => onChange({ controls })} />
        <Divider />
        <Toggle label="Plays inline" checked={props.playsInline} onChange={(playsInline) => onChange({ playsInline })} />
      </>
    );
  }

  // ratio & style
  return (
    <>
      <SelectField label="Aspect ratio" value={props.aspectRatio || "16 / 9"} options={RATIOS} onChange={(aspectRatio) => onChange({ aspectRatio })} />
      <Segmented label="Fit" value={props.objectFit || "cover"} options={FITS} onChange={(objectFit) => onChange({ objectFit })} />
      <PxField label="Radius" value={props.radius || "0px"} max={64} onChange={(radius) => onChange({ radius })} />
      <Divider />
      <PxField label="Border width" value={props.borderWidth || "0px"} max={16} onChange={(borderWidth) => onChange({ borderWidth })} />
      <ColorField label="Border color" value={props.borderColor || "#e2e8f0"} onChange={(borderColor) => onChange({ borderColor })} />
    </>
  );
}
