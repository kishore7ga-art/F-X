"use client";

import { createContext, useContext } from "react";

import type { AddableSection, EditorSection } from "@/lib/editor/queries";

export type SectionStyleOverride = {
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  padding?: string;
  animation?: string;
  customClass?: string;
  sectionIdAnchor?: string;
};

export type EditorContextValue = {
  collegeId: string;
  pageId: string;
  sections: EditorSection[];
  addableSections: AddableSection[];
  selectedSectionId: string | null;
  /** Live instant content map for real-time canvas updates as user types */
  liveContentMap: Record<string, unknown>;
  /** Live instant style overrides per section */
  liveStylesMap: Record<string, SectionStyleOverride>;
  /** Selects a section without opening popup. */
  selectSection: (id: string | null) => void;
  /** Opens the floating edit popup for a section (triggered on double click). */
  openSectionPopup: (id: string, at: { x: number; y: number }) => void;
  /** Instant real-time live page preview update callback */
  updateSectionContent: (id: string, content: Record<string, unknown>) => void;
  /** Instant style override callback */
  updateSectionStyle: (id: string, style: SectionStyleOverride) => void;
  /** Undo / Redo capabilities */
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  isPending: boolean;
  /** Runs a server action, surfacing failures instead of swallowing them. */
  run: (action: () => Promise<void>) => void;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export const EditorContextProvider = EditorContext.Provider;

export function useEditor() {
  const value = useContext(EditorContext);
  if (!value) {
    throw new Error("useEditor must be used inside the editor shell");
  }
  return value;
}
