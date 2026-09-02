"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  Columns,
  Grid,
} from "lucide-react";

export interface CardSlot {
  id: string;
  index: number;
  title: string;
  badge?: string;
  html: string;
  containerSelector: string;
}

interface SectionVisualEditorProps {
  isOpen: boolean;
  section: { id: string; title: string; code: string; category?: string } | null;
  onClose: () => void;
  onUpdateSectionCode: (newCode: string) => void;
}

export function SectionVisualEditor({
  isOpen,
  section,
  onClose,
  onUpdateSectionCode,
}: SectionVisualEditorProps) {
  const [cards, setCards] = useState<CardSlot[]>([]);
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Extract cards / content slots from section HTML
  useEffect(() => {
    if (!section?.code || !isOpen) {
      setCards([]);
      return;
    }

    if (typeof window === "undefined") return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(section.code, "text/html");
      const root = doc.body;

      // 1. Try finding explicit cards or articles
      let candidates: HTMLElement[] = Array.from(
        root.querySelectorAll(
          '.card, [data-card], article, .prog-card, [class*="card"], [class*="item"], [class*="feature"], [class*="testimonial"]'
        )
      );

      // 2. If no explicit card classes, find repeating grid / flex children
      if (candidates.length < 2) {
        const containers = Array.from(root.querySelectorAll("div, ul, section"));
        for (const container of containers) {
          const directChildren = Array.from(container.children).filter(
            (c) => !["style", "script", "button", "nav"].includes(c.tagName.toLowerCase())
          ) as HTMLElement[];

          if (directChildren.length >= 2 && directChildren.length <= 12) {
            candidates = directChildren;
            break;
          }
        }
      }

      // 3. Fallback: major structural children
      if (candidates.length < 2) {
        candidates = Array.from(root.children).filter(
          (c) => !["style", "script"].includes(c.tagName.toLowerCase())
        ) as HTMLElement[];
      }

      const extracted: CardSlot[] = candidates.map((el, idx) => {
        // Extract a human-readable title
        const heading = el.querySelector("h1, h2, h3, h4, h5, h6, strong, .card-title, b");
        const titleText = heading?.textContent?.trim() || el.textContent?.trim().slice(0, 30) || `Card ${idx + 1}`;

        return {
          id: el.id || `slot-${idx}`,
          index: idx,
          title: titleText,
          badge: el.tagName.toLowerCase(),
          html: el.outerHTML,
          containerSelector: el.parentElement?.tagName.toLowerCase() || "div",
        };
      });

      setCards(extracted);
    } catch {
      setCards([]);
    }
  }, [section?.code, isOpen]);

  // Apply reordered cards back to section HTML
  const commitCardsOrder = useCallback(
    (newCardsOrder: CardSlot[]) => {
      if (!section?.code || newCardsOrder.length < 2) return;

      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(section.code, "text/html");
        const root = doc.body;

        // Re-identify matching candidates
        let candidates: HTMLElement[] = Array.from(
          root.querySelectorAll(
            '.card, [data-card], article, .prog-card, [class*="card"], [class*="item"], [class*="feature"], [class*="testimonial"]'
          )
        );

        if (candidates.length < 2) {
          const containers = Array.from(root.querySelectorAll("div, ul, section"));
          for (const container of containers) {
            const directChildren = Array.from(container.children).filter(
              (c) => !["style", "script", "button", "nav"].includes(c.tagName.toLowerCase())
            ) as HTMLElement[];
            if (directChildren.length >= 2 && directChildren.length <= 12) {
              candidates = directChildren;
              break;
            }
          }
        }

        if (candidates.length < 2) {
          candidates = Array.from(root.children).filter(
            (c) => !["style", "script"].includes(c.tagName.toLowerCase())
          ) as HTMLElement[];
        }

        if (candidates.length >= 2 && candidates[0].parentElement) {
          const parent = candidates[0].parentElement;
          const originalElements = [...candidates];

          // Re-append in the new order
          newCardsOrder.forEach((card) => {
            const el = originalElements[card.index];
            if (el && el.parentElement === parent) {
              parent.appendChild(el);
            }
          });

          // Normalize indices in state
          const updatedCards = newCardsOrder.map((c, i) => ({ ...c, index: i }));
          setCards(updatedCards);

          const updatedHtml = root.innerHTML;
          onUpdateSectionCode(updatedHtml);

          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 1500);
        }
      } catch (err) {
        console.error("[VisualEditor] Failed to commit card reorder:", err);
      }
    },
    [section?.code, onUpdateSectionCode]
  );

  // Swap Card Positions
  const swapCards = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= cards.length || fromIdx === toIdx) return;
    const reordered = [...cards];
    const temp = reordered[fromIdx];
    reordered[fromIdx] = reordered[toIdx];
    reordered[toIdx] = temp;
    commitCardsOrder(reordered);
  };

  // Drag & Drop Handlers
  const handleDragStart = (idx: number) => {
    setDraggedCardIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedCardIndex !== null && draggedCardIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleDrop = (idx: number) => {
    if (draggedCardIndex !== null && draggedCardIndex !== idx) {
      const reordered = [...cards];
      const [moved] = reordered.splice(draggedCardIndex, 1);
      reordered.splice(idx, 0, moved);
      commitCardsOrder(reordered);
    }
    setDraggedCardIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedCardIndex(null);
    setDragOverIndex(null);
  };

  if (!isOpen || !section) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex flex-col bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Header Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3.5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Visual Layout &amp; Card Editor</h2>
              <span className="rounded-md bg-blue-600/30 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300">
                {section.title}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Drag cards to reorder, swap slots, or adjust layout structure. Changes reflect live on the canvas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isSaved && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-in fade-in">
              <Check className="h-3.5 w-3.5" /> Saved Live
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 active:scale-95 transition"
          >
            Done
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Visual Work Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Card Slot Overview */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Section Cards &amp; Structural Slots ({cards.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              Drag cards or use arrow controls to rearrange positions
            </span>
          </div>

          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
              <Layers className="h-10 w-10 text-slate-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-300">No Repeating Cards Detected</h4>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                This section layout does not contain discrete repeating card slots. Text elements can still be edited directly on the main canvas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card, idx) => {
                const isDraggingThis = draggedCardIndex === idx;
                const isOverThis = dragOverIndex === idx;

                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative flex flex-col rounded-xl border bg-slate-900/90 shadow-md transition-all duration-200 overflow-hidden ${
                      isDraggingThis
                        ? "opacity-40 border-dashed border-blue-500 scale-95"
                        : isOverThis
                        ? "border-blue-500 ring-2 ring-blue-500/40 translate-y-[-2px]"
                        : "border-slate-800 hover:border-slate-700 hover:shadow-lg"
                    }`}
                  >
                    {/* Slot Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-3.5 py-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600/30 text-[10px] font-mono font-bold text-blue-300">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                          {card.title}
                        </span>
                      </div>

                      {/* Quick Move Arrows & Grip */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => swapCards(idx, idx - 1)}
                          disabled={idx === 0}
                          title="Move Previous"
                          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => swapCards(idx, idx + 1)}
                          disabled={idx === cards.length - 1}
                          title="Move Next"
                          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <div
                          title="Drag to reorder"
                          className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {/* Card Inner Mini Live Preview */}
                    <div className="relative p-3.5 flex-1 min-h-[120px] max-h-[220px] overflow-hidden bg-slate-950/30">
                      <div
                        className="scale-[0.85] origin-top-left pointer-events-none w-[117%] text-slate-300"
                        dangerouslySetInnerHTML={{ __html: card.html }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
