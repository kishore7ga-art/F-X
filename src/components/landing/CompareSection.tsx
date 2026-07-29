"use client";
import React from "react";
import { Compare } from "@/components/ui/compare";

export default function CompareSection() {
  return (
    <section className="w-full bg-black py-24 relative overflow-hidden flex flex-col items-center justify-center">


      <div className="text-center mb-12 px-6">
        <p className="text-blue-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">
          BEFORE & AFTER XITE
        </p>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-4">
          See the Difference
        </h2>
        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Drag the handle left and right to compare legacy traditional college websites with modern websites built using XITE.
        </p>
      </div>

      <div className="p-3 sm:p-4 border rounded-3xl bg-neutral-950 border-neutral-800 max-w-5xl mx-auto shadow-2xl w-full px-4">
        <Compare
          firstImage="/without-xite.png"
          secondImage="/with-xite.png"
          leftBadge="WITHOUT XITE"
          leftTitle="Traditional College Website"
          leftDescription="Outdated design, difficult to maintain, poor user experience."
          rightBadge="WITH XITE"
          rightTitle="Website Built with XITE"
          rightDescription="Modern design, responsive layout, easy to customize, ready to publish."
          firstImageClassName="object-cover object-top"
          secondImageClassname="object-cover object-top"
          className="h-[320px] sm:h-[450px] md:h-[550px] w-full rounded-2xl"
          slideMode="drag"
        />
      </div>
    </section>
  );
}
