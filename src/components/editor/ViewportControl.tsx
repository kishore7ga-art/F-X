"use client";

import { Monitor, Smartphone, Tablet, ZoomIn } from "lucide-react";

import {
  cycleZoom,
  orderedTiers,
  positionInTier,
  presetsForTier,
  switchTier,
  type DeviceCatalogue,
  type DeviceIcon,
  type ViewportState,
} from "@/lib/viewport-presets";

/**
 * The device, the width and the zoom — three controls, no menus.
 *
 * ── Why width and zoom are separate controls ───────────────────────────────
 *
 * They read as the same thing and are not. The width decides what the *site*
 * believes about its viewport, and changing it changes the layout. The zoom
 * decides how large that is drawn for the operator, and changing it changes
 * nothing about the layout at all. Two controls, then, with the width in
 * pixels and the zoom in per cent, so the label always says which you are
 * changing.
 *
 * ── Why there is no dropdown ───────────────────────────────────────────────
 *
 * Each device button is the whole control for its tier. Clicking a tier you
 * are not on switches to it — at the width you last looked at there, or the
 * tier's default the first time. Clicking the tier you *are* on steps to the
 * next width, and past the last one wraps to the first. The button shows the
 * width; the tooltip says where it sits in the ladder and which width the
 * next click goes to.
 *
 * What the ladder contains is not this component's business. Tiers, widths,
 * notes and defaults come from the catalogue; the component draws whatever
 * it is handed, and a tier with nothing in it is drawn disabled.
 */

const ACCENT = "#2563eb";
const IDLE = "#475569";
const MUTED = "#cbd5e1";
const FONT = "'Plus Jakarta Sans', sans-serif";

const ICONS: Record<DeviceIcon, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  phone: Smartphone,
};

export function ViewportControl({
  viewport,
  catalogue,
  onChange,
  scale,
  orientation,
  variant = "dark",
}: {
  viewport: ViewportState;
  catalogue: DeviceCatalogue;
  onChange: (next: ViewportState) => void;
  /** What "Fit" currently works out to, so the zoom button can show it. */
  scale: number;
  orientation: "horizontal" | "vertical";
  variant?: "dark" | "light";
}) {
  const isDark = variant === "dark";
  const vertical = orientation === "vertical";
  const tiers = orderedTiers(catalogue);
  const { index, total } = positionInTier(viewport, catalogue);

  const zoomLabel =
    viewport.zoom === null ? `Fit ${Math.round(scale * 100)}%` : `${Math.round(viewport.zoom * 100)}%`;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: "center",
        gap: vertical ? "6px" : "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          alignItems: "center",
          gap: "2px",
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "rgba(241, 245, 249, 0.8)",
          padding: "2px",
          borderRadius: "9999px",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(226, 232, 240, 0.8)",
        }}
      >
        {tiers.map((tier) => {
          const Icon = ICONS[tier.icon] ?? Monitor;
          const presets = presetsForTier(catalogue, tier.id);
          const active = viewport.mode === tier.id;
          const empty = presets.length === 0;

          const upcoming = active ? switchTier(viewport, catalogue, tier.id) : null;
          const remembered = viewport.memory[tier.id];
          const title = empty
            ? `${tier.label} — no widths configured`
            : active
              ? total > 1
                ? `${tier.label} ${viewport.width}px (${index + 1}/${total}). Click for ${upcoming!.width}px`
                : `${tier.label} ${viewport.width}px — the only width in this tier`
              : `Preview at ${tier.label.toLowerCase()} width${remembered ? ` (${remembered}px)` : ""}`;

          return (
            <button
              key={tier.id}
              type="button"
              disabled={empty}
              onClick={() => {
                const next = switchTier(viewport, catalogue, tier.id);
                if (next !== viewport) onChange(next);
              }}
              aria-pressed={active}
              aria-label={title}
              title={title}
              style={{
                height: vertical ? "28px" : "28px",
                width: vertical ? "28px" : undefined,
                padding: vertical ? 0 : active ? "0 10px" : "0 7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                border: "none",
                borderRadius: "9999px",
                backgroundColor: active
                  ? "#2563eb"
                  : "transparent",
                boxShadow: active
                  ? "0 2px 8px rgba(37, 99, 235, 0.35)"
                  : "none",
                cursor: empty ? "not-allowed" : "pointer",
                color: empty
                  ? isDark ? "#475569" : "#cbd5e1"
                  : active
                    ? "#ffffff"
                    : isDark ? "#94a3b8" : "#64748b",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Icon
                style={{
                  width: "15px",
                  height: "15px",
                  strokeWidth: active ? 2.2 : 1.8,
                  color: "inherit",
                }}
              />
              {active && !vertical ? (
                <span
                  style={{
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: "11.5px",
                    color: "#ffffff",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {viewport.width}
                </span>
              ) : null}
            </button>
          );
        })}

        {tiers.length === 0 ? (
          <span
            title="Loading device widths…"
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: "12px", color: IDLE, padding: "0 8px" }}
          >
            {viewport.width}
          </span>
        ) : null}
      </div>

      <div
        style={
          vertical
            ? { height: "1px", width: "16px", backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0", margin: "2px 0" }
            : { width: "1px", height: "14px", backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0", margin: "0 2px" }
        }
      />

      <button
        type="button"
        onClick={() => onChange(cycleZoom(viewport))}
        title={`Zoom ${zoomLabel} — how large the ${viewport.width}px preview is drawn. Click for the next level; does not change the layout`}
        aria-label={`Zoom ${zoomLabel}. Click for the next level`}
        style={{
          height: vertical ? "28px" : "28px",
          padding: vertical ? 0 : "0 8px",
          width: vertical ? "28px" : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(226, 232, 240, 0.8)",
          borderRadius: "9999px",
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "rgba(241, 245, 249, 0.8)",
          cursor: "pointer",
          color: isDark ? "#cbd5e1" : "#475569",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <ZoomIn style={{ width: "14px", height: "14px", strokeWidth: 2, color: "inherit" }} />
        {vertical ? null : (
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: "11.5px",
              color: "inherit",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {zoomLabel}
          </span>
        )}
      </button>
    </div>
  );
}
