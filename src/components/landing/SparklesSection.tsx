"use client";

import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";

export default function SparklesSection() {
  return (
    <div className="h-[32rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
      {/* Top fade from the MacBook section */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />

      {/* Headline */}
      <h2 className="md:text-6xl text-3xl lg:text-8xl font-black text-center text-white relative z-20 tracking-tighter leading-none">
        Powered by{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-400 to-purple-400">
          Creativity
        </span>
      </h2>

      <p className="text-neutral-400 text-sm md:text-base mt-4 text-center max-w-xl relative z-20 px-6 leading-relaxed">
        A modern visual website builder designed for educational institutions. Build, customize, and publish with ease.
      </p>

      {/* Sparkle beam */}
      <div className="w-[36rem] max-w-full h-32 relative mt-6">
        {/* Gradient lines */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        

        {/* Radial mask so edges fade out cleanly */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_180px_at_top,transparent_20%,white)]" />
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
    </div>
  );
}
