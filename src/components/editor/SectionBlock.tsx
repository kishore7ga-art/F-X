"use client";

import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import {
  Edit3,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Trash2,
} from "lucide-react";

import {
  cycleSectionVariant,
  moveSection,
  toggleSectionVisibility,
} from "@/app/actions/sections";
import { useEditor } from "@/components/editor/EditorContext";
import type { EditorSection } from "@/lib/editor/queries";
import { getVariant } from "@/components/sections/registry";
import { cn } from "@/lib/utils";

export function SectionBlock({
  section,
  isFirst,
  isLast,
  children,
}: {
  section: EditorSection;
  isFirst: boolean;
  isLast: boolean;
  children: ReactNode;
}) {
  const {
    selectedSectionId,
    selectSection,
    run,
    isPending,
    liveContentMap,
    liveStylesMap,
  } = useEditor();

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const isSelected = selectedSectionId === section.id;
  const canRefresh = section.variants.length > 1;
  const args = { collegeSectionId: section.id };

  const variant = getVariant(section.componentKey);
  const liveContent = liveContentMap[section.id];
  const liveStyle = liveStylesMap[section.id] ?? {};

  const contentToRender = variant && liveContent ? variant.render(liveContent) : children;

  useEffect(() => {
    function closeContextMenu() {
      setContextMenuPos(null);
    }
    window.addEventListener("click", closeContextMenu);
    return () => window.removeEventListener("click", closeContextMenu);
  }, []);

  return (
    <div
      id={liveStyle.sectionIdAnchor ?? `section-${section.id}`}
      style={{
        backgroundColor: liveStyle.backgroundColor,
        borderRadius: liveStyle.borderRadius,
      }}
      className={cn(
        "group relative transition-all duration-200 border-2 select-none",
        isSelected
          ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] z-30 ring-2 ring-blue-500/20"
          : "border-transparent hover:border-blue-400/60"
      )}
    >
      {/* SECTION NAME BADGE ON TOP-LEFT OF SELECTION OUTLINE */}
      <div
        className={cn(
          "absolute -top-3.5 left-4 z-40 flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-lg transition-all duration-200",
          isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100"
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        <span>{section.label}</span>
        <span className="text-[10px] text-blue-200 font-mono">({section.variantName})</span>
      </div>

      <div className={section.isVisible ? "" : "opacity-40 grayscale"}>
        {contentToRender}
      </div>

      {/* OVERLAY INTERACTION TARGET */}
      <button
        type="button"
        onClick={(event) => {
          selectSection(section.id, { x: event.clientX, y: event.clientY });
        }}
        onDoubleClick={(event) => {
          selectSection(section.id, { x: event.clientX, y: event.clientY });
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          selectSection(section.id, { x: event.clientX, y: event.clientY });
          setContextMenuPos({ x: event.clientX, y: event.clientY });
        }}
        aria-label={`Edit ${section.label} content`}
        title="Click to edit section in Property Panel"
        className="absolute inset-0 z-10 h-full w-full cursor-pointer"
      />

      {/* TOP-RIGHT FLOATING ACTION BAR */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <IconButton
          label="Edit Properties"
          onClick={(e) => {
            selectSection(section.id, { x: e.clientX, y: e.clientY });
          }}
          className="bg-blue-600 text-white hover:bg-blue-500 border-blue-500 shadow-lg"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label={canRefresh ? "Swap design" : "Only one design available"}
          disabled={!canRefresh || isPending}
          onClick={() => run(() => cycleSectionVariant(args))}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </IconButton>

        <IconButton
          label={section.isVisible ? "Hide section" : "Show section"}
          disabled={isPending}
          onClick={() => run(() => toggleSectionVisibility(args))}
        >
          {section.isVisible ? (
            <Eye className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-amber-400" />
          )}
        </IconButton>
      </div>

      {/* RIGHT CLICK CONTEXT MENU */}
      {contextMenuPos && (
        <div
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          className="fixed z-50 min-w-[160px] rounded-xl border border-neutral-800 bg-neutral-950 p-1.5 font-sans text-xs text-neutral-200 shadow-2xl backdrop-blur-xl"
        >
          <button
            onClick={() => selectSection(section.id)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-neutral-800 hover:text-white"
          >
            <Edit3 className="h-3.5 w-3.5 text-blue-400" />
            Edit Section
          </button>
          <button
            disabled={isFirst || isPending}
            onClick={() => run(() => moveSection({ ...args, direction: "up" }))}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-neutral-800 hover:text-white disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Move Up
          </button>
          <button
            disabled={isLast || isPending}
            onClick={() => run(() => moveSection({ ...args, direction: "down" }))}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-neutral-800 hover:text-white disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            Move Down
          </button>
          <button
            disabled={!canRefresh || isPending}
            onClick={() => run(() => cycleSectionVariant(args))}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-neutral-800 hover:text-white disabled:opacity-30"
          >
            <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
            Swap Design
          </button>
          <button
            disabled={isPending}
            onClick={() => run(() => toggleSectionVisibility(args))}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-neutral-800 hover:text-white"
          >
            {section.isVisible ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                Hide Section
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                Show Section
              </>
            )}
          </button>
        </div>
      )}

      {!section.isVisible && (
        <span className="absolute left-3 top-3 z-20 rounded-md bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold text-black shadow-md uppercase tracking-wider">
          Hidden Section
        </span>
      )}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  className,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      title={label}
      aria-label={label}
      className={cn(
        "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg bg-black/90 text-neutral-300 shadow-lg border border-neutral-800 backdrop-blur-md transition hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30",
        className
      )}
    >
      {children}
    </button>
  );
}
