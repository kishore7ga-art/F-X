"use client";

import { Image as ImageIcon, Video, Star, MousePointerClick } from "lucide-react";
import { Youtube } from "../YouTubeIcon";
import type { PlusProps } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";

export interface ExtendedPlusPanelProps extends PanelProps<PlusProps> {
  onInsertElement?: (targetType: "image" | "video" | "youtube" | "icon" | "button") => void;
}

export function PlusPanel({ tab, props, onChange, onInsertElement }: ExtendedPlusPanelProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold text-slate-500 mr-1">Insert into this spot:</span>

      <button
        type="button"
        onClick={() => onInsertElement?.("image")}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-800 shadow-xs hover:border-emerald-400 hover:text-emerald-700 transition cursor-pointer"
      >
        <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
        Image
      </button>

      <button
        type="button"
        onClick={() => onInsertElement?.("video")}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-800 shadow-xs hover:border-cyan-400 hover:text-cyan-700 transition cursor-pointer"
      >
        <Video className="h-3.5 w-3.5 text-cyan-600" />
        Video
      </button>

      <button
        type="button"
        onClick={() => onInsertElement?.("youtube")}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-800 shadow-xs hover:border-rose-400 hover:text-rose-700 transition cursor-pointer"
      >
        <Youtube className="h-3.5 w-3.5 text-rose-600" />
        YouTube
      </button>

      <button
        type="button"
        onClick={() => onInsertElement?.("icon")}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-800 shadow-xs hover:border-purple-400 hover:text-purple-700 transition cursor-pointer"
      >
        <Star className="h-3.5 w-3.5 text-purple-600" />
        Icon
      </button>

      <button
        type="button"
        onClick={() => onInsertElement?.("button")}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-800 shadow-xs hover:border-indigo-400 hover:text-indigo-700 transition cursor-pointer"
      >
        <MousePointerClick className="h-3.5 w-3.5 text-indigo-600" />
        Button
      </button>
    </div>
  );
}
