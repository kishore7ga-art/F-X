"use client";
import React from "react";
import { Cover } from "@/components/ui/cover";

export default function CoverSection() {
  return (
    <section className="w-full bg-black py-20 relative overflow-hidden">

      <div>
        <h2 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white">
          Creating College Websites <br /> at <Cover>Lightning Speed</Cover>
        </h2>
      </div>
    </section>
  );
}
