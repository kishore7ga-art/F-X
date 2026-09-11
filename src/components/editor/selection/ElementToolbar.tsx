"use client";

/**
 * The toolbar for a card, button, image or text selected inside a section.
 *
 * Takes the dock's place exactly as `SectionToolbar` does — same edge, same
 * header shape, same right-hand utilities — so what changes when a person
 * right-clicks a button instead of the section around it is the badge, the
 * tabs and the fields, and nothing about where they look for undo or save.
 *
 * Holds one piece of state: which tab is open. Every field renders from the
 * selection's `meta` snapshot, which the controller refreshes on each change,
 * so there is nothing here that can disagree with the canvas.
 */

import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";

import type { Device } from "@/lib/sections/section-managed-css";
import type { SaveStatus } from "@/hooks/useEditorPages";
import type { SelectionState } from "@/lib/editor/selection-store";
import type { ButtonProps, CardProps, ElementPropsByType, ImageProps, LeafType } from "@/lib/editor/element-resolver";

import { ToolbarUtilities } from "../ToolbarUtilities";
import { TOOLBAR_CONFIG } from "./toolbar-config";
import { CardPanel } from "./panels/CardPanel";
import { ButtonPanel } from "./panels/ButtonPanel";
import { ImagePanel } from "./panels/ImagePanel";

type DockPosition = "bottom" | "top" | "left" | "right";

export interface ElementToolbarProps {
  selection: SelectionState;
  /** The section the element lives in, for the breadcrumb. */
  sectionTitle: string;
  device: Device;
  dockPosition?: DockPosition;
  onDeviceChange: (device: Device) => void;
  onChange: <T extends LeafType>(id: string, props: Partial<ElementPropsByType[T]>) => void;
  /** Back: clears the element selection, which returns to the section's toolbar. */
  onClose: () => void;
  onDelete: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  saveStatus?: SaveStatus;
  saveError?: string | null;
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

export function ElementToolbar({
  selection,
  sectionTitle,
  device,
  dockPosition = "bottom",
  onDeviceChange,
  onChange,
  onClose,
  onDelete,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  saveStatus = "idle",
  saveError = null,
}: ElementToolbarProps) {
  const type = selection.type;
  const config = type ? TOOLBAR_CONFIG[type] : null;
  const [chosenTab, setTab] = useState<string>("");

  // Text is edited in place (see InlineTextToolbar), never selected here.
  if (!type || type === "section" || type === "text" || !config || !selection.selectedId) return null;

  // A tab chosen for another kind of element does not carry over; the first tab does.
  const tab = config.tabs.some((t) => t.id === chosenTab) ? chosenTab : config.tabs[0]!.id;

  const id = selection.selectedId;
  const meta = (selection.meta ?? {}) as Record<string, unknown>;
  const tag = typeof meta.tag === "string" ? meta.tag : "";
  const inCard = typeof meta.cardPath === "string";

  const panel = (() => {
    switch (type) {
      case "card":
        return <CardPanel tab={tab} props={meta as unknown as CardProps} onChange={(p) => onChange<"card">(id, p)} />;
      case "button":
        return <ButtonPanel tab={tab} props={meta as unknown as ButtonProps} onChange={(p) => onChange<"button">(id, p)} />;
      case "image":
        return <ImagePanel tab={tab} props={meta as unknown as ImageProps} onChange={(p) => onChange<"image">(id, p)} />;
    }
  })();

  return (
    <div
      role="dialog"
      aria-label={`${config.badge} settings`}
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
            title="Back to the section (Esc)"
            aria-label="Deselect and return to the section toolbar"
            className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Breadcrumb: Section › (Card ›) Element */}
          <div className="flex items-center gap-1 shrink-0 text-[10px] font-semibold text-slate-400">
            <span className="truncate max-w-[120px]" title={sectionTitle}>
              {sectionTitle}
            </span>
            <ChevronRight className="h-3 w-3" />
            {inCard && type !== "card" && (
              <>
                <span>Card</span>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider border ${config.badgeClass}`}>
              {config.badge}
            </span>
            {tag && <span className="font-mono text-slate-400">&lt;{tag}&gt;</span>}
          </div>

          {/* One tab is no tab: the badge already says what this is. */}
          {config.tabs.length > 1 && (
            <>
          <div className="h-4 w-px bg-slate-200 shrink-0 hidden md:block" />
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            {config.tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={t.id === tab}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-0.5 text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                  t.id === tab ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
            </>
          )}
        </div>

        <ToolbarUtilities
          device={device}
          onDeviceChange={onDeviceChange}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onDelete={onDelete}
          deleteLabel={config.deleteLabel}
          saveStatus={saveStatus}
          saveError={saveError}
        />
      </header>

      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1.5 px-3 flex-nowrap w-full">{panel}</div>
    </div>
  );
}
