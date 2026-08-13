"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function XitePreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;

        const rawProgress = 1 - rect.top / vh;
        const progress = Math.max(0, Math.min(1, rawProgress));

        const scale = 0.97 + progress * 0.03;        // 0.97 → 1.0 subtle
        const translateY = 40 - progress * 40;        // slides up gently
        const opacity = Math.min(1, progress * 1.6);  // fades in

        img.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        img.style.opacity = String(opacity);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black w-full flex items-center justify-center py-20 px-6"
    >
      <div
        ref={imgRef}
        style={{
          opacity: 0,
          transform: "scale(0.97) translateY(40px)",
          willChange: "transform, opacity",
          transformOrigin: "center center",
          maxWidth: "780px",
          width: "100%",
          borderRadius: "12px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <Image
          src="/xite-preview.jpeg"
          alt="XITE Preview"
          width={1200}
          height={800}
          quality={95}
          priority
          className="w-full h-auto block"
        />
      </div>
    </section>
  );
}
