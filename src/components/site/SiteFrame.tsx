import type { ReactNode } from "react";

import type { PaletteColors, FontPack } from "@/lib/theme/theme";
import { buildThemeStyle, googleFontsHref } from "@/lib/theme/theme";

/**
 * Applies a college's palette + font pack as CSS custom properties. Everything
 * rendered inside inherits the theme; no section component hard-codes a colour.
 */
export function SiteFrame({
  colors,
  fonts,
  children,
  className = "",
}: {
  colors: PaletteColors;
  fonts: FontPack;
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={googleFontsHref(fonts)} />
      <div
        // The theme picker's live preview mutates these CSS variables in place
        // (see PreviewThemeBridge) instead of reloading the iframe.
        data-site-frame=""
        style={buildThemeStyle(colors, fonts)}
        className={`font-[family-name:var(--site-body-font)] bg-white text-[var(--site-dark)] ${className}`}
      >
        {children}
      </div>
    </>
  );
}
