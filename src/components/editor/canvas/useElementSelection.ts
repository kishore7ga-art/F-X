"use client";

import { useCallback, useLayoutEffect, useState, type RefObject } from "react";
import { probeSection, type ElementPath, type ProbedElement } from "@/lib/sections/section-probe";
import { splitSectionCode } from "@/lib/sections/section-managed-css";

export type SelectableKind = "card" | "heading" | "paragraph" | "image" | "button" | "badge" | "section";

export interface SelectableHit {
  element: HTMLElement;
  kind: SelectableKind;
  label: string;
}

function resolveDomPath(root: Element, path: ElementPath): HTMLElement | null {
  let current: Element | null = root;
  for (const index of path) {
    if (!current) return null;
    current = current.children[index] ?? null;
  }
  return (current as HTMLElement | null) ?? null;
}

const KIND_LABEL: Record<SelectableKind, string> = {
  card: "Card",
  heading: "Heading",
  paragraph: "Text",
  image: "Image",
  button: "Button",
  badge: "Badge",
  section: "Section",
};

/**
 * Resolves a click on the live canvas to the specific structural element a
 * probe of the section's own markup already knows about — a card, a
 * heading, an image, a button — instead of a fixed tag/class list.
 *
 * ── Root-cause fix for selection "hijacking" ────────────────────────────────
 *
 * The previous approach (`target.closest("button, a, img, ..., .card")`) has
 * nothing to match against a plain, unclassed `<div>` card wrapper written by
 * an administrator without a `.card` class or `data-card` attribute. A click
 * on that card's padding — not on the heading or button inside it — then
 * fell through to whatever ancestor *did* match, which is sometimes nothing
 * closer than the section root.
 *
 * `probeSection` already finds cards (repeater items), headings, paragraphs,
 * images and buttons structurally — the same detection the section toolbar
 * uses to build its own control panel — so this reuses that instead of
 * guessing from tag names, with no requirement that admin markup carry any
 * particular attribute or class.
 */
export function useElementSelection(containerRef: RefObject<HTMLElement | null>, code: string) {
  const [index, setIndex] = useState<SelectableHit[]>([]);

  /**
   * `useLayoutEffect`, not `useMemo` — the container is only real once the
   * DOM has committed (`ref.current` is `null` during render, on every
   * render, refs attach after), so a memo keyed off the ref object's
   * identity would compute an empty index the first time and never again
   * until `code` happened to change. The effect re-runs after commit, so it
   * sees the mounted node on the very first pass too.
   */
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setIndex([]);
      return;
    }
    const { bodyHtml } = splitSectionCode(code);
    const probe = probeSection(bodyHtml);

    const hits: SelectableHit[] = [];
    const add = (probed: ProbedElement | null | undefined, kind: SelectableKind) => {
      if (!probed) return;
      const element = resolveDomPath(container, probed.path);
      if (!element) return;
      hits.push({ element, kind, label: probed.text.trim().slice(0, 28) || KIND_LABEL[kind] });
    };

    // Priority order: the most specific / most likely intended target wins
    // when a node happens to qualify as more than one kind.
    probe.repeaters.forEach((repeater) => repeater.items.forEach((item) => add(item, "card")));
    probe.actions.forEach((action) => add(action, "button"));
    probe.navLinks.forEach((link) => add(link, "button"));
    probe.socials.forEach((link) => add(link, "button"));
    probe.contacts.forEach((link) => add(link, "button"));
    probe.headings.forEach((heading) => add(heading, "heading"));
    probe.paragraphs.forEach((paragraph) => add(paragraph, "paragraph"));
    probe.images.forEach((image) => add(image, "image"));
    if (probe.logo) add(probe.logo, "image");

    const seen = new Set<HTMLElement>();
    setIndex(
      hits.filter((hit) => {
        if (seen.has(hit.element)) return false;
        seen.add(hit.element);
        return true;
      }),
    );
  }, [containerRef, code]);

  /**
   * Walks up from the raw event target toward `container`, returning the
   * first (nearest / most specific) probed element on the way — so clicking
   * a heading's text selects the heading, and clicking a card's own padding,
   * with nothing more specific in between, selects the card.
   */
  const resolveSelectable = useCallback(
    (raw: HTMLElement, container: HTMLElement): SelectableHit | null => {
      let node: HTMLElement | null = raw;
      while (node) {
        const hit = index.find((entry) => entry.element === node);
        if (hit) return hit;
        if (node === container) break;
        node = node.parentElement;
      }
      // `[data-badge]` / `.badge` has no structural probe of its own — keep
      // the one existing heuristic for it, since it's cheap and specific.
      const badge = raw.closest("[data-badge], .badge") as HTMLElement | null;
      if (badge && container.contains(badge)) {
        return { element: badge, kind: "badge", label: "Badge" };
      }
      return null;
    },
    [index],
  );

  return { resolveSelectable };
}
