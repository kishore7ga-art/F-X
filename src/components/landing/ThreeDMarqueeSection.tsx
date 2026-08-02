"use client";
import React from "react";
import Link from "next/link";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

export function ThreeDMarqueeDemoSecond() {
  const images = [
    "/marquee-builder-1.jpg",
    "/marquee-builder-2.jpg",
    "/marquee-builder-3.jpg",
    "/marquee-builder-4.jpg",
    "/tab-ready-templates.png",
    "/template-brightwood.jpg",
    "/template-evergreen.jpg",
    "/template-calistoga.jpg",
    "/template-oakwood.jpg",
    "/xite-editor-hero.jpg",
    "/marquee-builder-1.jpg",
    "/marquee-builder-2.jpg",
    "/marquee-builder-3.jpg",
    "/marquee-builder-4.jpg",
    "/tab-ready-templates.png",
    "/template-brightwood.jpg",
    "/template-evergreen.jpg",
    "/template-calistoga.jpg",
    "/template-oakwood.jpg",
    "/xite-editor-hero.jpg",
  ];

  return (
    <div className="relative mx-auto my-10 flex h-[85vh] min-h-[620px] w-full max-w-7xl flex-col items-center justify-center overflow-hidden rounded-3xl bg-black border border-neutral-800 shadow-2xl">
      {/* 3D Tilted Cards Background Grid - Full Edge to Edge */}
      <ThreeDMarquee
        className="pointer-events-none absolute inset-0 h-full w-full opacity-90 scale-105"
        images={images}
      />

      {/* Light gradient overlay for text contrast while keeping background grid 100% visible */}
      <div className="absolute inset-0 z-10 h-full w-full bg-gradient-to-b from-black/60 via-black/20 to-black/70 pointer-events-none" />

      {/* Floating text content without heavy blocking box */}
      <div className="relative z-20 mx-auto max-w-4xl flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-black text-white md:text-6xl lg:text-7xl tracking-tight leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
          Build Your College Website in{" "}
          <span className="relative inline-block rounded-2xl bg-blue-600/70 px-5 py-1.5 text-white underline decoration-blue-400 decoration-[6px] underline-offset-[14px] backdrop-blur-md border border-blue-400/50 shadow-2xl">
            One Platform
          </span>
          .
        </h2>

        <p className="pt-6 text-xl font-extrabold text-blue-400 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] tracking-wide">
          One Builder. Unlimited Possibilities.
        </p>

        <p className="py-4 text-base text-neutral-100 md:text-lg leading-relaxed max-w-2xl font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          Create, customize, and publish stunning college websites without writing code. Xite gives educational institutions everything they need to build a modern digital presence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/start" className="p-[3px] relative inline-block group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl" />
            <div className="px-8 py-3 bg-black rounded-[10px] relative group transition duration-200 text-white font-bold text-base hover:bg-transparent flex items-center justify-center">
              Start Building
            </div>
          </Link>
          <Link href="/start" className="p-[3px] relative inline-block group">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-700 to-neutral-800 rounded-xl" />
            <div className="px-8 py-3 bg-black rounded-[10px] relative group transition duration-200 text-white font-bold text-base hover:bg-transparent flex items-center justify-center">
              Explore Templates
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
