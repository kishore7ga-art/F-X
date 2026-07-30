"use client";

import { useRef, useState } from "react";

import { SiteImage } from "@/components/site/SiteImage";
import { uploadImage } from "@/lib/api-client";

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
    <div>
      <span className="text-xs font-semibold text-black/60">{label}</span>

      <div className="mt-1 flex items-start gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-zinc-100">
          {value ? (
            <SiteImage src={value} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
            className="block w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-black file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          <input
            type="text"
            value={value}
            placeholder="or paste an image URL"
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded border border-black/15 px-2 py-1.5 text-xs outline-none focus:border-black"
          />
          {uploading ? (
            <p className="text-xs text-black/50">Uploading…</p>
          ) : null}
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
