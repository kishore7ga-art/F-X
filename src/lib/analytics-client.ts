"use client";

import { api } from "@/lib/api-client";

/**
 * Telemetry, as the dashboard reads it.
 *
 * Every nullable field here is nullable for one reason: nothing has been
 * measured yet. `avgScrollPercent: null` is not "0%", and `uptimePercent: null`
 * is not "0% uptime" — rendering either as a number would put a confident
 * figure on screen for a site nobody has visited. The UI branches on null.
 */

export type Kpis = {
  activeNow: number;
  uniqueVisitors24h: number;
  uniqueVisitors7d: number;
  pageViews24h: number;
  avgScrollPercent: number | null;
  uptimePercent: number | null;
  avgLatencyMs: number | null;
  checksRecorded: number;
};

export type TrafficPoint = { at: string; views: number; sessions: number };
export type ScrollBucket = { label: string; reached: number; percent: number };
export type TopPath = { path: string; views: number; avgScrollPercent: number };

export type AnalyticsOverview = {
  kpis: Kpis;
  traffic: TrafficPoint[];
  scrollFunnel: ScrollBucket[];
  topPaths: TopPath[];
  hostnames: string[];
  firstSeenAt: string | null;
  /** True when no telemetry exists at all — the UI explains instead of showing zeros. */
  empty: boolean;
};

export const getAnalyticsOverview = () =>
  api<AnalyticsOverview>("/api/v1/analytics/overview");

/** How often the dashboard re-reads while it is open. */
export const POLL_INTERVAL_MS = 20_000;
