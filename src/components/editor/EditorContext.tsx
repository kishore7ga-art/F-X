"use client";

import { createContext, useContext } from "react";

import type { AddableSection, EditorSection } from "@/lib/editor/queries";

export type EditorContextValue = {
  collegeId: string;
  pageId: string;
  sections: EditorSection[];
  addableSections: AddableSection[];
  selectedSectionId: string | null;
  /**
   * Opens the edit popup for a section. The point is where it was invoked, so
   * the form appears at the cursor rather than in a fixed corner.
   */
  selectSection: (id: string | null, at?: { x: number; y: number }) => void;
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
