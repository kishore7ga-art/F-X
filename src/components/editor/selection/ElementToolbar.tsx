"use client";

/**
 * The contextual toolbar for a container, card, button, image, heading, text, or generic element selected inside a section.
 *
 * Takes the dock's place exactly as `SectionToolbar` does — same edge, same
 * header shape, same right-hand utilities — so what changes when a person
 * clicks or right-clicks an element instead of the section around it is the badge, the
 * tabs and the fields, and nothing about where they look for undo or save.
 *
 * Holds one piece of state: which tab is open. Every field renders from the
 * selection's `meta` snapshot, which the controller refreshes on each change,
 * so there is nothing here that can disagree with the canvas.
 */

import { useState } from "react";
import { ArrowLeft, ChevronRight, Copy, ArrowUp, ArrowDown } from "lucide-react";

import type { Device } from "@/lib/sections/section-managed-css";
import type { SaveStatus } from "@/hooks/useEditorPages";
import type { ElementType, SelectionAncestor, SelectionState } from "@/lib/editor/selection-store";
import type {
  ButtonProps,
  CardProps,
  ContainerProps,
  ElementPropsByType,
  GenericProps,
  HeadingLevel,
  HeadingProps,
  IconProps,
  ImageProps,
  LeafType,
  LogoProps,
  PlusProps,
  TextProps,
  VideoProps,
  YouTubeProps,
} from "@/lib/editor/element-resolver";

import { ToolbarUtilities } from "../ToolbarUtilities";
import { TOOLBAR_CONFIG } from "./toolbar-config";
import { CardPanel } from "./panels/CardPanel";
import { ButtonPanel } from "./panels/ButtonPanel";
import { ImagePanel } from "./panels/ImagePanel";
import { VideoPanel } from "./panels/VideoPanel";
import { YouTubePanel } from "./panels/YouTubePanel";
import { IconPanel } from "./panels/IconPanel";
import { LogoPanel } from "./panels/LogoPanel";
import { PlusPanel } from "./panels/PlusPanel";
import { HeadingPanel } from "./panels/HeadingPanel";
import { TextPanel } from "./panels/TextPanel";
import { ContainerPanel } from "./panels/ContainerPanel";
import { GenericPanel } from "./panels/GenericPanel";

type DockPosition = "bottom" | "top" | "left" | "right";

export interface ElementToolbarProps {
  selection: SelectionState;
  /** The section the element lives in, for the breadcrumb. */
  sectionTitle: string;
  device: Device;
  dockPosition?: DockPosition;
  onDeviceChange: (device: Device) => void;
  onChange: <T extends LeafType>(id: string, props: Partial<ElementPropsByType[T]>) => void;
  onChangeHeadingLevel?: (level: HeadingLevel) => void;
  onSelectAncestor?: (path: string, type: ElementType) => void;
  onReplaceMedia?: (targetType: "image" | "video" | "youtube", initialProps?: Record<string, unknown>) => void;
  onReplacePlus?: (targetType: "image" | "video" | "youtube" | "icon" | "button", initialProps?: Record<string, unknown>) => void;
  onChangeIcon?: (iconName: string) => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddMediaToCard?: (
    mediaType: "image" | "video" | "youtube",
    initialProps?: Record<string, unknown>,
    position?: "top" | "bottom" | "left" | "right",
  ) => void;
  onRemoveMediaFromCard?: () => void;
  onSelectChildMedia?: () => void;
  onSelectParentCard?: () => void;
  onInsertChildIntoCard?: (childType: "heading" | "text" | "button") => void;
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
  onChangeHeadingLevel,
  onSelectAncestor,
  onReplaceMedia,
  onReplacePlus,
  onChangeIcon,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddMediaToCard,
  onRemoveMediaFromCard,
  onSelectChildMedia,
  onSelectParentCard,
  onInsertChildIntoCard,
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

  if (!type || type === "section" || !config || !selection.selectedId) return null;

  // A tab chosen for another kind of element does not carry over; the first tab does.
  const tab = config.tabs.some((t) => t.id === chosenTab) ? chosenTab : config.tabs[0]?.id || "";

  const id = selection.selectedId;
  const meta = (selection.meta ?? {}) as Record<string, unknown>;
  const tag = typeof meta.tag === "string" ? meta.tag : "";
  const ancestors = selection.ancestors ?? [];

  const panel = (() => {
    switch (type) {
      case "card":
        return (
          <CardPanel
            tab={tab}
            props={meta as unknown as CardProps}
            onChange={(p) => onChange<"card">(id, p)}
            onAddMedia={onAddMediaToCard}
            onRemoveMedia={onRemoveMediaFromCard}
            onSelectChildMedia={onSelectChildMedia}
            onInsertChild={onInsertChildIntoCard}
          />
        );
      case "button":
        return <ButtonPanel tab={tab} props={meta as unknown as ButtonProps} onChange={(p) => onChange<"button">(id, p)} />;
      case "image":
        return (
          <ImagePanel
            tab={tab}
            props={meta as unknown as ImageProps}
            onChange={(p) => onChange<"image">(id, p)}
            onReplaceMedia={onReplaceMedia}
          />
        );
      case "video":
        return (
          <VideoPanel
            tab={tab}
            props={meta as unknown as VideoProps}
            onChange={(p) => onChange<"video">(id, p)}
            onReplaceMedia={onReplaceMedia}
          />
        );
      case "youtube":
        return (
          <YouTubePanel
            tab={tab}
            props={meta as unknown as YouTubeProps}
            onChange={(p) => onChange<"youtube">(id, p)}
            onReplaceMedia={onReplaceMedia}
          />
        );
      case "icon":
        return (
          <IconPanel
            tab={tab}
            props={meta as unknown as IconProps}
            onChange={(p) => onChange<"icon">(id, p)}
            onChangeIcon={onChangeIcon}
          />
        );
      case "logo":
        return <LogoPanel tab={tab} props={meta as unknown as LogoProps} onChange={(p) => onChange<"logo">(id, p)} />;
      case "plus":
        return (
          <PlusPanel
            tab={tab}
            props={meta as unknown as PlusProps}
            onChange={(p) => onChange<"plus">(id, p)}
            onInsertElement={onReplacePlus}
          />
        );
      case "heading":
        return (
          <HeadingPanel
            tab={tab}
            props={meta as unknown as HeadingProps}
            onChange={(p) => onChange<"heading">(id, p)}
            onChangeLevel={onChangeHeadingLevel}
          />
        );
      case "text":
        return <TextPanel tab={tab} props={meta as unknown as TextProps} onChange={(p) => onChange<"text">(id, p)} />;
      case "container":
        return <ContainerPanel tab={tab} props={meta as unknown as ContainerProps} onChange={(p) => onChange<"container">(id, p)} />;
      case "generic":
        return <GenericPanel tab={tab} props={meta as unknown as GenericProps} onChange={(p) => onChange<"generic">(id, p)} />;
      default:
        return null;
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
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onClose}
            title="Back to the section (Esc)"
            aria-label="Deselect and return to the section toolbar"
            className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Interactive Breadcrumb: Section › [Ancestor Container / Card] › Current Element */}
          <div className="flex items-center gap-1 shrink-0 text-[10px] font-semibold text-slate-400">
            {ancestors.length > 0 ? (
              ancestors.map((anc, idx) => (
                <span key={anc.id || idx} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (anc.type === "section") {
                        onClose();
                      } else if (onSelectAncestor) {
                        onSelectAncestor(anc.path, anc.type);
                      }
                    }}
                    title={`Select ${anc.label}`}
                    className="truncate max-w-[100px] hover:text-indigo-600 hover:underline cursor-pointer transition"
                  >
                    {anc.label}
                  </button>
                  <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                </span>
              ))
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  title="Select Section"
                  className="truncate max-w-[120px] hover:text-indigo-600 hover:underline cursor-pointer transition"
                >
                  {sectionTitle}
                </button>
                <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
              </>
            )}

            <span
              className={`rounded px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider border ${config.badgeClass}`}
            >
              {config.badge}
            </span>
            {tag && <span className="font-mono text-slate-400 text-[10px]">&lt;{tag}&gt;</span>}

            {type !== "card" && Boolean(meta.cardPath) && onSelectParentCard ? (
              <button
                type="button"
                onClick={onSelectParentCard}
                title="Select parent card"
                className="flex items-center gap-1 rounded bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 text-[9.5px] font-bold hover:bg-violet-100 transition cursor-pointer shrink-0"
              >
                Card ↖
              </button>
            ) : null}
          </div>

          {/* Quick action buttons: Duplicate, Move Up, Move Down */}
          <div className="hidden sm:flex items-center gap-0.5 pl-1.5 border-l border-slate-200/80">
            {onDuplicate && (
              <button
                type="button"
                onClick={onDuplicate}
                title={`Duplicate ${config.badge.toLowerCase()}`}
                aria-label={`Duplicate ${config.badge.toLowerCase()}`}
                className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                title="Move element up"
                aria-label="Move element up"
                className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 cursor-pointer"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                title="Move element down"
                aria-label="Move element down"
                className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 cursor-pointer"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Tabs */}
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
                      t.id === tab
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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

      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1.5 px-3 flex-nowrap w-full">
        {panel}
      </div>
    </div>
  );
}
