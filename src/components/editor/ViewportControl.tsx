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
}: {
  viewport: ViewportState;
  catalogue: DeviceCatalogue;
  onChange: (next: ViewportState) => void;
  /** What "Fit" currently works out to, so the zoom button can show it. */
  scale: number;
  orientation: "horizontal" | "vertical";
}) {
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
        gap: vertical ? "6px" : "2px",
      }}
    >
      {tiers.map((tier) => {
        const Icon = ICONS[tier.icon] ?? Monitor;
        const presets = presetsForTier(catalogue, tier.id);
        const active = viewport.mode === tier.id;
        const empty = presets.length === 0;

        // What one click will do, said in the tooltip.
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
              height: vertical ? "30px" : "32px",
              width: vertical ? "30px" : undefined,
              padding: vertical ? 0 : active ? "0 8px" : "0 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: "none",
              borderBottom: vertical ? undefined : active ? `2px solid ${ACCENT}` : "2px solid transparent",
              borderRadius: vertical ? "8px" : 0,
              backgroundColor: vertical && active ? "#eff6ff" : "transparent",
              cursor: empty ? "not-allowed" : "pointer",
              color: empty ? MUTED : active ? ACCENT : IDLE,
              transition: "all 0.15s ease",
            }}
          >
            <Icon style={{ width: "16px", height: "16px", strokeWidth: 2, color: empty ? MUTED : active ? ACCENT : IDLE }} />
            {/* The width, on the active device only. Where it sits in the
                ladder is in the tooltip, not on the button — the number the
                person is checking is the one worth the space. */}
            {active && !vertical ? (
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: "12px",
                  color: ACCENT,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {viewport.width}
              </span>
            ) : null}
          </button>
        );
      })}

      {tiers.length === 0 ? (
        // Nothing loaded yet: the width the canvas is drawn at, and nothing to click.
        <span
          title="Loading device widths…"
          style={{ fontFamily: FONT, fontWeight: 600, fontSize: "12px", color: IDLE, padding: "0 8px" }}
        >
          {viewport.width}
        </span>
      ) : null}

      <div
        style={
          vertical
            ? { height: "1px", width: "18px", backgroundColor: "#cbd5e1", margin: "2px 0" }
            : { width: "1px", height: "16px", backgroundColor: "#cbd5e1", margin: "0 6px" }
        }
      />

      <button
        type="button"
        onClick={() => onChange(cycleZoom(viewport))}
        title={`Zoom ${zoomLabel} — how large the ${viewport.width}px preview is drawn. Click for the next level; does not change the layout`}
        aria-label={`Zoom ${zoomLabel}. Click for the next level`}
        style={{
          height: vertical ? "30px" : "32px",
          padding: vertical ? 0 : "0 6px",
          width: vertical ? "30px" : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          border: "none",
          borderRadius: vertical ? "8px" : 0,
          backgroundColor: "transparent",
          cursor: "pointer",
          color: IDLE,
          transition: "all 0.15s ease",
        }}
      >
        <ZoomIn style={{ width: "15px", height: "15px", strokeWidth: 2, color: IDLE }} />
        {vertical ? null : (
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: "12px",
              color: IDLE,
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
