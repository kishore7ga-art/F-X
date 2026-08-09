"use client";

import { useEffect, useState, useRef } from "react";

export default function Preloader() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHidden, setIsHidden] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("xite_editor_preloader_shown") === "true";
    }
    return false;
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isHidden) return;

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("xite_editor_preloader_shown", "true");
      }
    } catch {}

    // 1. Force muted video autoplay with error handling
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn("Editor preloader video autoplay fallback:", err);
      });
    }

    // 2. Smooth progress increment up to 100%
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12 + 6);
      });
    }, 100);

    const handleComplete = () => {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoaded(true);
        setTimeout(() => setIsHidden(true), 600);
      }, 400);
    };

    // Ensure preloader completes after max 2.2s fallback
    const safetyTimeout = setTimeout(handleComplete, 2200);

    if (document.readyState === "complete") {
      setTimeout(handleComplete, 1200);
    } else {
      window.addEventListener("load", () => setTimeout(handleComplete, 800));
    }

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
    };
  }, []);

  if (isHidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center transition-all duration-700 ease-in-out select-none ${
        isLoaded ? "opacity-0 pointer-events-none scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Preloader Video Container */}
      <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center overflow-hidden px-4">
        <video
          ref={videoRef}
          src="/preloader.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-contain pointer-events-none z-10"
        />

        {/* Ambient Specular Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.85)_80%,rgba(0,0,0,1)_100%)] pointer-events-none" />
      </div>

      {/* Sleek Bottom Loading Bar & Percentage Counter */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-64 text-center z-10">
        <div className="flex items-center justify-between w-full text-xs font-mono text-neutral-400 font-bold uppercase tracking-widest px-1">
          <span>LOADING STUDIO</span>
          <span className="text-white">{loadingProgress}%</span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden p-[1px] border border-white/[0.1] backdrop-blur-md">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(99,102,241,0.8)]"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
