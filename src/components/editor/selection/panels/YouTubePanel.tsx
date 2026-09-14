"use client";

import { useState } from "react";
import { Video, Image as ImageIcon, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Youtube } from "../YouTubeIcon";

import { extractYouTubeVideoId, type AspectRatio, type YouTubeProps } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, SelectField, TextField, Toggle } from "./fields";

const RATIOS: ReadonlyArray<{ value: AspectRatio; label: string }> = [
  { value: "16 / 9", label: "16:9 (Standard)" },
  { value: "4 / 3", label: "4:3" },
  { value: "1 / 1", label: "1:1 (Square)" },
  { value: "21 / 9", label: "21:9 (Cinematic)" },
];

export interface ExtendedYouTubePanelProps extends PanelProps<YouTubeProps> {
  onReplaceMedia?: (targetType: "image" | "video" | "youtube", props?: Record<string, unknown>) => void;
}

export function YouTubePanel({ tab, props, onChange, onReplaceMedia }: ExtendedYouTubePanelProps) {
  const [urlInput, setUrlInput] = useState(props.url || "");
  const extractedId = extractYouTubeVideoId(urlInput || props.url || props.videoId || "");
  const isValid = Boolean(extractedId);

  const handleCommitUrl = (url: string) => {
    setUrlInput(url);
    const id = extractYouTubeVideoId(url);
    if (id) {
      onChange({ url, videoId: id });
    }
  };

  if (tab === "youtube") {
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
            <button
              type="button"
              onClick={() => onReplaceMedia("video")}
              title="Replace with an HTML5 video"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <Video className="h-3 w-3 text-cyan-600" />
              Video
            </button>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white shadow-xs">
              <Youtube className="h-3 w-3 text-rose-400" />
              YouTube
            </span>
          </div>
        )}

        <Divider />

        <Field label="YouTube URL">
          <div className="flex items-center gap-1.5">
            <TextField
              value={props.url || (props.videoId ? `https://www.youtube.com/watch?v=${props.videoId}` : "")}
              placeholder="https://www.youtube.com/watch?v=…"
              onCommit={handleCommitUrl}
              width="w-[220px]"
              mono
            />
            {isValid ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Valid ID: {extractedId}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 whitespace-nowrap bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <AlertCircle className="h-3 w-3" />
                Invalid URL
              </span>
            )}
          </div>
        </Field>

        {extractedId && (
          <a
            href={`https://www.youtube.com/watch?v=${extractedId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10.5px] font-bold text-slate-500 hover:text-indigo-600 transition shrink-0 ml-1"
            title="Open on YouTube"
          >
            <ExternalLink className="h-3 w-3" />
            Watch
          </a>
        )}
      </>
    );
  }

  if (tab === "settings") {
    return (
      <>
        <Toggle label="Autoplay" checked={props.autoplay} onChange={(autoplay) => onChange({ autoplay, muted: autoplay ? true : props.muted })} />
        <Divider />
        <Toggle label="Muted" checked={props.muted} onChange={(muted) => onChange({ muted })} />
        <Divider />
        <Toggle label="Loop" checked={props.loop} onChange={(loop) => onChange({ loop })} />
        <Divider />
        <Toggle label="Player controls" checked={props.controls} onChange={(controls) => onChange({ controls })} />
      </>
    );
  }

  // ratio & style
  return (
    <>
      <SelectField label="Aspect ratio" value={props.aspectRatio || "16 / 9"} options={RATIOS} onChange={(aspectRatio) => onChange({ aspectRatio })} />
      <PxField label="Radius" value={props.radius || "0px"} max={64} onChange={(radius) => onChange({ radius })} />
      <Divider />
      <PxField label="Border width" value={props.borderWidth || "0px"} max={16} onChange={(borderWidth) => onChange({ borderWidth })} />
      <ColorField label="Border color" value={props.borderColor || "#e2e8f0"} onChange={(borderColor) => onChange({ borderColor })} />
    </>
  );
}
