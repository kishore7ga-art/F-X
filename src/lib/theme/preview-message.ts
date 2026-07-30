import type { FontPack, PaletteColors } from "@/lib/theme/theme";

/** Contract between the theme picker and the preview iframe. */
export const PREVIEW_READY = "preview-ready" as const;
export const PREVIEW_THEME = "preview-theme" as const;

export type PreviewReadyMessage = { type: typeof PREVIEW_READY };

export type PreviewThemeMessage = {
  type: typeof PREVIEW_THEME;
  colors: PaletteColors;
  fonts: FontPack;
};

export type PreviewMessage = PreviewReadyMessage | PreviewThemeMessage;

export function isPreviewMessage(value: unknown): value is PreviewMessage {
  if (typeof value !== "object" || value === null) return false;
  const type = (value as { type?: unknown }).type;
  return type === PREVIEW_READY || type === PREVIEW_THEME;
}
