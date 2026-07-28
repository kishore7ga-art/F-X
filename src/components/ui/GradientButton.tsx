"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "@/lib/cn";

/**
 * The primary action, with an animated gradient border.
 *
 * CSS-only. The border is a conic gradient rotated by a registered custom
 * property, which the compositor can animate on its own — a JavaScript loop
 * driving a border colour would cost the main thread a frame's work every frame
 * for something nobody is interacting with.
 *
 * The gradient is built from the page's own accent rather than the usual
 * blue-to-violet: this page spends its colour on one gold, and importing a
 * second palette for one button would undo the restraint the rest of it is
 * built on. The sweep is gold → warm amber → gold, so it reads as light moving
 * across a metal edge rather than as a rainbow.
 *
 * `asChild` renders the caller's element instead of a button — a thing that
 * navigates should be an anchor, or middle-click, open-in-new-tab and
 * copy-link-address all quietly stop working.
 */
const button = cva(
  cn(
    "group relative isolate inline-flex items-center justify-center gap-3 overflow-hidden rounded-full",
    "font-semibold transition-[opacity,transform] duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-night",
    "disabled:pointer-events-none disabled:opacity-50",
  ),
  {
    variants: {
      variant: {
        /** Filled. The page's single primary action. */
        solid: "bg-accent text-night hover:opacity-90",
        /** The gradient edge, for the one place that should draw the eye. */
        gradient: "gradient-edge bg-night text-chalk",
        /** Quiet. Sits beside a primary without competing. */
        ghost:
          "border border-night-line text-chalk-dim hover:border-chalk-dim/40 hover:text-chalk",
      },
      size: {
        sm: "px-5 py-2.5 text-sm",
        md: "px-8 py-4 text-[15px]",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export type GradientButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { asChild?: boolean };

export const GradientButton = forwardRef<
  HTMLButtonElement,
  GradientButtonProps
>(function GradientButton(
  { className, variant, size, asChild = false, children, ...props },
  ref,
) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      ref={ref}
      className={cn(button({ variant, size }), className)}
      {...props}
    >
      {children}
    </Component>
  );
});
