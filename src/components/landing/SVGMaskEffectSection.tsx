"use client";
import { MaskContainer } from "@/components/ui/svg-mask-effect";

export function SVGMaskEffectDemo() {
  return (
    <div className="flex h-[42rem] w-full items-center justify-center overflow-hidden bg-black">
      <MaskContainer
        revealText={
          <span>
            The future of college web design is zero code and instant publishing. Build NAAC compliant websites in minutes.
          </span>
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
