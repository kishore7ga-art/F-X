"use client";

import { useEffect, useRef } from "react";

/**
 * A gooey liquid trail that follows the pointer.
 *
 * Blobs are drawn to a canvas and then run through an SVG filter that blurs
 * them and pushes the alpha channel through a steep contrast curve. That second
 * step is the whole effect: blurring alone gives soft circles, but ramping the
 * alpha afterwards snaps the blurred edges back to hard ones — so two nearby
 * blobs merge into a single shape with a meniscus between them instead of
 * overlapping as two discs.
 *
 * Four things about this are performance decisions rather than style ones, and
 * they matter because the filter is expensive enough to be the most costly
 * thing on the page if left alone:
 *
 * The canvas is rendered at a fraction of its display size and scaled up by
 * CSS. A full-screen `feGaussianBlur` re-rasterises every pixel every frame;
 * at 0.55 that is under a third of the work, and it is invisible because the
 * first thing the filter does is blur away the detail you would have paid for.
 *
 * The blob count is capped. The original had no ceiling — a fast drag adds ten
 * a frame, each living a hundred frames, so a few seconds of movement reaches a
 * thousand filled arcs under a full-screen blur.
 *
 * The loop stops. With no blobs left and a still pointer there is nothing to
 * draw, so it idles instead of burning a frame to clear an empty canvas.
 *
 * And it never runs without a mouse or against a reduced-motion preference.
 */

/** The pasted palette. Vivid, and deliberately overridable. */
export const LIQUID_COLORS = [
  "#FF0080",
  "#7928CA",
  "#0070F3",
  "#00DFD8",
  "#FF4D4D",
  "#FFD700",
];

/** Gold family, for when the trail should belong to this page's palette. */
export const LIQUID_COLORS_BRAND = [
  "#D9A441",
  "#F3D99A",
  "#B8863B",
  "#F2F0EC",
];

type Blob = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
  color: string;
};

/** Above the cap, the oldest blob is dropped to make room for the newest. */
const MAX_BLOBS = 140;

/** Canvas pixels per CSS pixel. The blur hides everything this costs. */
const RESOLUTION = 0.55;

export function LiquidCursor({
  colors = LIQUID_COLORS,
}: {
  colors?: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // No pointer, no cursor — on a touch screen this is a rAF loop and a
    // full-screen filter running forever for something nobody can see.
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const blobs: Blob[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, seen: false };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * RESOLUTION);
      canvas.height = Math.round(height * RESOLUTION);
    };

    const spawn = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.5;

      if (blobs.length >= MAX_BLOBS) blobs.shift();
      blobs.push({
        x: x * RESOLUTION,
        y: y * RESOLUTION,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        radius: (Math.random() * 20 + 10) * RESOLUTION,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      // First sighting: seed the previous position, or the very first move
      // draws a streak all the way from the origin.
      if (!pointer.seen) {
        pointer.seen = true;
        pointer.lastX = pointer.x;
        pointer.lastY = pointer.y;
      }

      // Interpolate along the segment the pointer just covered, so a fast
      // flick leaves a continuous trail rather than a dotted line.
      const dx = pointer.x - pointer.lastX;
      const dy = pointer.y - pointer.lastY;
      const distance = Math.hypot(dx, dy);

      if (distance > 0) {
        const steps = Math.min(Math.ceil(distance / 8), 8);
        for (let i = 0; i < steps; i += 1) {
          const t = i / steps;
          spawn(pointer.lastX + dx * t, pointer.lastY + dy * t);
        }
      }

      pointer.lastX = pointer.x;
      pointer.lastY = pointer.y;
      start();
    };

    function tick() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = blobs.length - 1; i >= 0; i -= 1) {
        const blob = blobs[i];

        blob.life -= 0.012;
        blob.x += blob.vx;
        blob.y += blob.vy;
        blob.radius *= 0.985;

        if (blob.life <= 0 || blob.radius < 0.5) {
          blobs.splice(i, 1);
          continue;
        }

        ctx!.globalAlpha = blob.life;
        ctx!.fillStyle = blob.color;
        ctx!.beginPath();
        ctx!.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // Nothing left to draw and no movement to react to: stop, rather than
      // spend a frame clearing an empty canvas until the tab closes.
      if (!blobs.length) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [colors]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] hidden overflow-hidden lg:block"
    >
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          <filter id="liquid-cursor-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            {/*
              The alpha ramp. Multiplying alpha by 18 and subtracting 7 turns
              the blur's soft falloff into a hard edge — which is what makes
              two neighbouring blobs read as one liquid shape rather than two
              overlapping circles.
            */}
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ filter: "url(#liquid-cursor-goo)" }}
      />
    </div>
  );
}
