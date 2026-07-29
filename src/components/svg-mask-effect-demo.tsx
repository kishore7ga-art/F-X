"use client";
import { MaskContainer } from "@/components/ui/svg-mask-effect";

export default function SVGMaskEffectDemo() {
  return (
    <div className="flex h-[36rem] w-full items-center justify-center overflow-hidden bg-black px-4 py-8">
      <MaskContainer
        revealSize={220}
        revealText={
          <p className="mx-auto max-w-5xl text-center text-3xl sm:text-5xl md:text-6xl font-black text-neutral-400 leading-tight px-6">
            Create, edit, and publish official college websites with <span className="text-white">XITE AI Builder</span>. NAAC-compliant, lightning-fast, and fully customizable.
          </p>
        }
        className="h-full max-w-6xl rounded-3xl border border-white/10 text-white"
      >
        <p className="mx-auto max-w-5xl text-center text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight px-6">
          Create, edit, and publish official college websites with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">XITE AI Builder</span>. NAAC-compliant, lightning-fast, and fully customizable.
        </p>
      </MaskContainer>
    </div>
  );
}
