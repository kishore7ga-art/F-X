"use client";

import { create } from "zustand";

export type ElementType = "heading" | "subheading" | "paragraph" | "card" | "button" | "badge";

export interface CanvasElement {
  id: string;
  type: ElementType;
  content: string;
  position: { x: number; y: number };
  dimensions: { width: number | "auto"; height: number | "auto" };
  styles: Record<string, string | number>;
  zIndex?: number;
}

export interface SectionState {
  id: string;
  title: string;
  layoutMode: "freeform" | "flex-row" | "grid";
  gap: number;
  padding: number;
  minHeight: number;
  elements: CanvasElement[];
}

export interface SnapGuide {
  id: string;
  orientation: "horizontal" | "vertical";
  coordinate: number;
  color: string; // "#ec4899" (magenta) or "#06b6d4" (cyan)
}

export interface DistanceBadge {
  id: string;
  x: number;
  y: number;
  distance: number;
  orientation: "horizontal" | "vertical";
}

interface VisualCanvasState {
  // Sections & Active Section
  sections: SectionState[];
  activeSectionId: string;
  
  // Selection & Hover
  selectedElementId: string | null;
  hoveredElementId: string | null;
  editingElementId: string | null;

  // Snapping & Drag State
  activeSnapGuides: SnapGuide[];
  distanceBadges: DistanceBadge[];
  isDragging: boolean;
  dropInsertionIndex: number | null;

  // Zoom & Pan
  zoom: number;
  panOffset: { x: number; y: number };

  // History for Undo/Redo
  history: SectionState[][];
  historyIndex: number;

  // Actions
  setActiveSectionId: (id: string) => void;
  setLayoutMode: (sectionId: string, mode: "freeform" | "flex-row" | "grid") => void;
  setSectionGap: (sectionId: string, gap: number) => void;
  
  setSelectedElementId: (id: string | null) => void;
  setHoveredElementId: (id: string | null) => void;
  setEditingElementId: (id: string | null) => void;
  
  addElement: (sectionId: string, element: Omit<CanvasElement, "id">, insertIndex?: number) => CanvasElement;
  updateElement: (sectionId: string, elementId: string, patch: Partial<CanvasElement>) => void;
  removeElement: (sectionId: string, elementId: string) => void;
  reorderElements: (sectionId: string, fromIndex: number, toIndex: number) => void;
  
  setDragState: (isDragging: boolean, guides?: SnapGuide[], badges?: DistanceBadge[], dropIndex?: number | null) => void;
  clearSnapGuides: () => void;
  
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  
  undo: () => void;
  redo: () => void;
}

const INITIAL_SECTIONS: SectionState[] = [];

export const useVisualCanvasStore = create<VisualCanvasState>((set, get) => ({
  sections: INITIAL_SECTIONS,
  activeSectionId: "",
  selectedElementId: null,
  hoveredElementId: null,
  editingElementId: null,

  activeSnapGuides: [],
  distanceBadges: [],
  isDragging: false,
  dropInsertionIndex: null,

  zoom: 1,
  panOffset: { x: 0, y: 0 },

  history: [INITIAL_SECTIONS],
  historyIndex: 0,

  setActiveSectionId: (id) => set({ activeSectionId: id, selectedElementId: null }),

  setLayoutMode: (sectionId, mode) => {
    const { sections, history, historyIndex } = get();
    const updated = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, layoutMode: mode } : sec
    );
    const newHistory = [...history.slice(0, historyIndex + 1), updated];
    set({
      sections: updated,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setSectionGap: (sectionId, gap) => {
    set((state) => ({
      sections: state.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, gap } : sec
      ),
    }));
  },

  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setHoveredElementId: (id) => set({ hoveredElementId: id }),
  setEditingElementId: (id) => set({ editingElementId: id }),

  addElement: (sectionId, elementData, insertIndex) => {
    const id = `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newElement: CanvasElement = { ...elementData, id };
    const { sections, history, historyIndex } = get();

    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const elements = [...sec.elements];
      if (typeof insertIndex === "number" && insertIndex >= 0 && insertIndex <= elements.length) {
        elements.splice(insertIndex, 0, newElement);
      } else {
        elements.push(newElement);
      }
      return { ...sec, elements };
    });

    const newHistory = [...history.slice(0, historyIndex + 1), updated];
    set({
      sections: updated,
      selectedElementId: id,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });

    return newElement;
  },

  updateElement: (sectionId, elementId, patch) => {
    const { sections } = get();
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        elements: sec.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el)),
      };
    });
    set({ sections: updated });
  },

  removeElement: (sectionId, elementId) => {
    const { sections, history, historyIndex } = get();
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        elements: sec.elements.filter((el) => el.id !== elementId),
      };
    });
    const newHistory = [...history.slice(0, historyIndex + 1), updated];
    set({
      sections: updated,
      selectedElementId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  reorderElements: (sectionId, fromIndex, toIndex) => {
    const { sections, history, historyIndex } = get();
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const elements = [...sec.elements];
      const [moved] = elements.splice(fromIndex, 1);
      if (moved) elements.splice(toIndex, 0, moved);
      return { ...sec, elements };
    });
    const newHistory = [...history.slice(0, historyIndex + 1), updated];
    set({
      sections: updated,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setDragState: (isDragging, guides = [], badges = [], dropIndex = null) => {
    set({
      isDragging,
      activeSnapGuides: guides,
      distanceBadges: badges,
      dropInsertionIndex: dropIndex,
    });
  },

  clearSnapGuides: () => {
    set({ activeSnapGuides: [], distanceBadges: [], dropInsertionIndex: null });
  },

  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.25), 2.5) }),
  setPanOffset: (panOffset) => set({ panOffset }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        sections: history[historyIndex - 1],
        historyIndex: historyIndex - 1,
        selectedElementId: null,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        sections: history[historyIndex + 1],
        historyIndex: historyIndex + 1,
        selectedElementId: null,
      });
    }
  },
}));
