"use client";

import Link from "next/link";

import { HeroStage } from "@/components/three/HeroStage";
import { DISPLAY, Reveal } from "@/components/landing/studio/primitives";

/**
 * The first screen: type first, canvas second.
 *
 * The headline is the largest thing on the page and the 3D panel sits under it
 * rather than behind it. That ordering is the point of the genre — the scene
 * supports the sentence, and a headline laid over a moving surface is harder to
 * read for no gain.
 *
 * `min-h-svh` rather than `dvh` or `vh`: on mobile Safari `vh` is the *largest*
 * viewport, so the scroll cue lands under the browser chrome, and `dvh` resizes
 * as that chrome hides, which makes the whole first screen jump mid-scroll. `svh`
 * is the smallest stable box and the only one that holds still.
 */
export function StudioHero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-between overflow-hidden pt-32 sm:pt-36">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Reveal stagger={0.1} className="space-y-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-chalk-dim/50">
            A website builder for colleges
          </p>

          <h1 className={`${DISPLAY.hero} font-semibold text-chalk`}>
            Your college,
            <br />
            <span className="text-chalk-dim/45">online in an afternoon.</span>
          </h1>

          <div className="flex flex-col gap-8 pt-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-[42ch] text-[15px] leading-relaxed text-chalk-dim sm:text-base">
              Pick a design, fill in forms, publish. No drag-and-drop, no theme
              files, no developer — the layout is already right, so the only thing
              left to do is the writing.
            </p>

            <div className="flex shrink-0 items-center gap-6">
              <Link
                href="/start"
                className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-night transition-transform hover:scale-[1.02]"
              >
                Start building
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <a
                href="#templates"
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-chalk-dim/70 underline-offset-8 transition-colors hover:text-chalk hover:underline"
              >
                See the designs
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* The canvas, given the bottom half of the screen and bled off the right
          edge. Cropping it is what makes it read as a surface the page sits on
          rather than a picture in a frame. */}
      <div className="relative mt-16 w-full pl-5 sm:mt-20 sm:pl-8 lg:pl-12">
        <div className="ml-auto w-full max-w-[1600px]">
          <HeroStage />
        </div>
      </div>
    </section>
  );
}
