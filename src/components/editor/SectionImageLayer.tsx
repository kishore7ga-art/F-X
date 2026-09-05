"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { PinnedSectionImage } from "@/lib/image-background-remover";
import { removeImageBackground } from "@/lib/image-background-remover";
import {
  Move,
  Trash2,
  Sparkles,
  Maximize2,
  Minimize2,
  Wind,
  Check,
} from "lucide-react";

interface SectionImageLayerProps {
  sectionId: string;
  images: PinnedSectionImage[];
  canvasScale?: number;
  onUpdateImage: (imageId: string, patch: Partial<PinnedSectionImage>) => void;
  onDeleteImage: (imageId: string) => void;
  onMoveToSection: (imageId: string, targetSectionId: string, newX: number, newY: number) => void;
}

export function SectionImageLayer({
  sectionId,
  images,
  canvasScale = 1,
  onUpdateImage,
  onDeleteImage,
  onMoveToSection,
}: SectionImageLayerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processingBgId, setProcessingBgId] = useState<string | null>(null);

  // Active dragging state
  const draggingRef = useRef<{
    imageId: string;
    startX: number;
    startY: number;
    initialImgX: number;
    initialImgY: number;
  } | null>(null);

  // Auto-scroll animation frame ref
  const autoScrollRafRef = useRef<number | null>(null);

  // Stop auto-scroll loop
  const stopAutoScroll = useCallback(() => {
    if (autoScrollRafRef.current !== null) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  // Handle global pointermove and pointerup while dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const activeDrag = draggingRef.current;
      if (!activeDrag) return;

      const scale = canvasScale || 1;
      const dx = (e.clientX - activeDrag.startX) / scale;
      const dy = (e.clientY - activeDrag.startY) / scale;

      const newX = Math.round(activeDrag.initialImgX + dx);
      const newY = Math.round(activeDrag.initialImgY + dy);

      // Check if mouse moved over another section
      const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
      const targetSecEl = hoveredEl?.closest("[data-xite-section]") as HTMLElement | null;
      const targetSecId = targetSecEl?.getAttribute("data-xite-section");

      if (targetSecEl && targetSecId && targetSecId !== sectionId) {
        // Calculate relative coordinates in the target section
        const targetRect = targetSecEl.getBoundingClientRect();
        const targetX = Math.round((e.clientX - targetRect.left) / scale);
        const targetY = Math.round((e.clientY - targetRect.top) / scale);

        onMoveToSection(activeDrag.imageId, targetSecId, targetX, targetY);
        // Transfer drag context
        draggingRef.current = {
          imageId: activeDrag.imageId,
          startX: e.clientX,
          startY: e.clientY,
          initialImgX: targetX,
          initialImgY: targetY,
        };
        return;
      }

      onUpdateImage(activeDrag.imageId, { x: newX, y: newY });

      // Viewport Auto-Scroll detection
      const scrollThreshold = 95;
      const viewportHeight = window.innerHeight;
      let scrollSpeed = 0;

      if (e.clientY < scrollThreshold) {
        // Near top of screen: scroll up
        const intensity = (scrollThreshold - e.clientY) / scrollThreshold;
        scrollSpeed = -Math.max(4, Math.round(intensity * 22));
      } else if (e.clientY > viewportHeight - scrollThreshold) {
        // Near bottom of screen: scroll down
        const intensity = (e.clientY - (viewportHeight - scrollThreshold)) / scrollThreshold;
        scrollSpeed = Math.max(4, Math.round(intensity * 22));
      }

      stopAutoScroll();

      if (scrollSpeed !== 0) {
        const performScroll = () => {
          // Scroll nearest scrollable container or window
          const scrollContainer = document.querySelector(".xite-scroll-pane, main, html") as HTMLElement | null;
          if (scrollContainer) {
            scrollContainer.scrollBy({ top: scrollSpeed, behavior: "auto" });
          } else {
            window.scrollBy({ top: scrollSpeed, behavior: "auto" });
          }
          autoScrollRafRef.current = requestAnimationFrame(performScroll);
        };
        autoScrollRafRef.current = requestAnimationFrame(performScroll);
      }
    };

    const handlePointerUp = () => {
      draggingRef.current = null;
      stopAutoScroll();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      stopAutoScroll();
    };
  }, [canvasScale, sectionId, onMoveToSection, onUpdateImage, stopAutoScroll]);

  // Execute Background Removal for an asset
  const handleRemoveBg = async (img: PinnedSectionImage) => {
    setProcessingBgId(img.id);
    try {
      const transparentUrl = await removeImageBackground(img.url, {
        tolerance: 40,
        featherRadius: 16,
      });
      onUpdateImage(img.id, { url: transparentUrl });
    } finally {
      setProcessingBgId(null);
    }
  };

  const sectionImages = images.filter((img) => img.sectionId === sectionId);
  if (sectionImages.length === 0) return null;

  return (
    <div
      className="xite-section-image-layer pointer-events-none absolute inset-0 z-40 overflow-visible select-none"
      style={{ minHeight: "100%", width: "100%" }}
    >
      <style>{`
        @keyframes xite-pinned-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .xite-floating-asset {
          animation: xite-pinned-float 3.8s ease-in-out infinite;
        }
      `}</style>

      {sectionImages.map((img) => {
        const isSelected = selectedId === img.id;
        const width = img.width || 240;
        const scale = img.scale || 1;

        return (
          <div
            key={img.id}
            data-xite-pinned-image={img.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(img.id);
            }}
            style={{
              position: "absolute",
              left: `${img.x}px`,
              top: `${img.y}px`,
              width: `${Math.round(width * scale)}px`,
              pointerEvents: "auto",
              cursor: "move",
              zIndex: isSelected ? 60 : 40,
              transition: draggingRef.current?.imageId === img.id ? "none" : "outline 0.15s ease",
            }}
            className={`group relative select-none ${img.isFloating ? "xite-floating-asset" : ""}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelectedId(img.id);
              draggingRef.current = {
                imageId: img.id,
                startX: e.clientX,
                startY: e.clientY,
                initialImgX: img.x,
                initialImgY: img.y,
              };
            }}
          >
            {/* The Asset Image */}
            <img
              src={img.url}
              alt={img.name || "Section Asset"}
              draggable={false}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                pointerEvents: "none",
                filter: isSelected ? "drop-shadow(0 14px 28px rgba(0,0,0,0.35))" : "drop-shadow(0 6px 14px rgba(0,0,0,0.22))",
              }}
              className="transition-all duration-200"
            />

            {/* Selection Outline & Handle Bars */}
            {isSelected && (
              <div
                className="absolute -inset-2 rounded-2xl border-2 border-cyan-500/90 pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                style={{ zIndex: 10 }}
              >
                <div className="absolute -top-3 left-3 bg-cyan-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md pointer-events-auto flex items-center gap-1">
                  <Move className="w-2.5 h-2.5" />
                  <span>Fixed on Section</span>
                </div>
              </div>
            )}

            {/* Floating Action Controls on Hover / Selection */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-neutral-950/95 border border-white/20 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-150 ${
                isSelected ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto scale-95 group-hover:scale-100"
              }`}
              style={{ zIndex: 70 }}
            >
              {/* Drag Grip Handle */}
              <button
                type="button"
                title="Drag to reposition anywhere or cross sections"
                className="p-1.5 text-neutral-300 hover:text-white rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing"
              >
                <Move className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-white/15 mx-0.5" />

              {/* Resize Small */}
              <button
                type="button"
                onClick={() => onUpdateImage(img.id, { scale: Math.max(0.4, Number((scale - 0.15).toFixed(2))) })}
                title="Make Smaller"
                className="p-1.5 text-neutral-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {/* Resize Large */}
              <button
                type="button"
                onClick={() => onUpdateImage(img.id, { scale: Math.min(2.5, Number((scale + 0.15).toFixed(2))) })}
                title="Make Larger"
                className="p-1.5 text-neutral-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Floating Animation Toggle */}
              <button
                type="button"
                onClick={() => onUpdateImage(img.id, { isFloating: !img.isFloating })}
                title={img.isFloating ? "Disable Floating Animation" : "Enable Smooth Floating Animation"}
                className={`p-1.5 rounded-lg transition ${
                  img.isFloating ? "bg-cyan-500/30 text-cyan-300" : "text-neutral-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
              </button>

              {/* Remove Background Action */}
              <button
                type="button"
                disabled={processingBgId === img.id}
                onClick={() => handleRemoveBg(img)}
                title="Remove background & make transparent"
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-lg hover:brightness-110 shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                <span>{processingBgId === img.id ? "Processing..." : "Remove BG"}</span>
              </button>

              <div className="w-px h-3.5 bg-white/15 mx-0.5" />

              {/* Delete Image */}
              <button
                type="button"
                onClick={() => onDeleteImage(img.id)}
                title="Delete Image"
                className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
