"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { GradientMesh } from "@/components/ui/GradientMesh";
import { SECTION } from "@/constants/tokens";
import { cn } from "@/lib/cn";

/**
 * The opening statement, over a drifting colour field.
 *
 * The headline is the product's actual guarantee rather than a description of
 * it: content is stored against what a section *is* rather than which template
 * it came from, so the design is genuinely disposable and the words genuinely
 * are not. That is a property of the schema, which is why it can be said this
 * plainly.
 *
 * Two buttons, and only two. Trust microcopy under them rather than beside
 * them, so the eye finishes on the action and then gets its reassurance.
 */
const LINES = ["Change the design.", "Keep every word."];

export function Hero({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;

    const onMove = (event: MouseEvent) => {
      // Normalised to the viewport, so the tilt is about where the pointer is
      // on screen rather than how far it has travelled.
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const loop = () => {
      // Damped. Following the pointer exactly reads as the frame being dragged;
      // easing towards it reads as parallax, which is the whole effect.
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      frame.style.transform =
        `perspective(1400px) rotateY(${currentX * 3}deg) ` +
        `rotateX(${-currentY * 2}deg) translate3d(${currentX * 10}px, ${currentY * 8}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-night pb-24 pt-36 sm:pb-32 sm:pt-44">
      <GradientMesh />

      <div className={cn(SECTION.container, "text-center")}>
        <p
          className="inline-flex items-center gap-2.5 rounded-full border border-night-line bg-night-raised/70 px-3.5 py-1.5 text-[13px] text-chalk-dim backdrop-blur"
          style={{ animation: "rise 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Five designs, thirty section layouts
        </p>

        <h1 className="mx-auto mt-8 max-w-4xl text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-chalk">
          <span className="sr-only">{LINES.join(" ")}</span>
          {LINES.map((line, index) => (
            <span key={line} aria-hidden className="block overflow-hidden">
              <span
                className="block will-change-transform"
                style={{
                  animation: `heroLine 1.1s cubic-bezier(0.16,1,0.3,1) ${
                    0.18 + index * 0.09
                  }s both`,
                }}
              >
                {index === 1 ? (
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-accent) 0%, var(--color-mesh-violet) 50%, var(--color-mesh-ember) 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {line}
                  </span>
                ) : (
                  line
                )}
              </span>
            </span>
          ))}
        </h1>

        <p
          className="mx-auto mt-7 max-w-xl text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.6] text-chalk-dim"
          style={{ animation: "rise 1s cubic-bezier(0.16,1,0.3,1) 0.5s both" }}
        >
          A college website is a few hundred sentences that need to be correct.
          The design is the disposable part — so we built the two apart.
        </p>

        <div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animation: "rise 1s cubic-bezier(0.16,1,0.3,1) 0.62s both" }}
        >
          <Link
            href={ctaHref}
            className="w-full rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-white transition-transform duration-150 ease-out hover:scale-[1.03] hover:bg-accent-hover active:scale-[0.98] sm:w-auto"
          >
            {ctaLabel}
          </Link>
          <Link
            href="#templates"
            className="w-full rounded-full border border-night-line px-6 py-3 text-[15px] font-semibold text-chalk transition-colors duration-200 hover:border-chalk-dim/50 sm:w-auto"
          >
            See the designs
          </Link>
        </div>

        <p
          className="mt-5 text-[13px] text-chalk-dim/70"
          style={{ animation: "rise 1s cubic-bezier(0.16,1,0.3,1) 0.72s both" }}
        >
          No card required. Nothing is public until you publish it.
        </p>
      </div>

      {/* The product, in a window that leans towards the pointer. */}
      <div
        className="mx-auto mt-16 w-full max-w-[1100px] px-5 sm:mt-20 sm:px-8"
        style={{ animation: "rise 1.1s cubic-bezier(0.16,1,0.3,1) 0.85s both" }}
      >
        <div
          ref={frameRef}
          aria-hidden
          className="overflow-hidden rounded-2xl border border-night-line bg-night-raised shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] will-change-transform"
        >
          <div className="flex items-center gap-2 border-b border-night-line px-4 py-3">
            <span className="flex gap-1.5">
              {[0, 1, 2].map((dot) => (
                <span key={dot} className="h-2.5 w-2.5 rounded-full bg-chalk/10" />
              ))}
            </span>
            <span className="ml-2 font-mono text-[11px] text-chalk-dim/70">
              xite.co.in/editor
            </span>
            <span className="ml-auto flex items-center gap-2 text-[11px] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Saved
            </span>
          </div>

          <div className="grid gap-px bg-night-line sm:grid-cols-[1fr_240px]">
            <div className="bg-night-raised p-8 sm:p-12">
              <span className="block h-2 w-20 rounded-full bg-accent/50" />
              <span className="mt-5 block h-5 w-3/4 rounded-full bg-chalk/20" />
              <div className="mt-6 space-y-2.5">
                <span className="block h-2 w-full rounded-full bg-chalk/[0.08]" />
                <span className="block h-2 w-11/12 rounded-full bg-chalk/[0.08]" />
                <span className="block h-2 w-4/5 rounded-full bg-chalk/[0.08]" />
              </div>
              <span className="mt-8 block h-28 rounded-xl bg-chalk/[0.04]" />
            </div>

            <div className="bg-night-raised p-6">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-dim/50">
                Design
              </span>
              <div className="mt-4 space-y-2">
                {["Radian", "Meridian", "Beacon"].map((name, index) => (
                  <span
                    key={name}
                    className={cn(
                      "block rounded-lg border px-3 py-2 text-[12px]",
                      index === 0
                        ? "border-accent/40 bg-accent/[0.08] text-chalk"
                        : "border-night-line text-chalk-dim/70",
                    )}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
