import type { ActivityItem, ClaimsPoint, Kpi, TopCampaignRow } from "@/features/dashboard/model";
import { moneyCompact, signedPercent } from "@/shared/lib/format";

/**
 * Realistic demo data. "all" is the cross-property roll-up; each property is a
 * scaled subset so switching the PropertySwitcher visibly re-scopes every number.
 */
const SCALE: Record<string, number> = {
  "cr-lv": 0.55,
  "cr-reno": 0.28,
  "cr-tahoe": 0.17,
};

const scaleFor = (pid: string) => (pid === "all" ? 1 : (SCALE[pid] ?? 1));

// ---- KPI tiles -------------------------------------------------------------
export function buildKpis(pid: string): Kpi[] {
  const s = scaleFor(pid);
  const active = pid === "all" ? 7 : Math.max(1, Math.round(7 * s));
  const activeDelta = pid === "all" ? 2 : Math.max(1, Math.round(2 * s));
  const players = Math.round(24891 * s);
  const claims = Math.round(387 * s);
  const liability = Math.round(48200 * s);
  const cap = Math.round(72000 * s);
  const pct = Math.round((liability / cap) * 100);

  return [
    {
      key: "active-campaigns",
      label: "Active campaigns",
      value: active,
      format: "plain",
      delta: { value: activeDelta, trend: "up", label: `+${activeDelta} vs last week` },
    },
    {
      key: "players",
      label: "Players this month",
      value: players,
      format: "count",
      delta: { value: 12.5, trend: "up", label: "+12.5% from last month" },
    },
    {
      key: "claims",
      label: "Claims today",
      value: claims,
      format: "count",
      delta: { value: 8.1, trend: "up", label: signedPercent(8.1) + " vs yesterday" },
    },
    {
      key: "liability",
      label: "Liability outstanding",
      value: liability,
      format: "money-compact",
      delta: { value: pct, trend: "neutral", label: `${pct}% of budget cap` },
      progress: {
        pct,
        label: `${moneyCompact(liability)} of ${moneyCompact(cap)} cap`,
      },
    },
  ];
}

// ---- Claims · last 7 days --------------------------------------------------
const CLAIMS_BASE = [45, 61, 58, 71, 95, 120, 87];
const CLAIMS_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function buildClaimsSeries(pid: string): ClaimsPoint[] {
  const s = scaleFor(pid);
  const scaled = CLAIMS_BASE.map((v) => Math.round(v * s));
  const peak = Math.max(...scaled);
  return scaled.map((value, i) => ({
    label: CLAIMS_DAYS[i],
    value,
    highlight: value === peak,
  }));
}

// ---- Recent activity -------------------------------------------------------
const ACTIVITY_BASE: Array<Omit<ActivityItem, "timestamp"> & { minutesAgo: number }> = [
  {
    id: "a1",
    type: "offer",
    title: "Birthday Bonus sent",
    subtitle: "47 players received offers",
    minutesAgo: 2,
  },
  {
    id: "a2",
    type: "rule",
    title: "Rule executed · High Roller Weekly",
    subtitle: "23 players matched",
    minutesAgo: 64,
  },
  {
    id: "a3",
    type: "catalog",
    title: "Catalog updated",
    subtitle: "Summer Splash theme applied",
    minutesAgo: 182,
  },
  {
    id: "a4",
    type: "tier",
    title: "Tier upgrades",
    subtitle: "14 players promoted to Gold",
    minutesAgo: 242,
  },
  {
    id: "a5",
    type: "schedule",
    title: "Campaign scheduled",
    subtitle: "Easter Extravaganza · Apr 1",
    minutesAgo: 1460,
  },
];

export function buildActivity(pid: string): ActivityItem[] {
  const now = Date.now();
  const rows = pid === "all" ? ACTIVITY_BASE : ACTIVITY_BASE.slice(0, 3);
  return rows.map(({ minutesAgo, ...rest }) => ({
    ...rest,
    timestamp: new Date(now - minutesAgo * 60_000).toISOString(),
  }));
}

// ---- Top performing campaigns ---------------------------------------------
interface TopBase {
  id: string;
  name: string;
  subtitle: string;
  sent: number;
  redeemed: number;
  liability: number;
}

const TOP_BASE: TopBase[] = [
  {
    id: "c-sunday-slot",
    name: "Sunday Slot Sprint",
    subtitle: "Gold + Platinum tier",
    sent: 1240,
    redeemed: 892,
    liability: 22300,
  },
  {
    id: "c-birthday",
    name: "Birthday Bonus",
    subtitle: "All players",
    sent: 342,
    redeemed: 298,
    liability: 7400,
  },
  {
    id: "c-comeback",
    name: "Comeback Special",
    subtitle: "Silver+ · inactive 30d",
    sent: 856,
    redeemed: 312,
    liability: 11800,
  },
  {
    id: "c-vip-electronics",
    name: "VIP Electronics Quest",
    subtitle: "Diamond tier",
    sent: 128,
    redeemed: 42,
    liability: 6700,
  },
];

export function buildTopCampaigns(pid: string): TopCampaignRow[] {
  const s = scaleFor(pid);
  return TOP_BASE.map((c) => {
    const sent = Math.max(1, Math.round(c.sent * s));
    const redeemed = Math.max(0, Math.round(c.redeemed * s));
    return {
      id: c.id,
      name: c.name,
      subtitle: c.subtitle,
      sent,
      redeemed,
      rate: sent > 0 ? redeemed / sent : 0,
      liability: Math.round(c.liability * s),
      status: "active" as const,
    };
  });
}

/** Login side-panel figures (roll-up). */
export function buildBrandStats() {
  return {
    activeCampaigns: 7,
    playersThisMonth: 24891,
    claimsToday: 387,
  };
}
