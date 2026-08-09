"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
} from "lucide-react";
import GlassCard from "./GlassCard";
import CinematicVideoStage from "./CinematicVideoStage";

export default function XiteCinematicSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Phase refs for scroll sequence
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLDivElement>(null);

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

      if (
        !containerRef.current ||
        !stageRef.current ||
        !videoWrapperRef.current ||
        isReducedMotion
      ) {
        return;
      }

      // Master Scrubbed Timeline pinned across container
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: stageRef.current,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Optional video current time scrub
            if (videoRef.current && videoRef.current.duration) {
              videoRef.current.currentTime =
                self.progress * videoRef.current.duration;
            }
          },
        },
      });

      // Timeline Sequence Setup
      // Phase 1 (0 -> 0.3): Hero Title Entrance & Video Scale down from full view to viewport stage
      timeline
        .fromTo(
          videoWrapperRef.current,
          { scale: 1.15, opacity: 0.4, filter: "blur(8px)" },
          { scale: 0.9, opacity: 1, filter: "blur(0px)", ease: "power2.out" },
          0
        )
        .fromTo(
          phase1Ref.current,
          { opacity: 1, y: 0 },
          { opacity: 0, y: -50, ease: "power2.in" },
          0.2
        );

      // Phase 2 (0.35 -> 0.65): Glass Cards Feature Reveal
      timeline
        .fromTo(
          phase2Ref.current,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, ease: "power2.out" },
          0.35
        )
        .to(
          videoWrapperRef.current,
          { scale: 0.82, opacity: 0.85 },
          0.35
        )
        .to(
          phase2Ref.current,
          { opacity: 0, y: -40, ease: "power2.in" },
          0.65
        );

      // Phase 3 (0.7 -> 1.0): Hero CTA & Specular Summary
      timeline
        .fromTo(
          phase3Ref.current,
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, ease: "power2.out" },
          0.7
        )
        .to(
          videoWrapperRef.current,
          { scale: 1, opacity: 0.95 },
          0.7
        );
    },
    { scope: containerRef, dependencies: [isReducedMotion] }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#000000] text-white min-h-[350vh] selection:bg-white selection:text-black"
      aria-label="XITE Cinematic Product Experience"
    >
      {/* Pinned Stage Window */}
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#000000] p-4 sm:p-8 md:p-12"
      >
        {/* Subdued Ambient Specular Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_70%)] pointer-events-none" />

        {/* Video Canvas Container (GPU Accelerated) */}
        <div
          ref={videoWrapperRef}
          className="absolute inset-4 sm:inset-10 md:inset-16 max-w-6xl mx-auto h-[65vh] sm:h-[75vh] z-0 transform-gpu will-change-transform transition-all duration-300"
        >
          <CinematicVideoStage ref={videoRef} />
        </div>

        {/* Floating Typography & UI Layer */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center pointer-events-none">
          {/* Phase 1: Intro Title */}
          <div
            ref={phase1Ref}
            className="absolute flex flex-col items-center max-w-3xl px-4 pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl text-xs font-mono tracking-widest text-neutral-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
              <span>XITE CINEMATIC ARCHITECTURE</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none mb-6">
              THE NEXT DIMENSION OF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-500">
                CREATIVE FREEDOM
              </span>
            </h2>

            <p className="text-sm sm:text-lg text-neutral-400 max-w-xl font-normal leading-relaxed">
              Scroll to explore the sub-millisecond real-time rendering engine engineered for high-fidelity interactive media.
            </p>
          </div>

          {/* Phase 2: Feature Glass Cards Grid */}
          <div
            ref={phase2Ref}
            className="absolute opacity-0 w-full max-w-4xl px-4 pointer-events-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
          >
            <GlassCard className="p-6 text-left flex flex-col justify-between h-56" glow>
              <div>
                <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] w-fit mb-4">
                  <Zap className="w-5 h-5 text-white/90" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                  Prismatic Engine
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Real-time light refraction and volumetric occlusion shaders executed at 120 FPS.
                </p>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">
                01 / LIGHTING
              </span>
            </GlassCard>

            <GlassCard className="p-6 text-left flex flex-col justify-between h-56" glow>
              <div>
                <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] w-fit mb-4">
                  <Cpu className="w-5 h-5 text-white/90" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                  8K Neural Pipeline
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Hardware-accelerated AI frame synthesis with zero perceived latency.
                </p>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">
                02 / RENDERING
              </span>
            </GlassCard>

            <GlassCard className="p-6 text-left flex flex-col justify-between h-56" glow>
              <div>
                <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] w-fit mb-4">
                  <Layers className="w-5 h-5 text-white/90" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                  Sub-ms Sync
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Continuous scroll-scrubbed timing loop powered by GSAP and Lenis engine.
                </p>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">
                03 / TIMING
              </span>
            </GlassCard>
          </div>

          {/* Phase 3: Final Hero CTA */}
          <div
            ref={phase3Ref}
            className="absolute opacity-0 flex flex-col items-center max-w-2xl px-4 pointer-events-auto"
          >
            <GlassCard className="p-8 sm:p-10 text-center flex flex-col items-center w-full">
              <div className="p-3 rounded-full bg-white/[0.05] border border-white/[0.1] mb-6">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
                ENGINEERED FOR THE UNIMAGINABLE
              </h2>

              <p className="text-xs sm:text-sm text-neutral-400 mb-8 max-w-md">
                Experience maximum creative precision built on pure black cinematic architecture.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  className="px-6 py-3.5 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Request Early Access <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  className="px-6 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white font-semibold text-xs tracking-wider uppercase hover:bg-white/[0.1] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  System Specifications
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
