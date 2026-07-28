"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * A scrubber that reads as a measuring rule.
 *
 * Ticks rather than dots because the thing being stepped through is an ordered
 * set with a known size — the point of a ruler is that you can see how far
 * along you are and how much is left, which a row of identical dots cannot
 * tell you. Every fifth tick is taller and labelled, the same way a real rule
 * marks its intervals.
 *
 * Keyboard-operable, and that is not a courtesy: a carousel you can only reach
 * by dragging is a carousel a keyboard user cannot read at all. Arrow keys step
 * it, the tablist roles name it, and the active item is a real button.
 */
export type RulerItem = {
  id: string;
  title: string;
  meta?: string;
};

/** Ticks between one item and the next. Sets how fine the rule looks. */
const TICKS_PER_ITEM = 10;

/** Tick width plus its gap, in px. The two must agree or centring drifts. */
const TICK_PITCH = 9;

export function RulerCarousel({
  items,
  onChange,
  className,
}: {
  items: RulerItem[];
  onChange?: (index: number) => void;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange?.(active);
  }, [active, onChange]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let dragging = false;
    let startX = 0;
    let startIndex = 0;

    const onDown = (event: PointerEvent) => {
      dragging = true;
      startX = event.clientX;
      startIndex = active;
      track.setPointerCapture(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      // One item per 90px of travel — slow enough that a small nudge does not
      // fly past three of them.
      const moved = Math.round((startX - event.clientX) / 90);
      const next = Math.max(0, Math.min(items.length - 1, startIndex + moved));
      setActive(next);
    };

    const onUp = (event: PointerEvent) => {
      dragging = false;
      track.releasePointerCapture?.(event.pointerId);
    };

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    return () => {
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
    };
  }, [active, items.length]);

  const totalTicks = (items.length - 1) * TICKS_PER_ITEM + 1;

  return (
    <div className={cn("w-full", className)}>
      {/* The current item. Given a fixed min-height so stepping through does
          not shunt the ruler up and down as titles wrap. */}
      <div className="min-h-[7.5rem] text-center">
        {items.map((item, index) => (
          <div
            key={item.id}
            aria-hidden={index !== active}
            className={cn(
              "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              index === active
                ? "opacity-100 blur-0"
                : "pointer-events-none absolute -z-10 opacity-0 blur-sm",
            )}
          >
            {index === active ? (
              <>
                <p className="text-[clamp(1.8rem,4vw,3.25rem)] font-extrabold leading-none tracking-[-0.035em] text-chalk">
                  {item.title}
                </p>
                {item.meta ? (
                  <p className="mt-4 text-sm text-chalk-dim">{item.meta}</p>
                ) : null}
              </>
            ) : null}
          </div>
        ))}
      </div>

      <div
        ref={trackRef}
        role="tablist"
        aria-label="Templates"
        aria-orientation="horizontal"
        className="mt-10 cursor-grab touch-none select-none active:cursor-grabbing"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            setActive((i) => Math.min(items.length - 1, i + 1));
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) => Math.max(0, i - 1));
          }
        }}
      >
        {/* The rule itself. Decorative: the tabs below carry the semantics.
            The track slides so the active mark sits under the centre line —
            a rule that stays put and only recolours a tick is a row of dashes,
            not a measurement. */}
        <div
          aria-hidden
          className="relative h-16 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]"
        >
          {/* The centre line the active mark travels to. */}
          <span className="absolute left-1/2 top-0 h-7 w-px -translate-x-1/2 bg-accent" />

          <div
            className="absolute bottom-0 left-1/2 flex items-end gap-[8px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: `translateX(${-active * TICKS_PER_ITEM * TICK_PITCH}px)`,
            }}
          >
          {Array.from({ length: totalTicks }, (_, tick) => {
            const position = tick / TICKS_PER_ITEM;
            const distance = Math.abs(position - active);
            const major = tick % TICKS_PER_ITEM === 0;
            // Falls away from the active mark, so the eye is pulled to it
            // without anything having to be highlighted.
            const nearness = Math.max(0, 1 - distance / 2.2);

            return (
              <span
                key={tick}
                className="w-px shrink-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  height: major ? 34 + nearness * 18 : 12 + nearness * 10,
                  background:
                    major && distance < 0.01
                      ? "var(--color-accent)"
                      : "var(--color-chalk)",
                  opacity: major ? 0.25 + nearness * 0.75 : 0.1 + nearness * 0.3,
                }}
              />
            );
          })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={item.title}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-night",
                index === active
                  ? "text-accent"
                  : "text-chalk-dim/40 hover:text-chalk-dim",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
