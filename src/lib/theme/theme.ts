import type { CSSProperties } from "react";
import { z } from "zod";

/** Shape of the `theme_palettes.colors` JSONB column. */
export const paletteColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  dark: z.string(),
  light: z.string(),
});

export type PaletteColors = z.infer<typeof paletteColorsSchema>;

export const DEFAULT_PALETTE: PaletteColors = {
  primary: "#1E3A8A",
  secondary: "#3B82F6",
  accent: "#F59E0B",
  dark: "#0F172A",
  light: "#F8FAFC",
};

export const DEFAULT_FONTS = {
  headingFont: "Poppins",
  bodyFont: "Inter",
};

export type FontPack = typeof DEFAULT_FONTS;

export function parsePaletteColors(colors: unknown): PaletteColors {
  const result = paletteColorsSchema.safeParse(colors);
  return result.success ? result.data : DEFAULT_PALETTE;
}

/**
 * Palette + font pack expressed as CSS custom properties. Section components
 * only ever read these variables, never hard-coded colours — that is what keeps
 * a template's look consistent while the theme stays swappable.
 */
export function buildThemeStyle(
  colors: PaletteColors,
  fonts: FontPack,
): CSSProperties {
  return {
    "--site-primary": colors.primary,
    "--site-secondary": colors.secondary,
    "--site-accent": colors.accent,
    "--site-dark": colors.dark,
    "--site-light": colors.light,
    "--site-heading-font": `'${fonts.headingFont}', Georgia, serif`,
    "--site-body-font": `'${fonts.bodyFont}', system-ui, sans-serif`,
  } as CSSProperties;
}

/**
 * Google Fonts URL for a font pack. Built at request time from the DB values so
 * adding a row to `theme_fonts` needs no code change.
 */
export function googleFontsHref(fonts: FontPack): string {
  const families = Array.from(
    new Set([fonts.headingFont, fonts.bodyFont].filter(Boolean)),
  ).map((family) => `family=${family.trim().replace(/\s+/g, "+")}:wght@400;500;600;700`);

  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
