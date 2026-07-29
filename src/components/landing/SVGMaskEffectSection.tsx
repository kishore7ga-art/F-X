"use client";
import { MaskContainer } from "@/components/ui/svg-mask-effect";

export function SVGMaskEffectDemo() {
  return (
    <div className="flex h-[42rem] w-full items-center justify-center overflow-hidden bg-black">
      <MaskContainer
        revealText={
          <p className="mx-auto max-w-5xl text-center text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-neutral-300 leading-tight">
            The future of college web design is zero code and instant publishing. Build NAAC compliant websites in minutes.
          </p>
        }
        className="h-[42rem] rounded-md border border-neutral-800 text-white"
      >
        Empower your institution with{" "}
        <span className="text-blue-500">XITE Visual Builder</span>, AI auto-content generation, and{" "}
        <span className="text-purple-400">1-click domain publishing</span>.
      </MaskContainer>
    </div>
  );
}
