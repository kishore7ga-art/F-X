"use client";

import dynamic from "next/dynamic";

/**
 * The SSR boundary for the hero scene, and the only one.
 *
 * three reads `window` and `document` at module scope, so it cannot be evaluated
 * during the server render — and in the App Router a `"use client"` component is
 * still rendered on the server to produce the initial HTML. "It's a client
 * component" is therefore not enough on its own, which is the trap here: the one
 * existing R3F component in this codebase (`canvas-reveal-effect`) has no dynamic
 * import and gets away with it only because it mounts on hover, after hydration.
 * A hero renders immediately and would not.
 *
 * `ssr: false` also has to be applied from inside a client component — it is
 * rejected in a Server Component — which is why this wrapper is `"use client"`
 * and `HeroCanvas` is imported through it rather than by the section directly.
 *
 * One boundary rather than one per scene: every later stage's scene loads through
 * here, so there is a single place this can be got wrong.
 */
const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});

/**
 * What occupies the frame until WebGL is up.
 *
 * Not a spinner. The scene arrives in a few hundred milliseconds on a warm cache
 * and a spinner in a 15:8 letterbox reads as breakage; a still surface that
 * matches the frame it sits in reads as loading. It also holds the exact height
 * the canvas will take, so nothing on the page moves when the two swap.
 */
function CanvasSkeleton() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 animate-pulse bg-gradient-to-b from-neutral-900 to-neutral-950"
    />
  );
}

/**
 * The hero's visual, sized by its container rather than by the canvas.
 *
 * `aspect-[2700/1440]` is the screenshot's own ratio, kept deliberately: the
 * canvas has no intrinsic size, so without a box to fill it would collapse to
 * zero height and the section would jump. Matching the old image's ratio means
 * this stage changes what is in the frame and nothing about the layout around it.
 */
export function HeroStage() {
  return (
    <div className="relative aspect-[2700/1440] w-full overflow-hidden rounded-xl border border-neutral-800 shadow-2xl">
      <HeroCanvas />
    </div>
  );
}
