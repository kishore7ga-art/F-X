"use client";

import { useEffect, useRef, useState } from "react";

import { SECTION } from "@/constants/tokens";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/**
 * The page's one signature moment: the editor, actually working.
 *
 * A studio site puts a film of its people here. XITE's story is not a team, it
 * is the thing the product does that is hard to describe and obvious to watch —
 * so this types into a section, files it, and then swaps the whole template
 * underneath while every word stays put.
 *
 * Built rather than filmed, and rather than screenshotted. A recording goes
 * stale the first time the editor changes; this is drawn from the same tokens
 * as the rest of the page, so it cannot show a version of the product that no
 * longer exists. It is a depiction, not a live embed, and it is labelled as one.
 *
 * The whole page's motion budget is spent here. That is the point of having a
 * budget: one thing worth watching beats five things moving.
 */

/** Typed out in sequence. The last is where it settles. */
const SENTENCES = [
  "A NAAC A+ accredited institute",
  "A NAAC A+ accredited institute offering undergraduate",
  "A NAAC A+ accredited institute offering undergraduate and postgraduate programmes since 1998.",
];

const TEMPLATES = ["Radian", "Meridian", "Beacon"];

type Phase = "typing" | "saving" | "saved" | "swapping";

export function ProductInMotion() {
  const sectionRef = useReveal<HTMLDivElement>({ children: "[data-reveal]" });
  const frameRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [template, setTemplate] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      // The end state, shown outright — someone who has asked for less motion
      // should still see what the section is about. Deferred a frame rather
      // than set here: the server rendered the empty state, so writing it
      // during the effect body is a second render before the first has
      // painted, which React rightly objects to.
      const settle = requestAnimationFrame(() => {
        setText(SENTENCES[SENTENCES.length - 1]);
        setPhase("saved");
      });
      return () => cancelAnimationFrame(settle);
    }

    let timers: number[] = [];
    let running = false;

    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    /** One full pass: type, save, swap the design, keep the words. */
    const run = () => {
      timers.forEach(window.clearTimeout);
      timers = [];

      let elapsed = 0;
      setText("");
      setPhase("typing");

      // Typed in whole clauses rather than character by character: a per-letter
      // timer is dozens of state updates a second for an effect that reads the
      // same at three.
      for (const sentence of SENTENCES) {
        elapsed += 900;
        at(elapsed, () => setText(sentence));
      }

      // Two seconds after the last keystroke, which is the editor's real debounce.
      elapsed += 2000;
      at(elapsed, () => setPhase("saving"));
      at(elapsed + 700, () => setPhase("saved"));

      elapsed += 2400;
      at(elapsed, () => setPhase("swapping"));
      at(elapsed + 900, () => {
        setTemplate((current) => (current + 1) % TEMPLATES.length);
        setPhase("saved");
      });

      at(elapsed + 3600, run);
    };

    // Only while it is on screen. A loop running behind three sections of
    // scroll is battery spent on something nobody is looking at.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (visible && !running) {
          running = true;
          run();
        } else if (!visible && running) {
          running = false;
          timers.forEach(window.clearTimeout);
          timers = [];
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(frame);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <section
      id="motion"
      className={cn(SECTION.padding, "border-t border-night-line")}
    >
      <div className={SECTION.container}>
        <div ref={sectionRef} className="max-w-3xl">
          <p
            data-reveal
            className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50"
          >
            The editor
          </p>
          <h2
            data-reveal
            className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.035em] text-chalk"
          >
            Type. It saves itself. Change the design — the words stay.
          </h2>
          <p
            data-reveal
            className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-chalk-dim"
          >
            No save button and no lost afternoon. Fifty versions of every
            section are kept, so undoing a bad Tuesday is a click rather than a
            rewrite.
          </p>
        </div>

        <div
          ref={frameRef}
          className="mt-14 overflow-hidden rounded-2xl border border-night-line bg-night-raised lg:mt-20"
        >
          {/* Editor chrome. Labelled as an illustration, and hidden from
              assistive tech — the paragraph above already says what it shows,
              and a screen reader should not have to sit through a typing
              animation to find that out. */}
          <div className="flex items-center gap-3 border-b border-night-line px-5 py-3.5">
            <span className="flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-2.5 w-2.5 rounded-full bg-chalk/10"
                />
              ))}
            </span>
            <span className="ml-2 font-mono text-xs text-chalk-dim/60">
              xite.co.in/editor/greenfield
            </span>
            <span
              className={cn(
                "ml-auto flex items-center gap-2 text-xs transition-colors duration-300",
                phase === "saving" ? "text-chalk-dim" : "text-accent",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                  phase === "saving" ? "bg-chalk-dim" : "bg-accent",
                )}
              />
              {phase === "saving" ? "Saving…" : "Saved"}
            </span>
          </div>

          <div aria-hidden className="grid gap-px bg-night-line lg:grid-cols-[1fr_320px]">
            {/* The page being edited. */}
            <div className="relative bg-night-raised p-8 sm:p-12 lg:p-16">
              <div
                className={cn(
                  "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  phase === "swapping"
                    ? "translate-y-2 opacity-0"
                    : "translate-y-0 opacity-100",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">
                  {TEMPLATES[template]}
                </p>
                <p className="mt-4 text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-chalk">
                  Greenfield Institute of Technology
                </p>
              </div>

              {/* The sentence being typed. Deliberately outside the block that
                  fades on a template swap — that is the entire demonstration. */}
              <p className="mt-8 min-h-[5.5rem] max-w-xl text-[15px] leading-relaxed text-chalk-dim sm:min-h-[4.5rem]">
                {text}
                <span
                  className={cn(
                    "ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-accent",
                    phase === "typing" ? "animate-pulse" : "opacity-0",
                  )}
                />
              </p>
            </div>

            {/* The design panel. */}
            <div className="bg-night-raised p-6 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
                Design
              </p>
              <ul className="mt-5 space-y-2">
                {TEMPLATES.map((name, index) => (
                  <li
                    key={name}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all duration-500",
                      index === template
                        ? "border-accent/40 bg-accent/[0.07] text-chalk"
                        : "border-night-line text-chalk-dim/70",
                    )}
                  >
                    {name}
                    {index === template ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-night-line pt-5 text-xs leading-relaxed text-chalk-dim/60">
                Swapping the template re-points every section. Your text is
                stored against what it is, not against how it looks.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-chalk-dim/40">
          An illustration of the editor, drawn from the product&apos;s own design
          tokens.
        </p>
      </div>
    </section>
  );
}
