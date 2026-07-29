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
 * Palette + font pack expressed as CSS custom properties with Dark/Light mode support.
 */
export function buildThemeStyle(
  colors: PaletteColors,
  fonts: FontPack,
  isDark = false,
): CSSProperties {
  return {
    "--site-primary": isDark ? "#60A5FA" : colors.primary,
    "--site-secondary": isDark ? "#93C5FD" : colors.secondary,
    "--site-accent": colors.accent,
    "--site-dark": isDark ? "#F8FAFC" : colors.dark,
    "--site-light": isDark ? "#090D16" : colors.light,
    "--site-bg": isDark ? "#090D16" : "#FFFFFF",
    "--site-card-bg": isDark ? "#111827" : "#FFFFFF",
    "--site-card-border": isDark ? "#1F2937" : "#E2E8F0",
    "--site-heading-font": `'${fonts.headingFont}', Georgia, serif`,
    "--site-body-font": `'${fonts.bodyFont}', system-ui, sans-serif`,
  } as CSSProperties;
}

/**
 * Google Fonts URL for a font pack.
 */
export function googleFontsHref(fonts: FontPack): string {
  const families = Array.from(
    new Set([fonts.headingFont, fonts.bodyFont].filter(Boolean)),
  ).map((family) => `family=${family.trim().replace(/\s+/g, "+")}:wght@400;500;600;700`);

  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
