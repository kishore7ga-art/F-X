"use client";
import { MaskContainer } from "@/components/ui/svg-mask-effect";

export default function SVGMaskEffectDemo() {
  return (
    <div className="flex h-[40rem] w-full items-center justify-center overflow-hidden bg-black">
      <MaskContainer
        revealText={
          <p className="mx-auto max-w-4xl text-center text-3xl sm:text-5xl font-black text-white/90 leading-tight px-6">
            Build, edit, and publish official college websites with <span className="text-blue-500">XITE</span>. NAAC-compliant, lightning-fast, and fully customizable.
          </p>
        }
        className="h-[40rem] rounded-2xl border border-white/10 text-white"
      >
        Discover the power of <span className="text-blue-500">XITE AI Builder</span> with instant theme customization, visual editing, and zero-code publishing.
      </MaskContainer>
    </div>
  );
}
