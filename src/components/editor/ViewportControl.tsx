"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, Tablet, ZoomIn } from "lucide-react";

import {
  DEFAULT_WIDTH,
  WIDTHS_FOR,
  ZOOM_LEVELS,
  nearestWidth,
  type DeviceMode,
  type ViewportState,
  type ZoomLevel,
} from "@/lib/viewport-presets";

/**
 * The device, the width and the zoom — the three controls, in one place.
 *
 * ── Why width and zoom are separate controls ───────────────────────────────
 *
 * They read as the same thing and are not. The width decides what the *site*
 * believes about its viewport, and changing it changes the layout. The zoom
 * decides how large that is drawn for the operator, and changing it changes
 * nothing about the layout at all.
 *
 * The toolbar used to have one control that meant both: three buttons that
 * cycled a width, with the desktop one labelled "100%" — a percentage sitting
 * where a width belonged, which is precisely the confusion. Somebody who wanted
 * a closer look at a phone layout had no way to ask for one, and the only
 * "zoom" available silently switched the site to a different layout.
 *
 * Two controls, then, with the width in pixels and the zoom in per cent, so the
 * label always says which of the two you are changing.
 */

const ACCENT = "#2563eb";
const IDLE = "#475569";
const FONT = "'Plus Jakarta Sans', sans-serif";

const DEVICES: { mode: DeviceMode; icon: typeof Monitor; label: string }[] = [
  { mode: "desktop", icon: Monitor, label: "Desktop" },
  { mode: "tablet", icon: Tablet, label: "Tablet" },
  { mode: "phone", icon: Smartphone, label: "Phone" },
];

/** Closes a popover on any click that lands outside it, and on Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return ref;
}

function Popover({
  open,
  side,
  children,
}: {
  open: boolean;
  side: "up" | "right";
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      role="menu"
      style={{
        position: "absolute",
        // Above the dock when it lies along an edge, beside it when it stands on end.
        ...(side === "up"
          ? { bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }
          : { left: "calc(100% + 10px)", top: "50%", transform: "translateY(-50%)" }),
        zIndex: 60,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.18)",
        padding: "6px",
        minWidth: "184px",
        maxHeight: "min(58vh, 420px)",
        overflowY: "auto",
      }}
    >
      {children}
    </div>
  );
}

function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "4px 10px 6px",
        fontFamily: FONT,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#94a3b8",
      }}
    >
      {children}
    </div>
  );
}

function MenuItem({
  selected,
  onClick,
  primary,
  secondary,
}: {
  selected: boolean;
  onClick: () => void;
  primary: string;
  secondary?: string;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "12px",
        padding: "7px 10px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: selected ? "#eff6ff" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
      }}
    >
      <span
        style={{
          fontSize: "12px",
          fontWeight: selected ? 700 : 500,
          color: selected ? ACCENT : "#1e293b",
          // Widths line up in a column, so the digits should too.
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {primary}
      </span>
      {secondary ? (
        <span style={{ fontSize: "10.5px", fontWeight: 500, color: "#94a3b8" }}>{secondary}</span>
      ) : null}
    </button>
  );
}

export function ViewportControl({
  viewport,
  onChange,
  scale,
  orientation,
}: {
  viewport: ViewportState;
  onChange: (next: ViewportState) => void;
  /** What "Fit" currently works out to, so the zoom button can show it. */
  scale: number;
  orientation: "horizontal" | "vertical";
}) {
  const [open, setOpen] = useState<"width" | "zoom" | null>(null);
  const ref = useDismiss(open !== null, () => setOpen(null));

  const side = orientation === "horizontal" ? "up" : "right";
  const vertical = orientation === "vertical";

  /**
   * Switching device keeps the width you were looking at, where it exists.
   *
   * Jumping to the mode's default every time throws away a deliberate choice:
   * somebody comparing 1024 on tablet against 1024 on desktop wants the same
   * number on both sides of the comparison, and both ladders contain it. Where
   * the current width has no near equivalent — 3840 has nothing like it on a
   * phone — the mode's default is used instead of the nearest, because the
   * nearest to 3840 is 540, and offering that as "the same view" would be worse
   * than plainly starting somewhere sensible.
   */
  const pickMode = (mode: DeviceMode) => {
    if (mode === viewport.mode) {
      setOpen(open === "width" ? null : "width");
      return;
    }

    const exact = WIDTHS_FOR[mode].some((preset) => preset.width === viewport.width);
    const near = nearestWidth(mode, viewport.width);
    const withinReach = Math.abs(near - viewport.width) <= viewport.width * 0.25;

    onChange({
      ...viewport,
      mode,
      width: exact ? viewport.width : withinReach ? near : DEFAULT_WIDTH[mode],
    });
    setOpen(null);
  };

  const zoomLabel =
    viewport.zoom === null ? `Fit ${Math.round(scale * 100)}%` : `${Math.round(viewport.zoom * 100)}%`;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: "center",
        gap: vertical ? "6px" : "2px",
      }}
    >
      {DEVICES.map(({ mode, icon: Icon, label }) => {
        const active = viewport.mode === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => pickMode(mode)}
            aria-pressed={active}
            aria-haspopup={active ? "menu" : undefined}
            aria-expanded={active ? open === "width" : undefined}
            title={
              active
                ? `${label} — ${viewport.width}px. Choose another width`
                : `Preview at ${label.toLowerCase()} width`
            }
            style={{
              height: vertical ? "30px" : "32px",
              width: vertical ? "30px" : undefined,
              padding: vertical ? 0 : active ? "0 8px" : "0 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: "none",
              borderBottom: vertical
                ? undefined
                : active
                  ? `2px solid ${ACCENT}`
                  : "2px solid transparent",
              borderRadius: vertical ? "8px" : 0,
              backgroundColor: vertical && active ? "#eff6ff" : "transparent",
              cursor: "pointer",
              color: active ? ACCENT : IDLE,
              transition: "all 0.15s ease",
            }}
          >
            <Icon
              style={{
                width: "16px",
                height: "16px",
                strokeWidth: 2,
                color: active ? ACCENT : IDLE,
              }}
            />
            {/* The width, on the active device only. Three numbers at once is
                two more than the question being asked. */}
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

      <div
        style={
          vertical
            ? { height: "1px", width: "18px", backgroundColor: "#cbd5e1", margin: "2px 0" }
            : { width: "1px", height: "16px", backgroundColor: "#cbd5e1", margin: "0 6px" }
        }
      />

      <button
        type="button"
        onClick={() => setOpen(open === "zoom" ? null : "zoom")}
        aria-haspopup="menu"
        aria-expanded={open === "zoom"}
        title={`Zoom — how large the ${viewport.width}px preview is drawn. Does not change the layout`}
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

      <Popover open={open === "width"} side={side}>
        <MenuLabel>{viewport.mode} width</MenuLabel>
        {WIDTHS_FOR[viewport.mode].map((preset) => (
          <MenuItem
            key={preset.width}
            selected={preset.width === viewport.width}
            onClick={() => {
              onChange({ ...viewport, width: preset.width });
              setOpen(null);
            }}
            primary={`${preset.width} px`}
            secondary={preset.note}
          />
        ))}
      </Popover>

      <Popover open={open === "zoom"} side={side}>
        <MenuLabel>Zoom</MenuLabel>
        {/* Fit comes first and is not a zoom level: it means "whatever makes the
            selected width visible", a number that moves with the pane. Storing it
            as a percentage would freeze it at whatever the pane happened to be
            when it was chosen. */}
        <MenuItem
          selected={viewport.zoom === null}
          onClick={() => {
            onChange({ ...viewport, zoom: null });
            setOpen(null);
          }}
          primary="Fit to screen"
          secondary={`${Math.round(scale * 100)}%`}
        />
        {ZOOM_LEVELS.map((level) => (
          <MenuItem
            key={level}
            selected={viewport.zoom === level}
            onClick={() => {
              onChange({ ...viewport, zoom: level as ZoomLevel });
              setOpen(null);
            }}
            primary={`${Math.round(level * 100)}%`}
            secondary={level === 1 ? "Actual size" : undefined}
          />
        ))}
      </Popover>
    </div>
  );
}
