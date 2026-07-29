"use client";
import React from "react";
import { Cover } from "@/components/ui/cover";

export default function CoverSection() {
  return (
    <section className="w-full bg-black py-28 relative overflow-hidden">
      <div>
        <h2 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black max-w-7xl mx-auto text-center relative z-20 py-8 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white tracking-tight leading-none">
          Creating College Websites <br /> at <span className="bg-gradient-to-r from-blue-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">Lightning Speed</span>
        </h2>
      </div>
    </section>
  );
}
