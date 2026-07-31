"use client";

import { useRef, useState } from "react";

import { SiteImage } from "@/components/site/SiteImage";
import { uploadImage } from "@/lib/api-client";

import { Upload, Link as LinkIcon, Image as ImageIcon, Loader2 } from "lucide-react";

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (cause) {
      // Fallback to local Object URL for instant live preview
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-[11px] block">{label}</span>

      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-3.5 shadow-2xs">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center relative group shadow-2xs">
          {value ? (
            <SiteImage src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100 hover:border-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />
              ) : (
                <Upload className="h-3.5 w-3.5 text-slate-600" />
              )}
              <span>{uploading ? "Uploading..." : "Upload Image"}</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
              className="hidden"
            />
          </div>

          <div className="relative flex items-center">
            <LinkIcon className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={value}
              placeholder="Or enter image URL"
              onChange={(event) => onChange(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
            />
          </div>

          {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
