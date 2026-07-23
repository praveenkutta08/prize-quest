import { http } from "msw";
import type { Breakdown, ReportKpi, TimeSeriesPoint } from "@/features/reports/model";
import { db } from "../db";
import { resolve } from "../latency";

/**
 * Deterministic report data — synthesized from an index/seed (sine-ish curve +
 * per-property offset) with NO `Math.random`, so charts are stable across
 * reloads and vary sensibly per range / property / segment.
 */

function propertyId(request: Request): string {
  return request.headers.get("X-Property-Id") ?? "all";
}

function propertyOffset(pid: string): number {
  const map: Record<string, number> = { all: 1, "cr-lv": 0.62, "cr-reno": 0.34, "cr-tahoe": 0.22 };
  return map[pid] ?? 0.5;
}

function segmentFactor(segment: string): number {
  const map: Record<string, number> = {
    all: 1,
    vip: 0.28,
    "high-roller": 0.42,
    regular: 0.7,
    new: 0.55,
    "at-risk": 0.4,
    dormant: 0.25,
  };
  return map[segment] ?? 1;
}

function bucketCount(range: string): number {
  if (range === "24h") return 12;
  if (range === "7d") return 7;
  return 15;
}

function bucketLabel(range: string, i: number, n: number): string {
  if (range === "24h") return `${(i * 2).toString().padStart(2, "0")}:00`;
  if (range === "7d") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] ?? `D${i}`;
  return `W${Math.floor((i / n) * 13) + 1}`;
}

function series(base: number, pid: string, segment: string, range: string): TimeSeriesPoint[] {
  const n = bucketCount(range);
  const off = propertyOffset(pid) * segmentFactor(segment);
  return Array.from({ length: n }, (_, i) => {
    const wave = 0.6 + 0.4 * Math.sin((i / n) * Math.PI * 2 + off * 3);
    const drift = 0.85 + (i / n) * 0.3;
    return { date: bucketLabel(range, i, n), value: Math.round(base * off * wave * drift) };
  });
}

function kpis(pid: string, segment: string): ReportKpi[] {
  const off = propertyOffset(pid) * segmentFactor(segment);
  return [
    {
      key: "activePlayers",
      label: "Active players",
      value: Math.round(24800 * off),
      format: "number",
      delta: 8.4,
      trend: "up",
    },
    {
      key: "engagement",
      label: "Engagement rate",
      value: 0.372,
      format: "percent",
      delta: 2.1,
      trend: "up",
    },
    {
      key: "redemptions",
      label: "Redemptions",
      value: Math.round(9200 * off),
      format: "number",
      delta: -1.3,
      trend: "down",
    },
    {
      key: "revenueImpact",
      label: "Revenue impact",
      value: Math.round(486000 * off),
      format: "currency",
      delta: 12.5,
      trend: "up",
    },
    {
      key: "avgOfferValue",
      label: "Avg offer value",
      value: Math.round(142 * (0.9 + off * 0.2)),
      format: "currency",
      delta: 0.4,
      trend: "neutral",
    },
  ];
}

export const reportHandlers = [
  http.get("/api/reports/overview", ({ request }) =>
    resolve("reports.overview", () => {
      const url = new URL(request.url);
      const range = url.searchParams.get("range") ?? "30d";
      const segment = url.searchParams.get("segment") ?? "all";
      const pid = propertyId(request);
      const off = propertyOffset(pid) * segmentFactor(segment);
      const eligible = Math.round(42000 * off);
      return {
        kpis: kpis(pid, segment),
        engagement: series(1400, pid, segment, range),
        redemptions: series(760, pid, segment, range),
        funnel: {
          eligible,
          started: Math.round(eligible * 0.46),
          completed: Math.round(eligible * 0.24),
          claimed: Math.round(eligible * 0.18),
        },
      };
    }),
  ),

  http.get("/api/reports/campaigns", ({ request }) =>
    resolve("reports.campaigns", () => {
      const url = new URL(request.url);
      const segment = url.searchParams.get("segment") ?? "all";
      const pid = propertyId(request);
      const off = propertyOffset(pid) * segmentFactor(segment);
      const rows = db.campaigns.slice(0, 6).map((c, i) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        reach: Math.round(c.metrics.reach * off),
        offers: c.metrics.offers,
        redemptions: Math.round(c.metrics.funnel.claimed * off),
        engagementRate: c.metrics.engagementRate,
        revenueImpact: Math.round(c.metrics.reach * c.metrics.engagementRate * 6 * off) + i * 1000,
      }));
      const comparison: Breakdown[] = rows.map((r) => ({
        label: r.name.split(" ")[0],
        value: r.redemptions,
      }));
      return { rows, comparison };
    }),
  ),

  http.get("/api/reports/players", ({ request }) =>
    resolve("reports.players", () => {
      const off = propertyOffset(propertyId(request));
      const scale = (n: number) => Math.round(n * off);
      return {
        tierDistribution: [
          { label: "Silver", value: scale(9800) },
          { label: "Gold", value: scale(6200) },
          { label: "Platinum", value: scale(2400) },
          { label: "Diamond", value: scale(760) },
        ],
        ltvBands: [
          { label: "<$5K", value: scale(8400) },
          { label: "$5–20K", value: scale(6100) },
          { label: "$20–50K", value: scale(3200) },
          { label: "$50K+", value: scale(1100) },
        ],
        segments: [
          { label: "VIP", value: scale(1200) },
          { label: "High-roller", value: scale(1800) },
          { label: "Regular", value: scale(9400) },
          { label: "New", value: scale(3600) },
          { label: "At-risk", value: scale(2100) },
          { label: "Dormant", value: scale(1700) },
        ],
      };
    }),
  ),

  http.get("/api/reports/rewards", ({ request }) =>
    resolve("reports.rewards", () => {
      const off = propertyOffset(propertyId(request));
      const scale = (n: number) => Math.round(n * off);
      return {
        topRedeemed: [
          { label: "$50 Free Play", value: scale(2940) },
          { label: "$100 Amazon", value: scale(1180) },
          { label: "5,000 Points", value: scale(1523) },
          { label: "$50 Dining", value: scale(803) },
          { label: "$250 Free Play", value: scale(610) },
        ],
        categoryBreakdown: [
          { label: "Free play", value: scale(3550) },
          { label: "Gift card", value: scale(1983) },
          { label: "Electronics", value: scale(723) },
          { label: "Comp", value: scale(437) },
          { label: "Experience", value: scale(183) },
        ],
      };
    }),
  ),
];
