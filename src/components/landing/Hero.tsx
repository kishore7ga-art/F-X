"use client";

import { useEffect, useRef } from "react";

import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SECTION, TYPE } from "@/constants/tokens";

/**
 * The opening statement.
 *
 * The thesis is the type itself: a college website builder whose whole promise
 * is that the words survive every design change should open by treating words
 * as the object. So the headline arrives line by line from behind a mask, and
 * the only ornament is a field that drifts behind it.
 *
 * The mask is done in CSS with a per-line transition rather than a library,
 * because it runs before hydration finishes — an opening line that waits for
 * JavaScript is an opening line people scroll past.
 */
const LINES = ["Your college", "website,", "built by Friday."];

export function Hero({ ctaHref }: { ctaHref: string }) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = parallaxRef.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Only while the hero is on screen. Past that it is invisible work.
        const y = window.scrollY;
        if (y > window.innerHeight) return;
        element.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    // `svh` rather than `vh`, and shorter on small screens.
    //
    // `100vh` on a phone is the viewport with the browser chrome *hidden*, so a
    // hero sized in it is taller than what you can actually see on load, and
    // everything jumps the moment the URL bar retracts. `svh` is the smaller,
    // stable measure — the height that is genuinely visible the whole time.
    //
    // 85 rather than 92 because measuring it at 390×1000 showed roughly 280px
    // of dead space above the eyebrow: centred content inside a near-full-height
    // box reads as generous on a desktop and as a loading state on a phone.
    <section className="relative flex min-h-[85svh] items-center overflow-hidden pt-24 sm:min-h-svh sm:pt-28">
      {/* Ambient field. Sits behind everything and never intercepts a click. */}
      <div
        ref={parallaxRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 will-change-transform"
      >
        <div className="drift absolute -right-40 -top-40 h-[38rem] w-[38rem] rounded-full bg-brand-bright/25 blur-[130px]" />
        <div
          className="drift absolute -left-52 top-1/3 h-[32rem] w-[32rem] rounded-full bg-brand-citrus/20 blur-[140px]"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <div className={SECTION.container}>
        <p
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-brand-ink/12 bg-white/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-ink/55 backdrop-blur"
          style={{ animation: "rise 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-ink" />
          For colleges, not web agencies
        </p>

        <h1 className={TYPE.display}>
          <span className="sr-only">{LINES.join(" ")}</span>
          {LINES.map((line, index) => (
            <span key={line} aria-hidden className="block overflow-hidden">
              <span
                className="block will-change-transform"
                style={{
                  animation: `heroLine 1.1s cubic-bezier(0.16,1,0.3,1) ${
                    0.25 + index * 0.11
                  }s both`,
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p
            className={`${TYPE.body} max-w-xl text-brand-ink/60`}
            style={{ animation: "rise 0.9s cubic-bezier(0.16,1,0.3,1) 0.7s both" }}
          >
            Pick a design, replace the words, publish. Change the design again
            next term — every sentence you wrote stays exactly where you put it.
          </p>

          <div
            className="flex flex-wrap items-center gap-4"
            style={{ animation: "rise 0.9s cubic-bezier(0.16,1,0.3,1) 0.82s both" }}
          >
            <AnimatedButton href={ctaHref}>Start building</AnimatedButton>
            <AnimatedButton href="#templates" variant="outline">
              See the designs
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Scroll hint. Decorative, so it is hidden from assistive tech. */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
        style={{ animation: "rise 1s cubic-bezier(0.16,1,0.3,1) 1.1s both" }}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-ink/35">
          Scroll
        </span>
        <span className="h-12 w-px overflow-hidden bg-brand-ink/12">
          <span className="scroll-line block h-full w-full bg-brand-ink/60" />
        </span>
      </div>
    </section>
  );
}
