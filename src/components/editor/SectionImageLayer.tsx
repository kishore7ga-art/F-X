"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { PinnedSectionImage } from "@/lib/image-background-remover";
import {
  Move,
  Trash2,
  Maximize2,
  Minimize2,
  Wind,
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

  // Active dragging state (position move)
  const draggingRef = useRef<{
    imageId: string;
    startX: number;
    startY: number;
    initialImgX: number;
    initialImgY: number;
  } | null>(null);

  // Active resizing state (corner drag)
  const resizingRef = useRef<{
    imageId: string;
    handle: "se" | "sw" | "ne" | "nw";
    startX: number;
    startY: number;
    initialWidth: number;
    initialX: number;
    initialY: number;
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

  // Handle global pointermove and pointerup while dragging or resizing
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const scale = canvasScale || 1;

      // 1. Handle Corner Resizing
      if (resizingRef.current) {
        const resize = resizingRef.current;
        const dx = (e.clientX - resize.startX) / scale;

        let newWidth = resize.initialWidth;
        let newX = resize.initialX;
        let newY = resize.initialY;

        if (resize.handle === "se" || resize.handle === "ne") {
          newWidth = Math.max(60, Math.min(1400, Math.round(resize.initialWidth + dx)));
        } else if (resize.handle === "sw" || resize.handle === "nw") {
          newWidth = Math.max(60, Math.min(1400, Math.round(resize.initialWidth - dx)));
          newX = Math.round(resize.initialX + (resize.initialWidth - newWidth));
        }

        onUpdateImage(resize.imageId, { width: newWidth, scale: 1, x: newX, y: newY });
        return;
      }

      // 2. Handle Position Dragging
      const activeDrag = draggingRef.current;
      if (!activeDrag) return;

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
        const intensity = (scrollThreshold - e.clientY) / scrollThreshold;
        scrollSpeed = -Math.max(4, Math.round(intensity * 22));
      } else if (e.clientY > viewportHeight - scrollThreshold) {
        const intensity = (e.clientY - (viewportHeight - scrollThreshold)) / scrollThreshold;
        scrollSpeed = Math.max(4, Math.round(intensity * 22));
      }

      stopAutoScroll();

      if (scrollSpeed !== 0) {
        const performScroll = () => {
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
      resizingRef.current = null;
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
        const currentWidth = Math.round((img.width || 240) * (img.scale || 1));

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
              width: `${currentWidth}px`,
              pointerEvents: "auto",
              cursor: "move",
              zIndex: isSelected ? 60 : 40,
              transition:
                draggingRef.current?.imageId === img.id || resizingRef.current?.imageId === img.id
                  ? "none"
                  : "outline 0.15s ease",
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
                filter: isSelected
                  ? "drop-shadow(0 14px 28px rgba(0,0,0,0.35))"
                  : "drop-shadow(0 6px 14px rgba(0,0,0,0.22))",
              }}
              className="transition-all duration-200"
            />

            {/* Selection Outline & Corner Resize Handles */}
            {isSelected && (
              <>
                <div
                  className="absolute -inset-1.5 rounded-xl border-2 border-indigo-500 pointer-events-none shadow-[0_0_15px_rgba(99,102,241,0.45)]"
                  style={{ zIndex: 10 }}
                >
                  <div className="absolute -top-3 left-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md pointer-events-auto flex items-center gap-1">
                    <Move className="w-2.5 h-2.5" />
                    <span>{currentWidth}px</span>
                  </div>
                </div>

                {/* 1. Bottom-Right Corner Resize Handle */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    resizingRef.current = {
                      imageId: img.id,
                      handle: "se",
                      startX: e.clientX,
                      startY: e.clientY,
                      initialWidth: currentWidth,
                      initialX: img.x,
                      initialY: img.y,
                    };
                  }}
                  title="Drag to resize size"
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-md hover:scale-125 transition-transform cursor-se-resize pointer-events-auto"
                  style={{ zIndex: 65 }}
                />

                {/* 2. Bottom-Left Corner Resize Handle */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    resizingRef.current = {
                      imageId: img.id,
                      handle: "sw",
                      startX: e.clientX,
                      startY: e.clientY,
                      initialWidth: currentWidth,
                      initialX: img.x,
                      initialY: img.y,
                    };
                  }}
                  title="Drag to resize size"
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-md hover:scale-125 transition-transform cursor-sw-resize pointer-events-auto"
                  style={{ zIndex: 65 }}
                />

                {/* 3. Top-Right Corner Resize Handle */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    resizingRef.current = {
                      imageId: img.id,
                      handle: "ne",
                      startX: e.clientX,
                      startY: e.clientY,
                      initialWidth: currentWidth,
                      initialX: img.x,
                      initialY: img.y,
                    };
                  }}
                  title="Drag to resize size"
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-md hover:scale-125 transition-transform cursor-ne-resize pointer-events-auto"
                  style={{ zIndex: 65 }}
                />

                {/* 4. Top-Left Corner Resize Handle */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    resizingRef.current = {
                      imageId: img.id,
                      handle: "nw",
                      startX: e.clientX,
                      startY: e.clientY,
                      initialWidth: currentWidth,
                      initialX: img.x,
                      initialY: img.y,
                    };
                  }}
                  title="Drag to resize size"
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-md hover:scale-125 transition-transform cursor-nw-resize pointer-events-auto"
                  style={{ zIndex: 65 }}
                />
              </>
            )}

            {/* Floating Action Controls on Hover / Selection */}
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 bg-slate-900/95 text-white border border-slate-700/90 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-150 ${
                isSelected
                  ? "opacity-100 pointer-events-auto scale-100"
                  : "opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto scale-95 group-hover:scale-100"
              }`}
              style={{ zIndex: 70 }}
            >
              {/* Drag Grip Handle */}
              <button
                type="button"
                title="Drag to reposition anywhere or cross sections"
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing"
              >
                <Move className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

              {/* Resize Buttons & Dimension Value */}
              <div className="flex items-center gap-0.5 bg-slate-800/90 px-1 py-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateImage(img.id, {
                      width: Math.max(60, currentWidth - 30),
                      scale: 1,
                    })
                  }
                  title="Make Smaller (-30px)"
                  className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10"
                >
                  <Minimize2 className="w-3 h-3" />
                </button>

                <span className="text-[10px] font-mono font-bold text-indigo-300 px-1 select-none min-w-[38px] text-center">
                  {currentWidth}px
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateImage(img.id, {
                      width: Math.min(1400, currentWidth + 30),
                      scale: 1,
                    })
                  }
                  title="Make Larger (+30px)"
                  className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>

              {/* Quick Size Slider */}
              <input
                type="range"
                min={60}
                max={900}
                step={10}
                value={currentWidth}
                onChange={(e) =>
                  onUpdateImage(img.id, {
                    width: Number(e.target.value),
                    scale: 1,
                  })
                }
                className="w-16 h-1 accent-indigo-500 bg-slate-700 rounded-lg cursor-pointer"
                title="Adjust Size"
              />

              <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

              {/* Floating Animation Toggle */}
              <button
                type="button"
                onClick={() => onUpdateImage(img.id, { isFloating: !img.isFloating })}
                title={img.isFloating ? "Disable Float Effect" : "Enable Smooth Float Effect"}
                className={`p-1 rounded-lg transition ${
                  img.isFloating
                    ? "bg-indigo-500/30 text-indigo-300"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

              {/* Dedicated Delete Button */}
              <button
                type="button"
                onClick={() => onDeleteImage(img.id)}
                title="Delete Image"
                className="flex items-center gap-1 px-1.5 py-1 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">Delete</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
