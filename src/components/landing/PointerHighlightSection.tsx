"use client";
import React from "react";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export default function PointerHighlightSection() {
  return (
    <section className="w-full bg-black py-24 relative overflow-hidden flex flex-col items-center justify-center text-center px-6">
      <div className="mx-auto max-w-6xl py-16 text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl xl:text-8xl leading-none">
        The best way to launch <br className="hidden sm:inline" />
        your institution online is to{" "}
        <PointerHighlight
          rectangleClassName="border-blue-500 rounded-xl bg-blue-500/15"
          pointerClassName="text-blue-400"
        >
          <span className="text-blue-400 px-3 py-1">build with XITE</span>
        </PointerHighlight>
      </div>
    </section>
  );
}
