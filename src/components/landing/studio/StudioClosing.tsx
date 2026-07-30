"use client";

import Link from "next/link";

import { DISPLAY, Reveal } from "@/components/landing/studio/primitives";

/**
 * The last screen, and the footer under it.
 *
 * The closing panel repeats one instruction at the largest size on the page after
 * the hero. Somebody who has read this far has already been given the argument;
 * what they need at the bottom is the same door they were offered at the top, not
 * a fresh pitch.
 *
 * The footer is deliberately four links and a line of type. A studio-genre page
 * ends rather than unpacking a sitemap, and this product has five destinations in
 * total — a column layout would be mostly whitespace pretending to be structure.
 */
export function StudioClosing() {
  return (
    <>
      <section className="border-t border-night-line py-28 sm:py-36 lg:py-44">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <Reveal stagger={0.1} className="space-y-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-chalk-dim/50">
              Ready when you are
            </p>

            <h2 className={`${DISPLAY.hero} max-w-[16ch] font-semibold text-chalk`}>
              Start with a design.
            </h2>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Link
                href="/start"
                className="group inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-night transition-transform hover:scale-[1.02]"
              >
                Start building
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <p className="max-w-[34ch] text-[13px] leading-relaxed text-chalk-dim/60">
                Access is granted per institution — you&apos;ll be asked for a few
                details, and we reply by email.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-night-line py-12">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
          <div className="space-y-3">
            <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.3em] text-chalk">
              XITE
            </p>
            <p className="max-w-[34ch] text-[13px] leading-relaxed text-chalk-dim/50">
              Websites for colleges, without the website part.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              ["Templates", "/templates"],
              ["Request access", "/request-access"],
              ["Log in", "/login"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-chalk-dim/60 transition-colors hover:text-chalk"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
