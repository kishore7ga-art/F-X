/**
 * Hover states for buttons, kept in the section's own stylesheet.
 *
 * An inline style cannot express `:hover`, so a button's hover colours live as
 * one rule per button inside a fenced region of the section's `<style>`, keyed
 * by the same `data-xite-el` attribute the managed-CSS layer uses. The region
 * is rewritten whole on every change, so there is nothing to merge and nothing
 * to drift: what is in the fence is exactly the set of hover rules.
 *
 * Separate from `/* xite:controls *​/` because that region's model is
 * `key → device → property` with no room for a pseudo-class, and teaching it one
 * would touch every reader of that model for the sake of one control.
 */

import { keySelector } from "@/lib/sections/section-managed-css";

const START = "/* xite:hover */";
const END = "/* /xite:hover */";

export interface HoverDecls {
  background?: string;
  color?: string;
}

export type HoverStyles = Record<string, HoverDecls>;

export function splitHoverRegion(css: string): { authored: string; managed: string } {
  const start = css.indexOf(START);
  const end = css.indexOf(END);
  if (start < 0 || end < 0 || end < start) return { authored: css, managed: "" };
  return {
    authored: (css.slice(0, start) + css.slice(end + END.length)).replace(/\n{3,}/g, "\n\n"),
    managed: css.slice(start + START.length, end),
  };
}

export function parseHoverStyles(css: string): HoverStyles {
  const { managed } = splitHoverRegion(css);
  const styles: HoverStyles = {};
  const rule = /\[data-xite-el="([^"]+)"\](?:\[data-xite-el="[^"]+"\])?:hover\{([^}]*)\}/g;
  for (const match of managed.matchAll(rule)) {
    const key = match[1]!;
    const decls: HoverDecls = {};
    for (const decl of match[2]!.split(";")) {
      const [prop, ...rest] = decl.split(":");
      const value = rest.join(":").replace(/!important/g, "").trim();
      if (!prop || !value) continue;
      if (prop.trim() === "background-color") decls.background = value;
      if (prop.trim() === "color") decls.color = value;
    }
    if (decls.background || decls.color) styles[key] = decls;
  }
  return styles;
}

export function serializeHoverStyles(styles: HoverStyles): string {
  const rules = Object.keys(styles)
    .sort()
    .flatMap((key) => {
      const decls = styles[key]!;
      const body = [
        decls.background ? `background-color:${decls.background} !important` : "",
        decls.color ? `color:${decls.color} !important` : "",
      ]
        .filter(Boolean)
        .join(";");
      return body ? [`${keySelector(key)}:hover{${body}}`] : [];
    });
  if (rules.length === 0) return "";
  return `\n${START}\n${rules.join("\n")}\n${END}\n`;
}

/** Sets (or, with empty values, clears) one button's hover rule. */
export function writeHoverRule(css: string, key: string, decls: HoverDecls): string {
  const { authored } = splitHoverRegion(css);
  const styles = parseHoverStyles(css);
  const next: HoverDecls = {};
  if (decls.background) next.background = decls.background;
  if (decls.color) next.color = decls.color;
  if (next.background || next.color) styles[key] = next;
  else delete styles[key];
  return `${authored.trimEnd()}${serializeHoverStyles(styles)}`;
}
