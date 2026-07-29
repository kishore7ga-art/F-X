"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Palette,
  Sliders,
  FileText,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Link as LinkIcon,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { useEditor } from "@/components/editor/EditorContext";
import type { EditorSection } from "@/lib/editor/queries";
import { SECTION_FORM_FIELDS, type FieldDef } from "@/lib/sections/form-fields";
import { uploadImage, saveSectionContent } from "@/lib/api-client";
import { SaveQueue, isRetryableSaveError, type SaveState, type SaveTrigger } from "@/lib/editor/save-queue";
import { toggleSectionVisibility, moveSection } from "@/app/actions/sections";
import { cn } from "@/lib/utils";

const IMMEDIATE_KINDS = new Set(["image", "boolean"]);
const TRIGGER_BY_KIND: Record<string, SaveTrigger> = {
  image: "image",
  boolean: "section_update",
  list: "section_update",
};

export function RightPropertyPanel({
  section,
  onClose,
}: {
  section: EditorSection;
  onClose: () => void;
}) {
  const {
    updateSectionContent,
    updateSectionStyle,
    liveContentMap,
    liveStylesMap,
    run,
    isPending,
  } = useEditor();

  const fields = SECTION_FORM_FIELDS[section.sectionType] ?? [];
  const currentContent = (liveContentMap[section.id] ?? section.content) as Record<string, unknown>;
  const currentStyle = liveStylesMap[section.id] ?? {};

  const [values, setValues] = useState<Record<string, unknown>>(currentContent ?? {});
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    content: true,
    media: true,
    style: false,
    advanced: false,
  });

  const [saveState, setSaveState] = useState<SaveState>(() =>
    section.lastSavedAt
      ? { status: "saved", at: new Date(section.lastSavedAt).getTime(), fresh: false }
      : { status: "idle" }
  );

  const latest = useRef(values);

  const queue = useRef<SaveQueue<Record<string, unknown>> | null>(null);

  useEffect(() => {
    queue.current = new SaveQueue({
      send: (payload, trigger) => saveSectionContent(section.id, payload, trigger),
      onState: setSaveState,
      isRetryable: isRetryableSaveError,
    });

    return () => {
      queue.current?.flush();
      queue.current?.dispose();
    };
  }, [section.id]);

  function toggleAccordion(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleFieldChange(name: string, value: unknown, kind = "text") {
    const next = { ...latest.current, [name]: value };
    latest.current = next;
    setValues(next);

    // Instant real-time optimistic live preview update on canvas
    updateSectionContent(section.id, next);

    // 500ms debounced auto-save
    queue.current?.push(
      section.id,
      next,
      TRIGGER_BY_KIND[kind] ?? "typing",
      IMMEDIATE_KINDS.has(kind)
    );
  }

  // Handle Drag & Drop Image Upload
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload(file: File, fieldName: string) {
    try {
      setIsUploading(true);
      const { url } = await uploadImage(file);
      handleFieldChange(fieldName, url, "image");
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  }

  // Filter fields by search query
  const filteredFields = fields.filter(
    (f) =>
      searchQuery === "" ||
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const imageField = fields.find((f) => f.kind === "image");
  const imageUrl = imageField ? (values[imageField.name] as string) : "";

  return (
    <motion.aside
      initial={{ x: 440, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 440, opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 350, duration: 0.25 }}
      className="fixed right-0 top-0 bottom-0 z-50 flex w-[440px] max-w-[90vw] flex-col border-l border-neutral-800 bg-neutral-950/95 font-sans text-neutral-100 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
    >
      {/* ─── 1. HEADER BAR ─── */}
      <header className="flex shrink-0 flex-col border-b border-neutral-800 p-5 bg-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
              ⚡
            </span>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                {section.label}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {section.variantName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time State Indicator */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              {saveState.status === "saving" || saveState.status === "pending" ? (
                <span className="flex items-center gap-1 text-amber-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving…
                </span>
              ) : saveState.status === "saved" ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Saved
                </span>
              ) : (
                <span className="flex items-center gap-1 text-neutral-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Property Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Properties..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 outline-none transition focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80"
          />
        </div>
      </header>

      {/* ─── 2. ACCORDION BODY SECTIONS ─── */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
        {/* ACCORDION 1: CONTENT */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 overflow-hidden transition">
          <button
            onClick={() => toggleAccordion("content")}
            className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800/40"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              Content
            </span>
            {openSections.content ? (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-neutral-500" />
            )}
          </button>

          {openSections.content && (
            <div className="space-y-4 p-4 pt-1 border-t border-neutral-800/60">
              {filteredFields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 block">
                    {field.label}
                  </label>

                  {field.kind === "text" && (
                    <input
                      type="text"
                      value={(values[field.name] as string) ?? ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value, "text")}
                      placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-xs text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                    />
                  )}

                  {field.kind === "textarea" && (
                    <textarea
                      rows={field.rows ?? 3}
                      value={(values[field.name] as string) ?? ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value, "textarea")}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full resize-y rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-xs text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                    />
                  )}

                  {field.kind === "boolean" && (
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(values[field.name])}
                        onChange={(e) => handleFieldChange(field.name, e.target.checked, "boolean")}
                        className="h-4 w-4 rounded border-neutral-800 bg-neutral-900 text-blue-600 focus:ring-0"
                      />
                      <span className="text-xs text-neutral-300 font-medium">{field.label}</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACCORDION 2: MEDIA & IMAGE UPLOAD */}
        {imageField && (
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 overflow-hidden transition">
            <button
              onClick={() => toggleAccordion("media")}
              className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800/40"
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-pink-400" />
                Media & Banners
              </span>
              {openSections.media ? (
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-500" />
              )}
            </button>

            {openSections.media && (
              <div className="space-y-4 p-4 pt-1 border-t border-neutral-800/60">
                {/* Large Preview */}
                {imageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 group">
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      onClick={() => handleFieldChange(imageField.name, "", "image")}
                      className="absolute top-2 right-2 rounded-full bg-black/80 p-1.5 text-neutral-300 hover:text-red-400 transition"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileUpload(file, imageField.name);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition cursor-pointer relative",
                    isDragging
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900"
                  )}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, imageField.name);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-blue-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-xs font-semibold">Uploading asset...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-neutral-500 mb-2" />
                      <p className="text-xs font-bold text-neutral-200">
                        Drag image here or <span className="text-blue-400 underline">Browse Files</span>
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                        Supports PNG, JPG, SVG, WEBP
                      </p>
                    </>
                  )}
                </div>

                {/* Direct Image URL input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Or paste Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => handleFieldChange(imageField.name, e.target.value, "image")}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACCORDION 3: STYLE PRESETS */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 overflow-hidden transition">
          <button
            onClick={() => toggleAccordion("style")}
            className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800/40"
          >
            <span className="flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-emerald-400" />
              Style & Colors
            </span>
            {openSections.style ? (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-neutral-500" />
            )}
          </button>

          {openSections.style && (
            <div className="space-y-4 p-4 pt-1 border-t border-neutral-800/60">
              {/* Background Color Swatches */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-neutral-400 block">
                  Section Background
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: "Default", color: "transparent" },
                    { label: "Dark Slate", color: "#09090b" },
                    { label: "Deep Blue", color: "#0f172a" },
                    { label: "Emerald", color: "#064e3b" },
                    { label: "Pure White", color: "#ffffff" },
                  ].map((bg) => (
                    <button
                      key={bg.label}
                      onClick={() =>
                        updateSectionStyle(section.id, {
                          ...currentStyle,
                          backgroundColor: bg.color,
                        })
                      }
                      title={bg.label}
                      className={cn(
                        "h-8 rounded-lg border transition shadow-sm relative overflow-hidden",
                        currentStyle.backgroundColor === bg.color
                          ? "border-blue-500 ring-2 ring-blue-500/50"
                          : "border-neutral-700 hover:border-neutral-500"
                      )}
                      style={{ backgroundColor: bg.color === "transparent" ? "#18181b" : bg.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-neutral-400 block">
                  Corner Radius
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["0px", "8px", "16px", "24px", "9999px"].map((rad, i) => (
                    <button
                      key={rad}
                      onClick={() =>
                        updateSectionStyle(section.id, {
                          ...currentStyle,
                          borderRadius: rad,
                        })
                      }
                      className={cn(
                        "rounded-lg border px-2 py-1 text-[10px] font-mono transition text-center",
                        currentStyle.borderRadius === rad
                          ? "border-blue-500 bg-blue-500/20 text-blue-400"
                          : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                      )}
                    >
                      {["0", "Sm", "Md", "Lg", "Full"][i]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 4: ADVANCED */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 overflow-hidden transition">
          <button
            onClick={() => toggleAccordion("advanced")}
            className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-800/40"
          >
            <span className="flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-amber-400" />
              Advanced
            </span>
            {openSections.advanced ? (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-neutral-500" />
            )}
          </button>

          {openSections.advanced && (
            <div className="space-y-4 p-4 pt-1 border-t border-neutral-800/60 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-400 block">
                  Section Anchor ID
                </label>
                <input
                  type="text"
                  value={currentStyle.sectionIdAnchor ?? section.id}
                  onChange={(e) =>
                    updateSectionStyle(section.id, {
                      ...currentStyle,
                      sectionIdAnchor: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50">
                <span className="text-neutral-300 font-medium">Visibility State</span>
                <button
                  disabled={isPending}
                  onClick={() => run(() => toggleSectionVisibility({ collegeSectionId: section.id }))}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  {section.isVisible ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-emerald-400" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                      Hidden
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
