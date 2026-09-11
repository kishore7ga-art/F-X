"use client";

/**
 * The toolbar while text is being edited in place.
 *
 * It used to be a "Text Color" tab on the section toolbar, which put text
 * formatting on the panel whose job is the section — background, layout —
 * and meant the section's tabs were about two different things. Now the
 * section toolbar edits the section and nothing else, and this takes the
 * dock's place for as long as a text is being typed in: same edge, same
 * header shape, same right-hand utilities as `ElementToolbar`, so nothing
 * moves when a person double-clicks a heading.
 */

import { ArrowLeft, ChevronRight } from "lucide-react";

import type { Device } from "@/lib/sections/section-managed-css";
import type { SaveStatus } from "@/hooks/useEditorPages";

import { ToolbarUtilities } from "./ToolbarUtilities";
import { SingleRowTextColorPanel } from "./TextColorSettingsControl";

type DockPosition = "bottom" | "top" | "left" | "right";

export interface InlineTextToolbarProps {
  /** The section the text lives in, for the breadcrumb. */
  sectionTitle: string;
  device: Device;
  dockPosition?: DockPosition;
  onDeviceChange: (device: Device) => void;
  /** Back: finishes the edit, which returns to the section's toolbar. */
  onClose: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  saveStatus?: SaveStatus;
  saveError?: string | null;

  colorValue: string;
  onApplyColor: (hex: string) => void;
  onApplyFormat?: (command: "bold" | "italic" | "underline" | "removeFormat") => void;
  fontFamilyValue?: string;
  onApplyFontFamily?: (font: string) => void;
  fontSizeValue?: string;
  onApplyFontSize?: (size: string) => void;
  textAlignValue?: string;
  onApplyTextAlign?: (align: "left" | "center" | "right" | "justify") => void;
}

function dockedStyle(dock: DockPosition): React.CSSProperties {
  switch (dock) {
    case "top":
      return { top: 0, left: 0, right: 0 };
    case "left":
      return { top: 0, bottom: 0, left: 0, width: "320px" };
    case "right":
      return { top: 0, bottom: 0, right: 0, width: "320px" };
    default:
      return { bottom: 0, left: 0, right: 0 };
  }
}

export function InlineTextToolbar({
  sectionTitle,
  device,
  dockPosition = "bottom",
  onDeviceChange,
  onClose,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  saveStatus = "idle",
  saveError = null,
  colorValue,
  onApplyColor,
  onApplyFormat,
  fontFamilyValue,
  onApplyFontFamily,
  fontSizeValue,
  onApplyFontSize,
  textAlignValue,
  onApplyTextAlign,
}: InlineTextToolbarProps) {
  return (
    <div
      role="dialog"
      aria-label="Text settings"
      data-xite-toolbar=""
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className={`fixed z-[99999] flex flex-col overflow-hidden bg-white/95 backdrop-blur-md transition-all ${
        dockPosition === "top"
          ? "border-b border-slate-200/90 shadow-md"
          : dockPosition === "bottom"
          ? "border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(15,23,42,0.12)]"
          : "border border-slate-200 shadow-xl"
      }`}
      style={dockedStyle(dockPosition)}
    >
      <header className="flex shrink-0 items-center justify-between gap-2.5 border-b border-slate-200/80 px-3 py-1.5 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onClose}
            title="Done editing (Esc)"
            aria-label="Finish editing text and return to the section toolbar"
            className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 shrink-0 text-[10px] font-semibold text-slate-400">
            <span className="truncate max-w-[120px]" title={sectionTitle}>
              {sectionTitle}
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="rounded px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200/60">
              Text
            </span>
          </div>
        </div>

        <ToolbarUtilities
          device={device}
          onDeviceChange={onDeviceChange}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          saveStatus={saveStatus}
          saveError={saveError}
        />
      </header>

      <div className="py-0.5 px-3">
        <SingleRowTextColorPanel
          currentColor={colorValue}
          onSelectColor={onApplyColor}
          onFormat={onApplyFormat}
          isEditingText
          currentFont={fontFamilyValue}
          onSelectFont={onApplyFontFamily}
          currentFontSize={fontSizeValue}
          onSelectFontSize={onApplyFontSize}
          currentAlign={textAlignValue}
          onSelectAlign={onApplyTextAlign}
        />
      </div>
    </div>
  );
}
