import { cn } from "@/lib/cn";

/**
 * The blurred colour field behind the hero and the closing banner.
 *
 * Three positioned blobs rather than one animated gradient. A gradient large
 * enough to fill a viewport repaints its whole layer on every frame of a
 * `background-position` animation; three small elements being transformed stay
 * on the compositor and cost the main thread nothing. Under 80px of blur the
 * two are indistinguishable except in a frame counter.
 *
 * The stagger is what stops it looking like one object breathing — each blob
 * starts partway through the same cycle, so they drift past each other and the
 * field never repeats visibly.
 *
 * A server component. Nothing here needs state, an event or the browser, and
 * shipping a client bundle to position three divs would be paying hydration
 * cost for decoration.
 */
export function GradientMesh({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <span
        className="mesh-blob -left-[10%] -top-[20%] h-[46rem] w-[46rem] opacity-[0.28]"
        style={{ background: "var(--color-accent)" }}
      />
      <span
        className="mesh-blob -right-[12%] top-[4%] h-[40rem] w-[40rem] opacity-[0.22]"
        style={{
          background: "var(--color-mesh-violet)",
          animationDelay: "-9s",
        }}
      />
      <span
        className="mesh-blob bottom-[-25%] left-[28%] h-[34rem] w-[34rem] opacity-[0.14]"
        style={{
          background: "var(--color-mesh-ember)",
          animationDelay: "-18s",
        }}
      />
    </div>
  );
}
