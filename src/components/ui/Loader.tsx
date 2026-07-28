"use client";

import { useEffect, useState } from "react";

import { DURATION, EASE } from "@/constants/tokens";

/**
 * The one-time curtain over the first paint.
 *
 * A loading animation is a promise that something is loading, so this is tied
 * to the window's `load` event rather than a fixed timer that lies. It does
 * hold a short minimum: a curtain that flashes for 80ms on a warm cache reads
 * as a rendering glitch, not as an introduction.
 *
 * It never blocks. The page is fully rendered and interactive underneath —
 * this only covers it — so a stalled asset delays a decoration rather than the
 * content, and someone on a slow connection is not locked out by an effect.
 */
export function Loader() {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      // Deferred a frame rather than set here. The server rendered the curtain,
      // so clearing it during the effect body would be a second render before
      // the browser has painted the first — and React rightly objects to a
      // cascade. One frame is imperceptible and keeps hydration honest.
      const frame = requestAnimationFrame(() => {
        setDone(true);
        setGone(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    const started = performance.now();
    const MINIMUM = 650;

    const finish = () => {
      const elapsed = performance.now() - started;
      window.setTimeout(() => setDone(true), Math.max(0, MINIMUM - elapsed));
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    return () => window.removeEventListener("load", finish);
  }, []);

  useEffect(() => {
    if (!done) return;
    // Unmounted only after the curtain has finished travelling, so it is not
    // ripped away mid-transition.
    const timer = window.setTimeout(() => setGone(true), DURATION.loader * 1000);
    return () => window.clearTimeout(timer);
  }, [done]);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-ink"
      style={{
        transform: done ? "translate3d(0, -100%, 0)" : "translate3d(0, 0, 0)",
        transition: `transform ${DURATION.loader}s ${EASE.expo}`,
      }}
    >
      <div className="overflow-hidden">
        <span
          className="block text-[clamp(3rem,12vw,9rem)] font-extrabold leading-none tracking-[-0.05em] text-white"
          style={{
            transform: done ? "translate3d(0, -120%, 0)" : "translate3d(0, 0, 0)",
            // Leaves fractionally before the curtain, so the word clears the
            // edge rather than riding it up.
            transition: `transform ${DURATION.slow}s ${EASE.expo}`,
          }}
        >
          XITE
        </span>
      </div>
    </div>
  );
}
