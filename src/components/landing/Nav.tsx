"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SECTION } from "@/constants/tokens";
import { cn } from "@/lib/cn";

/**
 * Wordmark, philosophy strip, three links, one button.
 *
 * The restraint is the point: a small nav on a page this dark reads as
 * confidence, and every link added to it costs some of that. Three, and they
 * are the three that go somewhere real — there is no pricing page or docs site
 * to link to, and inventing nav items for pages that do not exist is the
 * fastest way to make a launch feel like a mock-up.
 */
const LINKS = [
  { href: "#templates", label: "Templates" },
  { href: "#how", label: "How it works" },
  { href: "#motion", label: "The editor" },
];

export function Nav({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-night-line bg-night/85 py-3.5 backdrop-blur-xl"
            : "border-b border-transparent py-6",
        )}
      >
        <div className={cn(SECTION.container, "flex items-center gap-8")}>
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-[-0.04em] text-chalk group"
          >
            <img src="/xite-logo.png" alt="XITE Logo" className="h-6 w-6 object-contain rounded-md transition-transform group-hover:scale-105" />
            <span>XITE</span>
          </Link>

          {/* The philosophy strip. Three words, set as signage rather than as a
              sentence — it is a statement of posture, not something to read. */}
          <p
            className={cn(
              "hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-chalk-dim/50 transition-opacity duration-500 md:block",
              scrolled && "opacity-0",
            )}
          >
            Pick · Replace · Publish
          </p>

          <nav
            aria-label="Primary"
            className="ml-auto hidden items-center gap-9 lg:flex"
          >
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm text-chalk-dim transition-colors hover:text-chalk"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            <Link href={ctaHref} className="hidden sm:inline-block p-[3px] relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              <div className="px-5 py-2 bg-black rounded-full relative group transition duration-200 text-white font-semibold text-sm hover:bg-transparent flex items-center justify-center">
                {ctaLabel}
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-night-line lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={cn(
                    "absolute left-0 block h-px w-full bg-chalk transition-all duration-300",
                    open ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-px w-full bg-chalk transition-all duration-300",
                    open ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 bg-night transition-[opacity,visibility] duration-500 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav
          aria-label="Mobile"
          className="flex h-full flex-col justify-center gap-1 px-7"
        >
          {LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="overflow-hidden py-3 text-4xl font-extrabold tracking-[-0.03em] text-chalk"
            >
              <span
                className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: open ? "translateY(0)" : "translateY(110%)",
                  transitionDelay: `${index * 60 + 80}ms`,
                }}
              >
                {link.label}
              </span>
            </Link>
          ))}
          <Link
            href={ctaHref}
            className="mt-8 inline-flex w-fit rounded-full bg-accent px-6 py-3 text-base font-semibold text-night"
          >
            {ctaLabel}
          </Link>
        </nav>
      </div>
    </>
  );
}
