"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";

import { hexToRgb } from "@/lib/editor-themes";

/**
 * The colour-chart picker: a saturation/value square, a hue bar and a hex
 * field, the layout every design tool uses. It replaces the native
 * `<input type="color">`, which on Windows opens the old GDI dialog with no
 * hex field and a look nothing like the drawer.
 *
 * Works in HSV rather than HSL because that is what the square is: left→right
 * is saturation, top→bottom is value, and the hue bar picks the base colour.
 */

type Hsv = { h: number; s: number; v: number };

function hexToHsv(hex: string): Hsv {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToHex({ h, s, v }: Hsv): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return (
    "#" +
    rgb
      .map((n) =>
        Math.round((n + m) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

const isFullHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function ColorPickerPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  /**
   * The HSV shown is derived from `value` — except when `value` is the hex
   * this picker itself last produced, in which case the HSV it was produced
   * from is used. A hex loses information at the edges: every fully black
   * colour is `#000000` whatever its hue, and white has no saturation, so
   * deriving alone would snap the hue marker back to red the moment the
   * pointer reached the bottom of the square. A hex typed into the field or
   * a swatch click differs from the last produced one and re-seeds it.
   */
  const [produced, setProduced] = useState<{ hex: string; hsv: Hsv }>(() => ({
    hex: value.toLowerCase(),
    hsv: hexToHsv(value),
  }));
  const hsv = produced.hex === value.toLowerCase() ? produced.hsv : hexToHsv(value);

  /** What the hex field shows while it has focus; otherwise the live colour. */
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (next: Hsv) => {
    const hex = hsvToHex(next);
    setProduced({ hex, hsv: next });
    onChange(hex);
  };

  /**
   * Pointer capture keeps the drag alive when the pointer leaves the box.
   * Called from the handler, never during render, so it can read the DOM.
   */
  const startDrag = (e: ReactPointerEvent<HTMLDivElement>, apply: (x: number, y: number) => void) => {
    const el = e.currentTarget;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const move = (ev: { clientX: number; clientY: number }) => {
      const rect = el.getBoundingClientRect();
      apply(
        clamp((ev.clientX - rect.left) / rect.width, 0, 1),
        clamp((ev.clientY - rect.top) / rect.height, 0, 1),
      );
    };
    move(e);
    const onMove = (ev: globalThis.PointerEvent) => move(ev);
    const onUp = () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
  };

  const pureHue = hsvToHex({ h: hsv.h, s: 1, v: 1 });
  const current = hsvToHex(hsv);
  const markerRing = hsv.v > 0.5 && hsv.s < 0.6 ? "#0f172a" : "#ffffff";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "10px",
        borderRadius: "10px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Saturation / value square */}
      <div
        onPointerDown={(e) => {
          // Both axes move together, so the drag closes over the hue only.
          const h = hsv.h;
          startDrag(e, (x, y) => commit({ h, s: x, v: 1 - y }));
        }}
        role="slider"
        aria-label="Saturation and brightness"
        aria-valuenow={Math.round(hsv.v * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={current}
        style={{
          position: "relative",
          width: "100%",
          height: "140px",
          borderRadius: "8px",
          cursor: "crosshair",
          touchAction: "none",
          backgroundColor: pureHue,
          backgroundImage:
            "linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0))",
          boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: current,
            border: `2px solid ${markerRing}`,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Hue bar */}
      <div
        onPointerDown={(e) => {
          const { s: sat, v } = hsv;
          startDrag(e, (x) => commit({ h: x * 359.999, s: sat, v }));
        }}
        role="slider"
        aria-label="Hue"
        aria-valuenow={Math.round(hsv.h)}
        aria-valuemin={0}
        aria-valuemax={360}
        style={{
          position: "relative",
          height: "12px",
          borderRadius: "6px",
          cursor: "pointer",
          touchAction: "none",
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
          boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${(hsv.h / 360) * 100}%`,
            top: "50%",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: pureHue,
            border: "2px solid #ffffff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Hex code */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            backgroundColor: current,
            boxShadow: "0 0 0 1px #cbd5e1",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", letterSpacing: "0.06em" }}>HEX</span>
        <input
          type="text"
          aria-label="Hex colour code"
          value={draft ?? current}
          spellCheck={false}
          onFocus={() => setDraft(current)}
          onBlur={() => setDraft(null)}
          onChange={(e) => {
            const raw = e.target.value.trim();
            const next = raw.startsWith("#") ? raw : `#${raw}`;
            setDraft(next);
            if (isFullHex(next)) onChange(next.toLowerCase());
          }}
          maxLength={7}
          style={{
            flex: 1,
            height: "28px",
            borderRadius: "6px",
            border: `1px solid ${draft === null || isFullHex(draft) ? "#cbd5e1" : "#f87171"}`,
            padding: "0 8px",
            fontSize: "12px",
            fontFamily: "monospace",
            fontWeight: 700,
            color: "#0f172a",
            backgroundColor: "#ffffff",
          }}
        />
      </div>
    </div>
  );
}
