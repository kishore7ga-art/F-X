"use client";

import { useRef, useState } from "react";
import {
  Upload,
  Video as VideoIcon,
  Image as ImageIcon,
  Trash2,
  Plus,
  Layers,
  Type,
  AlignLeft,
  Square,
} from "lucide-react";
import { Youtube } from "../YouTubeIcon";

import { ApiError, uploadMedia } from "@/lib/api-client";
import type { CardProps } from "@/lib/editor/element-resolver";
import { SHADOW_PRESETS } from "@/lib/editor/element-resolver";
import { ColorField, Divider, PxField, Segmented, TextField, Field } from "./fields";

export type PanelProps<P> = {
  tab: string;
  props: P;
  onChange: (patch: Partial<P>) => void;
};

export interface ExtendedCardPanelProps extends PanelProps<CardProps> {
  onAddMedia?: (
    mediaType: "image" | "video" | "youtube",
    initialProps?: Record<string, unknown>,
    position?: "top" | "bottom" | "left" | "right",
  ) => void;
  onRemoveMedia?: () => void;
  onSelectChildMedia?: () => void;
  onInsertChild?: (childType: "heading" | "text" | "button") => void;
}

const SHADOW_OPTIONS = SHADOW_PRESETS.map((value) => ({
  value,
  label: value === "none" ? "None" : value.toUpperCase(),
}));

const MAX_MEDIA_BYTES = 30 * 1024 * 1024;

export function CardPanel({
  tab,
  props,
  onChange,
  onAddMedia,
  onRemoveMedia,
  onSelectChildMedia,
  onInsertChild,
}: ExtendedCardPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [mediaPosition, setMediaPosition] = useState<"top" | "bottom" | "left" | "right">("top");
  const [customUrl, setCustomUrl] = useState<string>("");

  const handleFileUpload = async (file: File | undefined) => {
    if (!file || !onAddMedia) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setStatus("Please select an image or video file.");
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setStatus(`File is ${(file.size / 1024 / 1024).toFixed(1)}MB. Limit is 30MB.`);
      return;
    }

    const isVideo = file.type.startsWith("video/");
    setStatus(`Uploading ${isVideo ? "video" : "image"} ${file.name}…`);
    try {
      const { url } = await uploadMedia(file);
      onAddMedia(isVideo ? "video" : "image", { src: url }, mediaPosition);
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof ApiError ? `Upload failed: ${error.message}` : "Upload failed.");
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrl.trim() || !onAddMedia) return;
    const url = customUrl.trim();
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      onAddMedia("youtube", { url }, mediaPosition);
    } else if (/\.(mp4|webm|ogg|mov)($|\?)/i.test(url)) {
      onAddMedia("video", { src: url }, mediaPosition);
    } else {
      onAddMedia("image", { src: url }, mediaPosition);
    }
    setCustomUrl("");
  };

  if (tab === "media") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {props.hasMedia ? (
          <>
            {/* Current Media Indicator */}
            <div className="flex items-center gap-1.5 bg-violet-50 text-violet-800 border border-violet-200 px-2.5 py-1 rounded-full text-[10.5px] font-semibold">
              {props.mediaType === "video" ? (
                <VideoIcon className="h-3 w-3 text-cyan-600" />
              ) : props.mediaType === "youtube" ? (
                <Youtube className="h-3 w-3 text-rose-600" />
              ) : (
                <ImageIcon className="h-3 w-3 text-emerald-600" />
              )}
              <span className="capitalize">{props.mediaType || "Image"} in Card</span>
            </div>

            {/* Direct selector to inspect & edit child media */}
            {onSelectChildMedia && (
              <button
                type="button"
                onClick={onSelectChildMedia}
                title="Select the media element directly to edit ratio, object-fit, or playback"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-900 text-white hover:bg-slate-700 transition cursor-pointer shadow-xs shrink-0"
              >
                <Layers className="h-3 w-3 text-slate-300" />
                Edit Media Settings
              </button>
            )}

            <Divider />

            {/* Replace Options */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 px-1.5">Replace:</span>
              <button
                type="button"
                onClick={() => onAddMedia?.("image", undefined, mediaPosition)}
                title="Replace with an image"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                  props.mediaType === "image"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                <ImageIcon className="h-3 w-3 text-emerald-600" />
                Image
              </button>
              <button
                type="button"
                onClick={() => onAddMedia?.("video", undefined, mediaPosition)}
                title="Replace with an HTML5 video"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                  props.mediaType === "video"
                    ? "bg-white text-cyan-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                <VideoIcon className="h-3 w-3 text-cyan-600" />
                Video
              </button>
              <button
                type="button"
                onClick={() => onAddMedia?.("youtube", undefined, mediaPosition)}
                title="Replace with a YouTube video"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                  props.mediaType === "youtube"
                    ? "bg-white text-rose-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                <Youtube className="h-3 w-3 text-rose-600" />
                YouTube
              </button>
            </div>

            {/* Upload New File to Replace */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10.5px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0 shadow-xs"
            >
              <Upload className="h-3 w-3 text-slate-500" />
              Upload New
            </button>

            <Divider />

            {/* Remove Media from Card */}
            {onRemoveMedia && (
              <button
                type="button"
                onClick={onRemoveMedia}
                title="Remove media from this card while keeping all text and styling"
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer shrink-0"
              >
                <Trash2 className="h-3 w-3 text-rose-500" />
                Remove Media
              </button>
            )}
          </>
        ) : (
          <>
            {/* No Media - Add Media Options */}
            {/* Add Image Button */}
            <button
              type="button"
              onClick={() => onAddMedia?.("image", undefined, mediaPosition)}
              className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition cursor-pointer shrink-0 shadow-xs"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Add Image
            </button>

            {/* Add Video Button */}
            <button
              type="button"
              onClick={() => onAddMedia?.("video", undefined, mediaPosition)}
              className="flex items-center gap-1 rounded-full bg-cyan-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-cyan-700 transition cursor-pointer shrink-0 shadow-xs"
            >
              <VideoIcon className="h-3.5 w-3.5" />
              Add Video
            </button>

            {/* Add YouTube Button */}
            <button
              type="button"
              onClick={() => onAddMedia?.("youtube", undefined, mediaPosition)}
              className="flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition cursor-pointer shrink-0 shadow-xs"
            >
              <Youtube className="h-3.5 w-3.5" />
              Add YouTube
            </button>

            <Divider />

            {/* Upload directly */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload File
            </button>

            <Divider />

            {/* Custom URL Input */}
            <div className="flex items-center gap-1">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Paste Image/Video URL…"
                className="w-[180px] rounded-lg border border-slate-200 px-2 py-1 text-[10.5px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCustomUrl();
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomUrl}
                disabled={!customUrl.trim()}
                className="flex items-center justify-center p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition cursor-pointer"
                title="Insert media from URL"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}

        {/* Child Elements insertion into Card */}
        {onInsertChild && (
          <>
            <Divider />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add:</span>
              <button
                type="button"
                onClick={() => onInsertChild("heading")}
                title="Add a heading to this card"
                className="flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50/70 hover:bg-pink-100 text-pink-700 px-2.5 py-1 text-[10.5px] font-bold transition cursor-pointer shadow-2xs shrink-0"
              >
                <Type className="h-3 w-3 text-pink-500" />
                + Heading
              </button>
              <button
                type="button"
                onClick={() => onInsertChild("text")}
                title="Add a paragraph to this card"
                className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-700 px-2.5 py-1 text-[10.5px] font-bold transition cursor-pointer shadow-2xs shrink-0"
              >
                <AlignLeft className="h-3 w-3 text-amber-500" />
                + Text
              </button>
              <button
                type="button"
                onClick={() => onInsertChild("button")}
                title="Add a button to this card"
                className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 text-[10.5px] font-bold transition cursor-pointer shadow-2xs shrink-0"
              >
                <Square className="h-3 w-3 text-indigo-500" />
                + Button
              </button>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => {
            void handleFileUpload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {status && (
          <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{status}</span>
        )}
      </div>
    );
  }

  if (tab === "style") {
    return (
      <>
        <ColorField
          label="Card background"
          value={props.background}
          fallback="#ffffff"
          onChange={(background) => onChange({ background })}
        />
        <PxField label="Corner radius" value={props.radius} max={48} onChange={(radius) => onChange({ radius })} />
        <Divider />
        <Segmented label="Shadow" value={props.shadow} options={SHADOW_OPTIONS} onChange={(shadow) => onChange({ shadow })} />
      </>
    );
  }
  if (tab === "border") {
    return (
      <>
        <PxField label="Border width" value={props.borderWidth} max={8} onChange={(borderWidth) => onChange({ borderWidth })} />
        <ColorField
          label="Border colour"
          value={props.borderColor}
          fallback="#e2e8f0"
          onChange={(borderColor) => onChange({ borderColor })}
        />
      </>
    );
  }

  return null;
}
