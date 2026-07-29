"use client";
import React from "react";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export default function PointerHighlightSection() {
  return (
    <section className="w-full bg-black py-20 relative overflow-hidden flex flex-col items-center justify-center text-center px-6">


      <div className="mx-auto max-w-4xl py-12 text-3xl font-black tracking-tight text-white md:text-5xl lg:text-6xl leading-tight">
        The best way to launch <br className="hidden sm:inline" />
        your institution online is to{" "}
        <PointerHighlight
          rectangleClassName="border-blue-500 rounded-lg bg-blue-500/10"
          pointerClassName="text-blue-400"
        >
          <span className="text-blue-400 px-2 py-1">build with XITE</span>
        </PointerHighlight>
      </div>
    </section>
  );
}
