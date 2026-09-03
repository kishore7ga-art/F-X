"use client";

import { useEffect, type RefObject } from "react";

function unloadMedia(node: Node) {
  if (!(node instanceof Element)) return;
  const players = node.matches("video, audio")
    ? [node as HTMLMediaElement]
    : Array.from(node.querySelectorAll<HTMLMediaElement>("video, audio"));
  players.forEach((el) => {
    try {
      el.pause();
      el.removeAttribute("src");
      el.querySelectorAll("source").forEach((source) => source.remove());
      el.load();
    } catch {
      // A media element mid-teardown can throw on `.load()` in some
      // browsers; the goal is best-effort resource release, not a hard
      // guarantee, so a failed attempt here is not worth surfacing.
    }
  });
}

/**
 * Forces the browser to release a `<video>`/`<audio>` element's underlying
 * WebMediaPlayer as soon as it's removed from the DOM, instead of leaving it
 * to garbage collection.
 *
 * Section markup renders via `dangerouslySetInnerHTML`, and every control
 * edit re-serializes the whole section and replaces its innerHTML —
 * intentionally, see `section-edit.ts`'s "the section IS the string". A
 * section with a background or hero video then mints a brand new
 * WebMediaPlayer on every commit — a slider drag alone can fire dozens in a
 * few seconds — and the old one is not reliably reclaimed immediately,
 * especially one still playing at the moment of removal. Chromium enforces
 * a hard cap on live WebMediaPlayer instances per tab and blocks new ones
 * past it, which surfaces as `[Intervention] Blocked attempt to create a
 * WebMediaPlayer...` in the console and a canvas that silently stops
 * reflecting further edits to that section's video.
 *
 * A `MutationObserver` is the only hook point available here: React commits
 * `dangerouslySetInnerHTML`'s DOM mutation directly, with no lifecycle
 * callback in between the old and new content, so nothing can intervene
 * *before* the swap — but the observer still receives the detached nodes in
 * `removedNodes`, which is enough to unload them immediately after.
 */
export function useMediaCleanupOnReplace(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach(unloadMedia);
      });
    });
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [containerRef]);
}
