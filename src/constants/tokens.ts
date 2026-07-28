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

/** 8px base. Every vertical rhythm on the page is a multiple of this. */
export const SPACE = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  "2xl": 96,
  "3xl": 144,
  "4xl": 200,
} as const;

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
 * Type scale.
 *
 * `clamp()` rather than breakpoint jumps: display type that steps between two
 * sizes reads as a layout bug at the boundary, and fluid scaling is the whole
 * difference between "responsive" and "designed for this width".
 */
export const TYPE = {
  /** Hero. Deliberately enormous, and tightened as it grows. */
  display:
    "text-[clamp(2.75rem,9vw,8.5rem)] font-extrabold leading-[0.86] tracking-[-0.045em]",
  /** Section headings. */
  h2: "text-[clamp(2rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]",
  h3: "text-[clamp(1.35rem,2.2vw,2rem)] font-bold leading-[1.1] tracking-[-0.02em]",
  /** Body copy, at a size that survives a large monitor. */
  body: "text-[clamp(1rem,1.15vw,1.2rem)] leading-relaxed",
  /** Eyebrows and labels. Letter-spaced because they are read as signage. */
  eyebrow:
    "text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em]",
  /** Numerals in the statistics band. Tabular so counting does not reflow. */
  stat: "text-[clamp(3rem,7vw,7rem)] font-extrabold leading-[0.85] tracking-[-0.04em] tabular-nums",
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

/** Matches Tailwind's defaults, so JS and CSS agree about where a break is. */
export const BREAKPOINT = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINT;
