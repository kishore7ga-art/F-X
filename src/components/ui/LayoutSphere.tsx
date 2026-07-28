"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

/**
 * A draggable sphere of tiles, distributed by the Fibonacci lattice.
 *
 * Evenly spacing N points on a sphere has no exact solution, and the naive
 * approach — step latitude and longitude in a grid — bunches everything at the
 * poles and leaves the equator sparse. The Fibonacci spiral gets within a few
 * percent of even for any N, in one pass, with no relaxation step: walk `i`
 * from 0 to N, take `y` linearly down the axis, and turn by the golden angle
 * each time.
 *
 * Everything is written straight to element transforms. Thirty tiles
 * re-rendering through React on every frame of a drag is a thousand
 * reconciliations a second to move some divs, which is the whole frame budget
 * for an effect that is meant to feel weightless.
 *
 * Depth does three jobs at once — scale, opacity and paint order — because a
 * sphere that only scales reads as a flat scatter. Tiles at the back are
 * smaller, dimmer, and behind.
 */
export type SphereTile = {
  id: string;
  label: string;
  caption?: string;
};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function LayoutSphere({
  tiles,
  /**
   * Fraction of the container's width the sphere spans.
   *
   * A fixed pixel radius is what put tiles 38px past the viewport at 390px
   * wide: 210px each side of centre is 420px of sphere inside a 350px column,
   * before any tile's own width is counted. Deriving it from the measured
   * container means the sphere is proportionate at every size instead of
   * correct at one.
   */
  radiusRatio = 0.3,
  className,
}: {
  tiles: SphereTile[];
  radiusRatio?: number;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const nodes = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-tile]"),
    );
    if (!nodes.length) return;

    // Fibonacci lattice: one point per tile, evenly covering the surface.
    const points = nodes.map((_, index) => {
      const y = 1 - (index / Math.max(1, nodes.length - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN_ANGLE * index;
      return { x: Math.cos(theta) * ring, y, z: Math.sin(theta) * ring };
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let radius = stage.clientWidth * radiusRatio;
    const measure = () => {
      radius = stage.clientWidth * radiusRatio;
      paint();
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(stage);

    let yaw = 0.4;
    let pitch = -0.12;
    let spinX = 0;
    let spinY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let frame = 0;
    let visible = false;

    const paint = () => {
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);

      nodes.forEach((node, index) => {
        const p = points[index];

        // Yaw about the vertical axis, then pitch about the horizontal one.
        const x1 = p.x * cosYaw - p.z * sinYaw;
        const z1 = p.x * sinYaw + p.z * cosYaw;
        const y2 = p.y * cosPitch - z1 * sinPitch;
        const z2 = p.y * sinPitch + z1 * cosPitch;

        // -1 at the back, +1 at the front.
        const depth = (z2 + 1) / 2;

        node.style.transform =
          `translate3d(${x1 * radius}px, ${y2 * radius}px, 0) ` +
          `scale(${0.62 + depth * 0.5})`;
        node.style.opacity = String(0.18 + depth * 0.82);
        node.style.zIndex = String(Math.round(depth * 100));
      });
    };

    const tick = () => {
      if (!dragging) {
        // Momentum decays, and an idle sphere keeps a slow drift so it reads
        // as an object rather than a diagram.
        spinY *= 0.94;
        spinX *= 0.94;
        if (Math.abs(spinY) < 0.0004) spinY = 0;
        if (Math.abs(spinX) < 0.0004) spinX = 0;
        yaw += spinY + 0.0016;
        pitch += spinX;
      }

      // Stop short of the poles: past ±90° the sphere turns inside out.
      pitch = Math.max(-0.75, Math.min(0.75, pitch));
      paint();
      frame = requestAnimationFrame(tick);
    };

    const onDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      stage.setPointerCapture(event.pointerId);
      stage.style.cursor = "grabbing";
    };

    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      spinY = dx * 0.0055;
      spinX = dy * 0.0035;
      yaw += spinY;
      pitch += spinX;
      pitch = Math.max(-0.75, Math.min(0.75, pitch));
      paint();
    };

    const onUp = (event: PointerEvent) => {
      dragging = false;
      stage.releasePointerCapture?.(event.pointerId);
      stage.style.cursor = "grab";
    };

    paint();

    if (reduced.matches) {
      // Still draggable — the objection is to motion nobody asked for, not to
      // motion somebody's hand is causing.
      stage.addEventListener("pointerdown", onDown);
      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerup", onUp);
      stage.addEventListener("pointercancel", onUp);
      return () => {
        resizeObserver.disconnect();
        stage.removeEventListener("pointerdown", onDown);
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerup", onUp);
        stage.removeEventListener("pointercancel", onUp);
      };
    }

    // Only spin while on screen. A sphere turning behind two sections of
    // scroll is battery spent on something nobody is looking at.
    const observer = new IntersectionObserver(
      (entries) => {
        const now = entries[0]?.isIntersecting ?? false;
        if (now && !visible) {
          visible = true;
          frame = requestAnimationFrame(tick);
        } else if (!now && visible) {
          visible = false;
          cancelAnimationFrame(frame);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(stage);

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);

    return () => {
      resizeObserver.disconnect();
      observer.disconnect();
      cancelAnimationFrame(frame);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
    };
  }, [tiles, radiusRatio]);

  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[560px] touch-none select-none overflow-hidden",
        className,
      )}
      style={{ perspective: "1100px" }}
    >
      <div
        ref={stageRef}
        // The tiles are decoration for a list stated in full below; a screen
        // reader should get the list, not thirty positioned fragments.
        aria-hidden
        className="absolute inset-0 grid cursor-grab place-items-center [transform-style:preserve-3d]"
      >
        {tiles.map((tile) => (
          <div
            key={tile.id}
            data-tile
            className="absolute whitespace-nowrap rounded-lg border border-night-line bg-night-raised/90 px-3 py-2 backdrop-blur-sm will-change-transform"
          >
            <span className="block text-[11px] font-semibold leading-none text-chalk">
              {tile.label}
            </span>
            {tile.caption ? (
              <span className="mt-1 block text-[9px] leading-none text-chalk-dim/60">
                {tile.caption}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
