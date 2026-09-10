"use client";

/**
 * The right-hand end of every editing toolbar: device, undo/redo, delete,
 * save status. One component, so the section toolbar and the element toolbar
 * cannot drift — whichever is showing, these sit in the same place and mean
 * the same thing.
 */

import { Monitor, Redo2, Smartphone, Tablet, Trash2, Undo2 } from "lucide-react";

import { DEVICES, type Device } from "@/lib/sections/section-managed-css";
import type { SaveStatus } from "@/hooks/useEditorPages";

export const DEVICE_META: Record<Device, { label: string; Icon: typeof Monitor }> = {
  desktop: { label: "Desktop", Icon: Monitor },
  tablet: { label: "Tablet", Icon: Tablet },
  mobile: { label: "Mobile", Icon: Smartphone },
};

export const SAVE_STATUS_META: Record<SaveStatus, { color: string; text: string }> = {
  saving: { color: "#f59e0b", text: "Saving…" },
  saved: { color: "#16a34a", text: "Saved" },
  failed: { color: "#e11d48", text: "Not saved" },
  idle: { color: "#94a3b8", text: "No changes" },
};

export interface ToolbarUtilitiesProps {
  device: Device;
  onDeviceChange: (device: Device) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  /** What Delete removes — named so the tooltip can say so. */
  deleteLabel?: string;
  onDelete?: () => void;
  saveStatus?: SaveStatus;
  saveError?: string | null;
  /** Anything a toolbar wants between Delete and the save status (Reset, Overlay…). */
  children?: React.ReactNode;
}

export function ToolbarUtilities({
  device,
  onDeviceChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  deleteLabel = "this section",
  onDelete,
  saveStatus = "idle",
  saveError = null,
  children,
}: ToolbarUtilitiesProps) {
  const saveMeta = SAVE_STATUS_META[saveStatus];

  return (
    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
      <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 border border-slate-200/60">
        {DEVICES.map((id) => {
          const { label, Icon } = DEVICE_META[id];
          const active = device === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onDeviceChange(id)}
              aria-pressed={active}
              title={label}
              className={`flex items-center justify-center rounded-md p-1 transition cursor-pointer ${
                active ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-slate-200 shrink-0" />

      <button
        type="button"
        onClick={onUndo}
        disabled={!onUndo || !canUndo}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
        className={`rounded-lg p-1 transition ${canUndo ? "text-slate-600 hover:bg-slate-100 cursor-pointer" : "cursor-not-allowed text-slate-300"}`}
      >
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!onRedo || !canRedo}
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
        className={`rounded-lg p-1 transition ${canRedo ? "text-slate-600 hover:bg-slate-100 cursor-pointer" : "cursor-not-allowed text-slate-300"}`}
      >
        <Redo2 className="h-3.5 w-3.5" />
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          title={`Delete ${deleteLabel}`}
          aria-label={`Delete ${deleteLabel}`}
          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {children}

      <span
        role="status"
        title={saveStatus === "failed" && saveError ? saveError : undefined}
        className="ml-1 whitespace-nowrap text-[10px] font-bold"
        style={{ color: saveMeta.color }}
      >
        {saveMeta.text}
      </span>
    </div>
  );
}
