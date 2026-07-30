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
    openSectionPopup,
    run,
    isPending,
    liveContentMap,
    liveStylesMap,
  } = useEditor();

  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const { updateSectionContent } = useEditor();

  const isSelected = selectedSectionId === section.id;
  const canRefresh = section.variants.length > 1;
  const args = { collegeSectionId: section.id };

  const variant = getVariant(section.componentKey);
  const liveContent = liveContentMap[section.id];
  const liveStyle = liveStylesMap[section.id] ?? {};

  const contentToRender = variant && liveContent ? variant.render(liveContent) : children;



  // Direct Inline Text Editing for canvas h1, h2, h3, p tags
  useEffect(() => {
    const wrapper = contentWrapperRef.current;
    if (!wrapper) return;

    const textElements = wrapper.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p");
    const cleanupFns: (() => void)[] = [];

    textElements.forEach((el) => {
      el.contentEditable = "true";
      el.setAttribute("spellcheck", "false");
      el.style.outline = "none";
      el.style.position = "relative";
      el.style.zIndex = "25"; // Higher than overlay (z-10) for direct text focus & typing
      el.style.cursor = "text";
      el.classList.add(
        "transition-all",
        "duration-150",
        "hover:outline-dashed",
        "hover:outline-1",
        "hover:outline-blue-400/80",
        "focus:outline-solid",
        "focus:outline-2",
        "focus:outline-blue-500",
        "focus:bg-blue-500/10",
        "rounded-sm"
      );

      const handleBlurOrInput = () => {
        const text = el.innerText.trim();
        const currentData = ((liveContentMap[section.id] ?? section.content ?? {}) as Record<string, unknown>);
        const updatedData = { ...currentData };

        const tag = el.tagName;
        if (tag === "H1" || tag === "H2") {
          if ("collegeName" in updatedData) updatedData.collegeName = text;
          else if ("title" in updatedData) updatedData.title = text;
        } else if (tag === "P" || tag === "H3") {
          if (el.classList.contains("italic") && "tagline" in updatedData) {
            updatedData.tagline = text;
          } else if ("intro" in updatedData) {
            updatedData.intro = text;
          } else if ("history" in updatedData) {
            updatedData.history = text;
          } else if ("mission" in updatedData) {
            updatedData.mission = text;
          } else if ("vision" in updatedData) {
            updatedData.vision = text;
          } else {
            const strKeys = Object.keys(updatedData).filter((k) => typeof updatedData[k] === "string");
            if (strKeys.length > 0) {
              const matchedKey = strKeys.find((k) => (updatedData[k] as string).length > 0);
              if (matchedKey) updatedData[matchedKey] = text;
            }
          }
        }

        updateSectionContent(section.id, updatedData);
      };

      el.addEventListener("blur", handleBlurOrInput);
      cleanupFns.push(() => el.removeEventListener("blur", handleBlurOrInput));
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [section.id, contentToRender, updateSectionContent, liveContentMap, section.content]);

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

      <div ref={contentWrapperRef} className={section.isVisible ? "" : "opacity-40 grayscale"}>
        {contentToRender}
      </div>

      {/* OVERLAY INTERACTION TARGET */}
      <button
        type="button"
        onClick={() => {
          selectSection(section.id);
        }}
        onDoubleClick={(event) => {
          openSectionPopup(section.id, { x: event.clientX, y: event.clientY });
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          openSectionPopup(section.id, { x: event.clientX, y: event.clientY });
        }}
        aria-label={`Edit ${section.label} content`}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer"
      />

      {/* TOP-RIGHT FLOATING ACTION BAR */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <IconButton
          label="Edit Properties"
          onClick={(e) => {
            openSectionPopup(section.id, { x: e.clientX, y: e.clientY });
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
  children,
  onClick,
  disabled,
  className,
}: {
  label: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-700 bg-black/90 text-neutral-200 shadow-md transition hover:bg-neutral-800 hover:text-white disabled:opacity-30",
        className
      )}
    >
      {children}
    </button>
  );
}
