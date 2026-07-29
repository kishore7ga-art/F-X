"use client";
import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";

export function BackgroundLinesDemo() {
  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-6">
      <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-white via-neutral-100 to-neutral-500 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black py-4 relative z-20 tracking-tight leading-tight max-w-6xl">
        Build Better College Websites. <br /> Faster Than Ever.
      </h2>
      <p className="max-w-3xl mx-auto text-base sm:text-xl md:text-2xl text-neutral-300 text-center font-medium leading-relaxed mt-4">
        XITE gives educational institutions modern templates, automated NAAC compliance structure, and full drag-and-drop control — no technical team needed.
      </p>
    </BackgroundLines>
  );
}
