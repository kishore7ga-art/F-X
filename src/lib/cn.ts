import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names, with later Tailwind utilities beating earlier ones.
 *
 * `clsx` alone would keep both `py-24` and a caller's `py-12`, and which one
 * won would depend on the order Tailwind happened to emit them in — a component
 * whose padding cannot be overridden from outside, for reasons invisible at the
 * call site. `twMerge` resolves the conflict by intent instead.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
