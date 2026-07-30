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
        "group relative transition-all duration-200 border-2 select-text rounded-xl",
        isSelected
          ? "border-slate-900 ring-4 ring-blue-500/20 z-30 shadow-lg"
          : "border-transparent hover:border-slate-300/60"
      )}
    >

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
        "flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-black/90 text-slate-600 shadow-md transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30",
        className
      )}
    >
      {children}
    </button>
  );
}
