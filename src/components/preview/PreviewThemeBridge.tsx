"use client";

import { useEffect } from "react";

import {
  isPreviewMessage,
  PREVIEW_READY,
  PREVIEW_THEME,
} from "@/lib/theme/preview-message";
import { buildThemeStyle, googleFontsHref } from "@/lib/theme/theme";

const FONT_LINK_ID = "preview-font-link";

/**
 * Runs inside the preview iframe. Applies palette/font changes the picker sends
 * by mutating CSS variables, so switching a swatch repaints instantly instead
 * of reloading the whole document.
 */
export function PreviewThemeBridge() {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isPreviewMessage(event.data)) return;
      if (event.data.type !== PREVIEW_THEME) return;

      const { colors, fonts } = event.data;

      const frame = document.querySelector<HTMLElement>("[data-site-frame]");
      if (frame) {
        for (const [property, value] of Object.entries(
          buildThemeStyle(colors, fonts),
        )) {
          frame.style.setProperty(property, String(value));
        }
      }

      let link = document.getElementById(
        FONT_LINK_ID,
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.id = FONT_LINK_ID;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = googleFontsHref(fonts);
    }

    window.addEventListener("message", handleMessage);
    window.parent?.postMessage({ type: PREVIEW_READY }, window.location.origin);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
