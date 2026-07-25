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
        Transparent click target covering the section body. An overlay rather
        than a wrapping <button> because sections contain their own links and
        form controls, which may not be nested inside a button — and inside the
        editor those controls should not be clickable anyway.
      */}
      <button
        type="button"
        onClick={() => selectSection(isSelected ? null : section.id)}
        aria-label={`Edit ${section.label} content`}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer"
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
