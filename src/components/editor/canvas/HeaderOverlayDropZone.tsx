"use client";

export interface HeaderOverlayDropZoneProps {
  isOverlaid?: boolean;
  onToggleOverlay?: (enable: boolean) => void;
  resolveHeader?: () => HTMLElement | null;
  revision?: string;
  headerTitle?: string;
  heroTitle?: string;
}

/**
 * The overlay toggle button has been removed.
 * Headers now automatically and always overlap the following content section.
 */
export function HeaderOverlayDropZone(_props?: HeaderOverlayDropZoneProps) {
  return null;
}

