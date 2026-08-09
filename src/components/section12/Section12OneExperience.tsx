"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section12Canvas, { Section12CanvasRef } from "./Section12Canvas";

export default function Section12OneExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Section12CanvasRef>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current || isReducedMotion) {
        return;
      }

      const frameObj = { frame: 0 };

      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      }).to(
        frameObj,
        {
          frame: 299,
          snap: "frame",
          ease: "none",
          onUpdate: () => {
            canvasRef.current?.setFrame(frameObj.frame);
          },
        },
        0
      );
    },
    { scope: containerRef, dependencies: [isReducedMotion] }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#000000] min-h-[500vh]"
      aria-label="Section 12 — Every Screen. One Experience."
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#000000]">
        <div className="absolute inset-0 w-full h-full z-0 transform-gpu">
          <Section12Canvas ref={canvasRef} />
        </div>
      </div>
    </section>
  );
}
