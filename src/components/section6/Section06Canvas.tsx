"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";

export interface Section06CanvasRef {
  setFrame: (index: number) => void;
}

interface Section06CanvasProps {
  totalFrames?: number;
  className?: string;
}

const Section06Canvas = forwardRef<Section06CanvasRef, Section06CanvasProps>(
  ({ totalFrames = 300, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [loadedCount, setLoadedCount] = useState(0);
    const currentFrameRef = useRef(0);

    // Preload images into memory
    useEffect(() => {
      let isMounted = true;
      const loadedImages: HTMLImageElement[] = [];
      let count = 0;

      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(3, "0");
        img.src = `/section6/ezgif-frame-${frameNum}.jpg`;

        img.onload = () => {
          if (!isMounted) return;
          count++;
          setLoadedCount(count);
        };

        loadedImages.push(img);
      }

      imagesRef.current = loadedImages;

      return () => {
        isMounted = false;
      };
    }, [totalFrames]);

    // Draw frame to canvas with object-fit: cover
    const renderFrame = useCallback((frameIdx: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imagesRef.current[frameIdx];
      if (!img || !img.complete) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.naturalWidth || 1920;
      const imgHeight = img.naturalHeight || 1080;

      // Calculate object-fit: cover scale
      const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const x = (canvasWidth - imgWidth * scale) / 2;
      const y = (canvasHeight - imgHeight * scale) / 2;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
    }, []);

    // Handle Window Resize for canvas resolution
    useEffect(() => {
      const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        renderFrame(currentFrameRef.current);
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [renderFrame]);

    // Expose setFrame method to GSAP ScrollTrigger
    useImperativeHandle(ref, () => ({
      setFrame: (index: number) => {
        const clampedIndex = Math.min(totalFrames - 1, Math.max(0, Math.floor(index)));
        currentFrameRef.current = clampedIndex;
        requestAnimationFrame(() => renderFrame(clampedIndex));
      },
    }), [totalFrames, renderFrame]);

    return (
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover transform-gpu will-change-transform ${className}`}
        />

        {/* Subtle Loading Progress Bar for Asset Preloading */}
        {loadedCount < totalFrames && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/80 border border-white/10 backdrop-blur-md text-[10px] font-mono text-neutral-400 z-30 pointer-events-none transition-opacity duration-500">
            PRELOADING BRAND ENGINE: {Math.round((loadedCount / totalFrames) * 100)}%
          </div>
        )}
      </div>
    );
  }
);

Section06Canvas.displayName = "Section06Canvas";

export default Section06Canvas;
