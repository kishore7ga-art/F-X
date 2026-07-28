/**
 * The design system, in one place.
 *
 * Every spacing value, duration and easing curve on the landing page comes from
 * here rather than being typed at the call site. That is not tidiness for its
 * own sake: an animation-heavy page falls apart when one section eases at 0.6s
 * and its neighbour at 0.45s, and the only way that stays consistent across a
 * dozen components is for there to be one number to change.
 *
 * Colour is deliberately absent. The palette lives in globals.css as CSS custom
 * properties, because published college sites get their colours from their own
 * theme_palette and the marketing surface must not be able to leak into them.
 * Duplicating those hexes here would create a second source of truth for the
 * one thing this codebase has already been bitten by twice.
 */

/**
 * Section rhythm as Tailwind classes rather than raw numbers.
 *
 * Sections need to breathe more on a large screen than a phone, and expressing
 * that once here keeps twelve components from each inventing their own answer.
 */
export const SECTION = {
  /** Standard vertical padding for a full-width section. */
  padding: "py-24 sm:py-32 lg:py-40",
  /** Tighter, for sections that sit directly against a neighbour. */
  paddingTight: "py-16 sm:py-24",
  /** The page's single content width and gutter. */
  container: "mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12",
  /** Narrower measure, for anything with a lot of prose in it. */
  containerNarrow: "mx-auto w-full max-w-[900px] px-5 sm:px-8",
} as const;

/**
 * Motion.
 *
 * One easing curve does almost all the work, which is what makes a page feel
 * like one hand made it. `expo` is the long, decelerating settle that reads as
 * expensive; `soft` is for small state changes where `expo` would feel slow.
 */
export const EASE = {
  /** cubic-bezier for CSS transitions. */
  expo: "cubic-bezier(0.16, 1, 0.3, 1)",
  soft: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** The same curves as arrays, for GSAP and Framer Motion. */
  expoArray: [0.16, 1, 0.3, 1] as const,
  softArray: [0.4, 0, 0.2, 1] as const,
} as const;

export const DURATION = {
  /** Hover states and other things a finger is waiting on. */
  fast: 0.25,
  base: 0.6,
  /** Reveals — long enough to read as deliberate, short enough not to nag. */
  slow: 0.9,
  /** The one-time page load. */
  loader: 1.4,
} as const;

/** How far apart staggered children start, in seconds. */
export const STAGGER = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;

