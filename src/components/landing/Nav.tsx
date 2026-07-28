"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SECTION } from "@/constants/tokens";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#templates", label: "Designs" },
  { href: "#how", label: "How it works" },
  { href: "#editing", label: "Editing" },
];

/**
 * Fixed navigation that condenses once the hero is behind it.
 *
 * Two states, not a scroll-linked animation: transparent over the hero, then a
 * blurred bar. A nav that continuously interpolates with scroll position
 * flickers at the threshold and re-renders on every frame for a change nobody
 * perceives as gradual.
 *
 * The mobile panel is a full overlay rather than a dropdown, with focus and
 * background scroll both handled — a menu that leaves the page scrolling behind
 * it is the most common way this component is got wrong.
 */
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
    // Locking the body is what stops the page sliding around underneath an
    // open overlay on touch devices.
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
            ? "border-b border-brand-ink/8 bg-white/75 py-3 backdrop-blur-xl"
            : "border-b border-transparent py-6",
        )}
      >
        <div className={cn(SECTION.container, "flex items-center justify-between")}>
          <Link
            href="/"
            className="text-xl font-extrabold tracking-[-0.04em] text-brand-ink"
            data-cursor
          >
            XITE
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-cursor
                className="group relative text-sm font-semibold text-brand-ink/65 transition-colors hover:text-brand-ink"
              >
                {link.label}
                {/* Underline grows from the left rather than fading in — a
                    direction reads as intent, a fade reads as a hover state. */}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-ink transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <AnimatedButton href={ctaHref} className="px-6 py-3 text-sm">
                {ctaLabel}
              </AnimatedButton>
            </div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-ink/15 lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span
                  className={cn(
                    "absolute left-0 block h-px w-full bg-brand-ink transition-all duration-300",
                    open ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-px w-full bg-brand-ink transition-all duration-300",
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
          "fixed inset-0 z-40 bg-white transition-[opacity,visibility] duration-500 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav
          aria-label="Mobile"
          className="flex h-full flex-col justify-center gap-2 px-8"
        >
          {LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="overflow-hidden py-3 text-4xl font-extrabold tracking-[-0.03em] text-brand-ink"
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
          <div className="mt-8">
            <AnimatedButton href={ctaHref}>{ctaLabel}</AnimatedButton>
          </div>
        </nav>
      </div>
    </>
  );
}
