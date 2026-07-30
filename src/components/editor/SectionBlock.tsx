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
  deleteSection,
  duplicateSection,
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

    const textElements = wrapper.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, p, span, a, li, blockquote");
    const cleanupFns: (() => void)[] = [];

    textElements.forEach((el) => {
      el.contentEditable = "true";
      el.setAttribute("spellcheck", "false");
      el.style.outline = "none";
      el.style.position = "relative";
      el.style.zIndex = "25"; // Higher than overlay for direct text focus & typing
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
        } else if (tag === "P" || tag === "H3" || tag === "H4" || tag === "SPAN" || tag === "BLOCKQUOTE") {
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
          } else if ("principalMessage" in updatedData) {
            updatedData.principalMessage = text;
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

      el.addEventListener("input", handleBlurOrInput);
      el.addEventListener("blur", handleBlurOrInput);
      cleanupFns.push(() => {
        el.removeEventListener("input", handleBlurOrInput);
        el.removeEventListener("blur", handleBlurOrInput);
      });
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
        "group relative transition-all duration-200 border-2 select-text",
        isSelected
          ? "border-neutral-900 ring-2 ring-white/30 z-30"
          : "border-transparent hover:border-neutral-400/50"
      )}
    >
      {/* SECTION HOVER OVERLAY BAR (ONLY ON HOVER / SELECTION) */}
      <div
        className={cn(
          "absolute -top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-xl bg-[#111113] border border-[#26272B] px-3 py-1.5 shadow-xl text-xs font-semibold text-white transition-all duration-200 backdrop-blur-md",
          isSelected
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
        )}
      >
        <span className="text-neutral-400 font-mono text-[10px] hidden sm:inline">───────────────</span>
        <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          {section.label}
        </span>
        <span className="text-neutral-400 font-mono text-[10px] hidden sm:inline">───────────────</span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openSectionPopup(section.id, { x: e.clientX, y: e.clientY });
          }}
          className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-black hover:bg-neutral-200 transition shadow-sm"
        >
          <Edit3 className="h-3 w-3" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={(e) => {
            e.stopPropagation();
            run(() => duplicateSection(args));
          }}
          className="flex items-center gap-1 rounded-lg bg-[#17171A] border border-[#26272B] px-2.5 py-1 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition disabled:opacity-50"
        >
          <Copy className="h-3 w-3 text-neutral-400" />
          <span>Duplicate</span>
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete ${section.label}?`)) {
              run(() => deleteSection(args));
            }
          }}
          title="Delete section"
          className="flex items-center gap-1 rounded-lg bg-[#17171A] border border-[#26272B] px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition disabled:opacity-30"
        >
          <Trash2 className="h-3 w-3" />
          <span>Delete</span>
        </button>

        {canRefresh && (
          <button
            type="button"
            disabled={isPending}
            onClick={(e) => {
              e.stopPropagation();
              run(() => cycleSectionVariant(args));
            }}
            title="Swap Variant Design"
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        )}
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
