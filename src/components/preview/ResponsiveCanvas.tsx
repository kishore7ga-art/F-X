"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { effectiveScale, type ViewportState } from "@/lib/viewport-presets";

/**
 * The site, laid out at a chosen viewport width and drawn to fit the pane.
 *
 * ── The bug this component exists to fix ───────────────────────────────────
 *
 * The editor canvas and the site preview each carried the same line:
 *
 *     style={{ width: previewWidth, maxWidth: "100%" }}
 *
 * `maxWidth: "100%"` clamps the canvas to the pane, and because the canvas is
 * also the container every section's `@container` query is written against,
 * clamping the box **changes the layout the sections resolve to**. Select 1920
 * inside a 900px pane and the site is laid out for 900 — the breakpoints, the
 * column counts and the type scale are all the 900px ones — while the toolbar
 * says 1920. The preview did not merely look small; it showed a different
 * website from the one it claimed to be showing, and never said so.
 *
 * It also meant six of the ten desktop widths could not be previewed at all on
 * an ordinary laptop: every width above the pane silently collapsed to the pane.
 *
 * The two sizes are separated here. The canvas gets its **real** CSS width and
 * keeps it; a `transform` is what makes it visible. Transforms are painted after
 * layout, so nothing inside the canvas can observe one — the container queries,
 * `@media` rewrites and Tailwind mirror all resolve against the true width.
 *
 * ── Why the wrapper is measured ────────────────────────────────────────────
 *
 * A transform does not change the space an element occupies. Scaling a 3840px
 * canvas to 24% would still reserve 3840px of layout, so the pane would scroll
 * sideways past several screens of nothing. The outer box therefore takes the
 * *scaled* dimensions and the scaled element is positioned absolutely inside it,
 * out of flow. Absolute positioning also breaks the feedback loop: the child's
 * height is content-driven and cannot be influenced by the height we derive from
 * it, so the ResizeObserver below settles instead of oscillating.
 */
export function ResponsiveCanvas({
  viewport,
  themeId,
  fontId,
  canvasClassName = "",
  paneClassName = "",
  chromeClassName = "",
  onScaleChange,
  children,
}: {
  viewport: ViewportState;
  themeId?: string | null;
  fontId?: string | null;
  /** Extra classes on the element that stands in for `<body>`. */
  canvasClassName?: string;
  /** The scrolling area the canvas is centred in. */
  paneClassName?: string;
  /** The device frame. Outside the transform, so its border stays one real pixel. */
  chromeClassName?: string;
  /** Reported so a toolbar can show what "Fit" currently works out to. */
  onScaleChange?: (scale: number) => void;
  children: ReactNode;
}) {
  const paneRef = useRef<HTMLDivElement | null>(null);
  const scaledRef = useRef<HTMLDivElement | null>(null);

  const [available, setAvailable] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  /**
   * How much room the pane has.
   *
   * Measured rather than assumed, because it changes for reasons that have
   * nothing to do with the viewport selection — opening the section drawer,
   * dragging the toolbar dock, resizing the browser. `Fit` has to answer to the
   * pane as it actually is at that moment.
   */
  useLayoutEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    setAvailable(pane.clientWidth);
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setAvailable(entry.contentRect.width);
    });
    observer.observe(pane);
    return () => observer.disconnect();
  }, []);

  /**
   * How tall the canvas is at its real width — untransformed.
   *
   * `offsetHeight` is a layout measurement, so it reports the height before any
   * scaling. That is the number the scaled wrapper needs: multiply by the scale
   * and the page reserves exactly the space the canvas visually occupies, so the
   * scroll length is honest at every zoom.
   */
  useLayoutEffect(() => {
    const el = scaledRef.current;
    if (!el) return;

    setNaturalHeight(el.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => setNaturalHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = effectiveScale(viewport, available);

  /**
   * Reported through a ref, deliberately.
   *
   * Callers pass an inline arrow, so `onScaleChange` is a new function on every
   * render. With it in the dependency array the effect would run every render,
   * call back, set state in the parent, and render again — a loop that only
   * stops if the parent happens to bail out. The ref keeps the effect keyed on
   * the one thing that actually changed.
   */
  const report = useRef(onScaleChange);
  useLayoutEffect(() => {
    report.current = onScaleChange;
  });
  useLayoutEffect(() => {
    report.current?.(scale);
  }, [scale]);

  /**
   * Left off entirely at 1:1.
   *
   * `scale(1)` is not free: it establishes a stacking context and a containing
   * block for fixed-position descendants, and some engines rasterise through it.
   * At 100% there is nothing to scale, so the canvas is left exactly as it was
   * before this component existed — which is also the case where crisp text
   * matters most.
   */
  const transformed = scale !== 1;

  return (
    <div
      ref={paneRef}
      /*
       * A plain block, not a centring flex row. A flex container with
       * `justify-content: center` clips the *start* of an overflowing child —
       * scroll left at 3840px and the first 1000px would be unreachable. Auto
       * margins do not: they resolve to zero once the child is wider than the
       * space, and the child simply scrolls.
       */
      className={`w-full overflow-x-auto ${paneClassName}`}
    >
      <div
        className={chromeClassName}
        style={{
          // The scaled footprint. This is what the page lays out around; the
          // canvas itself is out of flow inside it.
          width: viewport.width * scale,
          height: naturalHeight * scale,
          position: "relative",
          margin: "0 auto",
          // Content-box so a chrome border wraps the canvas rather than eating
          // into the width the sections are measured against.
          boxSizing: "content-box",
        }}
      >
        <div
          ref={scaledRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            // The real viewport width. Never clamped — this is the whole point.
            width: viewport.width,
            transformOrigin: "top left",
            transform: transformed ? `scale(${scale})` : undefined,
          }}
        >
          <div
            data-xite-theme={themeId ?? undefined}
            data-xite-font={fontId ?? undefined}
            className={`xite-site-canvas block ${canvasClassName}`}
            style={{ width: viewport.width }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
