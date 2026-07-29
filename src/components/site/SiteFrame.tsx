"use client";

import { useEffect, useState, type ReactNode } from "react";

import type { PaletteColors, FontPack } from "@/lib/theme/theme";
import { buildThemeStyle, googleFontsHref } from "@/lib/theme/theme";

/**
 * Applies a college's palette + font pack + Dark/Light theme mode as CSS custom properties.
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initial check
    const checkDark = () => {
      const isDocDark = document.documentElement.classList.contains("dark");
      const saved = localStorage.getItem("xite-theme-mode") === "dark";
      setIsDark(isDocDark || saved);
    };

    checkDark();

    // Listen to MutationObserver for class changes on <html>
    const observer = new MutationObserver(() => {
      checkDark();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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
        data-site-frame=""
        style={buildThemeStyle(colors, fonts, isDark)}
        className={`font-[family-name:var(--site-body-font)] bg-[var(--site-bg)] text-[var(--site-dark)] transition-colors duration-300 min-h-screen ${className}`}
      >
        {children}
      </div>
    </>
  );
}
