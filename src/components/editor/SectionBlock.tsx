"use client";

import type { ReactNode } from "react";

import {
  cycleSectionVariant,
  moveSection,
  toggleSectionVisibility,
} from "@/app/actions/sections";
import { AddSectionMenu } from "@/components/editor/AddSectionMenu";
import { useEditor } from "@/components/editor/EditorContext";
import type { EditorSection } from "@/lib/editor/queries";

/**
 * Editing chrome wrapped around one live-rendered section.
 *
 * Layout itself stays untouchable — the only affordances are reorder, swap
 * variant, add, show/hide and edit content.
 */
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
  const { selectedSectionId, selectSection, run, isPending } = useEditor();

  const isSelected = selectedSectionId === section.id;
  const canRefresh = section.variants.length > 1;

  const args = { collegeSectionId: section.id };

  return (
    <div
      className={`group relative border-2 transition ${
        isSelected
          ? "border-blue-600"
          : "border-transparent hover:border-blue-300"
      }`}
    >
      <div className={section.isVisible ? "" : "opacity-40 grayscale"}>
        {children}
      </div>

      {/*
        Transparent target covering the section body. An overlay rather than a
        wrapping <button> because sections contain their own links and form
        controls, which may not be nested inside a button — and inside the
        editor those controls should not be clickable anyway.

        Right-click opens the editor, leaving left-click free for inline
        interactions inside the section later. Right-click does not exist on
        touch, so a long press does the same thing, and the button stays
        keyboard-reachable because an affordance nobody can tab to is not one.
      */}
      <button
        type="button"
        onContextMenu={(event) => {
          event.preventDefault();
          selectSection(section.id, { x: event.clientX, y: event.clientY });
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          const box = event.currentTarget.getBoundingClientRect();
          selectSection(isSelected ? null : section.id, {
            x: box.left + 24,
            y: box.top + 24,
          });
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== "touch") return;
          const { clientX: x, clientY: y } = event;
          const timer = setTimeout(
            () => selectSection(section.id, { x, y }),
            450,
          );
          const cancel = () => {
            clearTimeout(timer);
            event.currentTarget?.removeEventListener("pointerup", cancel);
            event.currentTarget?.removeEventListener("pointercancel", cancel);
            event.currentTarget?.removeEventListener("pointermove", cancel);
          };
          event.currentTarget.addEventListener("pointerup", cancel);
          event.currentTarget.addEventListener("pointercancel", cancel);
          event.currentTarget.addEventListener("pointermove", cancel);
        }}
        aria-label={`Edit ${section.label} content`}
        title="Right-click to edit this section"
        className="absolute inset-0 z-10 h-full w-full cursor-context-menu"
      />

      {/* Left edge — reorder */}
      <div className="pointer-events-none absolute left-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        <ArrowButton
          direction="up"
          disabled={isFirst || isPending}
          onClick={() => run(() => moveSection({ ...args, direction: "up" }))}
        />
        <ArrowButton
          direction="down"
          disabled={isLast || isPending}
          onClick={() => run(() => moveSection({ ...args, direction: "down" }))}
        />
      </div>

      {/* Top-right — refresh, add, visibility */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        <span className="rounded bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
          {section.label} · {section.variantName}
        </span>

        <IconButton
          label={
            canRefresh
              ? "Swap design (keeps your content)"
              : "Only one design available"
          }
          disabled={!canRefresh || isPending}
          onClick={() => run(() => cycleSectionVariant(args))}
        >
          ↻
        </IconButton>

        <IconButton
          label={section.isVisible ? "Hide section" : "Show section"}
          disabled={isPending}
          onClick={() => run(() => toggleSectionVisibility(args))}
        >
          {section.isVisible ? "◉" : "○"}
        </IconButton>

        <AddSectionMenu afterOrder={section.displayOrder} />
      </div>

      {!section.isVisible ? (
        <span className="absolute left-2 top-2 z-20 rounded bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
          Hidden
        </span>
      ) : null}
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "up" | "down";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      title={`Move section ${direction}`}
      aria-label={`Move section ${direction}`}
      className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-sm font-bold text-black/70 shadow ring-1 ring-black/10 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
    >
      {direction === "up" ? "▲" : "▼"}
    </button>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-sm text-black/70 shadow ring-1 ring-black/10 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
