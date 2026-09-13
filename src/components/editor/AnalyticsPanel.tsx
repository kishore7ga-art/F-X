"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Loader2, RefreshCw } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import {
  getAnalyticsOverview,
  POLL_INTERVAL_MS,
  type AnalyticsOverview,
} from "@/lib/analytics-client";

/**
 * Live telemetry for the tenant's published site.
 *
 * Charts are drawn as inline SVG rather than with a charting library. Two
 * reasons, and the second is the real one: the editor bundle is already 467 kB
 * and Recharts adds about 90 kB gzipped for two charts in one tab of one modal;
 * and the shapes here — a sparkline and a horizontal funnel — are a `path` and
 * some rectangles. A dependency is worth it when it saves a hard problem, and
 * this is not one.
 *
 * ── Nothing here invents a number ───────────────────────────────────────────
 *
 * Every nullable figure from the API renders as an em dash, not a zero. A site
 * that has never been visited shows "—" for average scroll depth, because 0% is
 * a measurement and "not measured" is not. The same for uptime: a site with no
 * checks recorded has no uptime percentage, and printing 100% or 0% would both
 * be inventions.
 */
export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const read = useCallback(async (silent: boolean) => {
    if (!silent) setRefreshing(true);
    try {
      const next = await getAnalyticsOverview();
      setData(next);
      setError(null);
    } catch (cause) {
      // A failed poll must not wipe a dashboard that is already showing good
      // data — the figures are still the last true ones we had.
      if (!silent || !data) {
        setError(
          cause instanceof ApiError
            ? cause.message
            : "Could not load analytics. Check your connection.",
        );
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
    // `data` is read only to decide whether to surface a silent failure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const next = await getAnalyticsOverview();
        if (!cancelled) setData(next);
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof ApiError
              ? cause.message
              : "Could not load analytics. Check your connection.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    /*
     * Polling rather than a WebSocket. This service has no socket layer, and
     * adding one — plus its reconnection, backpressure and fan-out — for a
     * panel somebody has open for a minute at a time is a large amount of
     * infrastructure for a number that changes every few seconds. The interval
     * is cleared on unmount, so a closed modal stops asking.
     */
    timer.current = setInterval(() => void read(true), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, [read]);

  if (loading) {
    return (
      <Frame>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6B7280", fontSize: "13px" }}>
          <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />
          Loading telemetry…
        </div>
      </Frame>
    );
  }

  if (error && !data) {
    return (
      <Frame>
        <div role="alert" style={{ borderRadius: "10px", border: "1px solid #FECACA", backgroundColor: "#FEE2E2", color: "#991B1B", padding: "12px 14px", fontSize: "13px" }}>
          {error}
        </div>
      </Frame>
    );
  }

  if (!data) return <Frame>{null}</Frame>;

  const { kpis } = data;

  return (
    <Frame
      onRefresh={() => void read(false)}
      refreshing={refreshing}
      hostnames={data.hostnames}
    >
      {/*
        Said plainly rather than rendering a grid of zeros. A brand new site has
        no telemetry, and a dashboard full of 0s reads as "broken" rather than
        "nothing has happened yet".
      */}
      {data.empty && (
        <div style={{ borderRadius: "10px", border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", color: "#4B5563", padding: "14px 16px", fontSize: "13px", lineHeight: 1.6 }}>
          No telemetry yet. Figures appear here once your site is published and
          someone visits it — nothing on this page is simulated, so it stays empty
          until there is something real to show.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        <Kpi label="Active right now" value={kpis.activeNow} live={kpis.activeNow > 0} />
        <Kpi label="Visitors · 24h" value={kpis.uniqueVisitors24h} />
        <Kpi label="Visitors · 7d" value={kpis.uniqueVisitors7d} />
        <Kpi label="Page views · 24h" value={kpis.pageViews24h} />
        <Kpi
          label="Avg scroll depth"
          value={kpis.avgScrollPercent}
          suffix="%"
          hint="How far down the page people get, on average"
        />
        <Kpi
          label="Uptime · 7d"
          value={kpis.uptimePercent}
          suffix="%"
          hint={
            kpis.checksRecorded
              ? `${kpis.checksRecorded} checks recorded`
              : "No checks recorded yet"
          }
        />
        <Kpi label="Avg response" value={kpis.avgLatencyMs} suffix=" ms" />
      </div>

      {data.traffic.length > 0 && (
        <Card title="Traffic · last 24 hours">
          <Sparkline points={data.traffic} />
        </Card>
      )}

      {data.scrollFunnel.some((b) => b.reached > 0) && (
        <Card title="How far people read · last 7 days">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.scrollFunnel.map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "#4B5563", width: "140px", flexShrink: 0 }}>
                  {b.label}
                </span>
                <div style={{ flex: 1, height: "22px", backgroundColor: "#F3F4F6", borderRadius: "6px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${b.percent}%`,
                      height: "100%",
                      backgroundColor: "#2563EB",
                      borderRadius: "6px",
                      transition: "width 400ms ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827", width: "68px", textAlign: "right" }}>
                  {b.percent}%
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "10px 0 0 0", lineHeight: 1.5 }}>
            Cumulative — somebody who reached the footer also reached the header.
          </p>
        </Card>
      )}

      {data.topPaths.length > 0 && (
        <Card title="Most read pages · last 7 days">
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.topPaths.map((p) => (
              <div key={p.path} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", fontSize: "12px", padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontFamily: "ui-monospace, monospace", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.path}
                </span>
                <span style={{ color: "#6B7280", flexShrink: 0 }}>
                  {p.views} view{p.views === 1 ? "" : "s"} · {p.avgScrollPercent}% read
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Frame>
  );
}

/* ── Pieces ────────────────────────────────────────────────────────────────── */

function Frame({
  children,
  onRefresh,
  refreshing,
  hostnames,
}: {
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  hostnames?: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
            Live telemetry
          </span>
          <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
            Analytics
          </h1>
          {hostnames && hostnames.length > 0 && (
            <p style={{ fontSize: "12px", color: "#737373", margin: 0, fontFamily: "ui-monospace, monospace" }}>
              {hostnames.join(" · ")}
            </p>
          )}
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#4B5563", padding: "8px 14px", fontSize: "12px", fontWeight: 600, cursor: refreshing ? "default" : "pointer", opacity: refreshing ? 0.6 : 1 }}
          >
            <RefreshCw style={{ width: "13px", height: "13px" }} className={refreshing ? "animate-spin" : undefined} />
            Refresh
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Kpi({
  label,
  value,
  suffix,
  hint,
  live,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  hint?: string;
  live?: boolean;
}) {
  return (
    <div style={{ borderRadius: "12px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "flex", alignItems: "center", gap: "6px" }}>
        {live && <Activity style={{ width: "12px", height: "12px", color: "#16A34A" }} />}
        {label}
      </span>
      <span style={{ fontSize: "26px", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
        {/* An em dash, never 0. "Not measured" and "measured as zero" are
            different facts and a KPI card must not conflate them. */}
        {value === null ? "—" : `${value.toLocaleString()}${suffix ?? ""}`}
      </span>
      {hint && <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{hint}</span>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: "12px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", padding: "18px 20px" }}>
      <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", margin: "0 0 14px 0" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

/**
 * Views per hour, as a filled sparkline.
 *
 * Inline SVG with a viewBox and no fixed width, so it scales with the card
 * rather than needing a resize observer. A single point cannot describe a line,
 * so it is drawn as a flat one at its own value instead of dividing by zero.
 */
function Sparkline({ points }: { points: { at: string; views: number }[] }) {
  const W = 600;
  const H = 120;
  const max = Math.max(...points.map((p) => p.views), 1);
  const step = points.length > 1 ? W / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: points.length > 1 ? i * step : W / 2,
    y: H - (p.views / max) * (H - 12) - 6,
  }));

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  const total = points.reduce((sum, p) => sum + p.views, 0);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "120px", display: "block" }} role="img" aria-label={`${total} page views over the last 24 hours`}>
        <path d={area} fill="#2563EB" fillOpacity="0.08" />
        <path d={line} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {coords.length === 1 && <circle cx={coords[0]!.x} cy={coords[0]!.y} r="3" fill="#2563EB" />}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9CA3AF", marginTop: "6px" }}>
        <span>{points.length > 0 ? new Date(points[0]!.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
        <span>{total.toLocaleString()} views · peak {max}/hr</span>
        <span>now</span>
      </div>
    </div>
  );
}
