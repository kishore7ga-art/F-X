"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline";

/**
 * The page's one button, magnetic and with a label that swaps on hover.
 *
 * The swap is two copies of the same text stacked in a clipped box, one sliding
 * out as the other slides in. It is done with transforms on both, not by
 * changing the text, so nothing reflows and a screen reader is never handed a
 * label mid-change — the duplicate is `aria-hidden`, so assistive tech sees one
 * button with one name.
 *
 * Renders as an anchor when given `href` and a button otherwise, because a
 * thing that navigates should be a link: middle-click, open-in-new-tab and
 * "copy link address" all stop working the moment it is a `div` with a handler.
 */
export function AnimatedButton({
  children,
  href,
  onClick,
  variant = "solid",
  className,
  type = "button",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
}) {
  const ref = useMagnetic<HTMLDivElement>({ strength: 0.3, radius: 70 });

  const base = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
    "px-7 py-3.5 text-[15px] font-semibold",
    "transition-colors duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2",
    variant === "solid"
      ? "bg-brand-ink text-white hover:bg-brand"
      : "border border-brand-ink/20 text-brand-ink hover:border-brand-ink",
    className,
  );

  const label = (
    <span className="relative block overflow-hidden">
      {/* Height is set by this copy; the second is absolutely positioned over
          it so the button never changes size mid-transition. */}
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );

  return (
    // The wrapper is what moves. Transforming the interactive element itself
    // would drag its focus ring and hit area around with it.
    <div ref={ref} className="inline-block will-change-transform">
      {href ? (
        <Link href={href} className={base} data-cursor>
          {label}
        </Link>
      ) : (
        <button type={type} onClick={onClick} className={base} data-cursor>
          {label}
        </button>
      )}
    </div>
  );
}
