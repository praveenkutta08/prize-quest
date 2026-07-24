import { http, HttpResponse } from "msw";
import type { Player, PlayerListStats, PlayerSegmentCounts } from "@/features/players/model";
import { db } from "../db";
import { resolve, withLatency, maybeFail } from "../latency";
import { buildActivity, buildCampaignRefs, buildRewards } from "../seed/players";

const PAGE_SIZE = 10;
const ACTIVITY_PAGE = 8;

function propertyId(request: Request): string {
  return request.headers.get("X-Property-Id") ?? "all";
}

function scoped(pid: string): Player[] {
  if (pid === "all") return db.players;
  return db.players.filter((p) => p.propertyId === pid);
}

function countBySegment(rows: Player[]): PlayerSegmentCounts {
  const by = (s: string) => rows.filter((p) => p.segment === s).length;
  return {
    all: rows.length,
    vip: by("vip"),
    "high-roller": by("high-roller"),
    regular: by("regular"),
    new: by("new"),
    "at-risk": by("at-risk"),
    dormant: by("dormant"),
  };
}

function buildStats(rows: Player[]): PlayerListStats {
  const activeThisMonth = rows.filter((p) => p.lastVisitDays <= 30 && p.status === "active").length;
  const avgLifetimeValue =
    rows.length === 0 ? 0 : Math.round(rows.reduce((s, p) => s + p.lifetimeValue, 0) / rows.length);
  return {
    totalPlayers: rows.length,
    activeThisMonth,
    avgLifetimeValue,
    atRisk: rows.filter((p) => p.segment === "at-risk").length,
  };
}

type SortKey =
  | "name"
  | "tier"
  | "segment"
  | "propertyId"
  | "lifetimeValue"
  | "pointsBalance"
  | "lastVisitDays"
  | "status";
const TIER_ORDER: Record<string, number> = { Silver: 0, Gold: 1, Platinum: 2, Diamond: 3 };

function sortValue(p: Player, key: SortKey): string | number {
  switch (key) {
    case "name":
      return p.name.toLowerCase();
    case "tier":
      return TIER_ORDER[p.tier] ?? 0;
    case "segment":
      return p.segment;
    case "propertyId":
      return p.propertyId;
    case "lifetimeValue":
      return p.lifetimeValue;
    case "pointsBalance":
      return p.pointsBalance;
    case "lastVisitDays":
      return p.lastVisitDays;
    case "status":
      return p.status;
    default:
      return p.name.toLowerCase();
  }
}

function applySort(rows: Player[], sort: string): Player[] {
  if (!sort) return rows;
  const desc = sort.startsWith("-");
  const key = sort.replace(/^-/, "") as SortKey;
  return [...rows].sort((a, b) => {
    const av = sortValue(a, key);
    const bv = sortValue(b, key);
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return desc ? -cmp : cmp;
  });
}

function findPlayer(id: string): Player | undefined {
  return db.players.find((p) => p.id === id);
}
function seedIndexOf(p: Player): number {
  return Number.parseInt(p.id.replace("pl-", ""), 10) - 1;
}

export const playerHandlers = [
  // List — segment/tier/status/q/sort/page, property-scoped, with counts + stats.
  http.get("/api/players", ({ request }) =>
    resolve("players.list", () => {
      const url = new URL(request.url);
      const segment = url.searchParams.get("segment") ?? "all";
      const tier = url.searchParams.get("tier") ?? "all";
      const status = url.searchParams.get("status") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const sort = url.searchParams.get("sort") ?? "";
      const page = Math.max(0, Number.parseInt(url.searchParams.get("page") ?? "0", 10) || 0);

      const base = scoped(propertyId(request));
      const counts = countBySegment(base);
      const stats = buildStats(base);

      let rows = segment === "all" ? base : base.filter((p) => p.segment === segment);
      if (tier !== "all") rows = rows.filter((p) => p.tier === tier);
      if (status !== "all") rows = rows.filter((p) => p.status === status);
      if (q) {
        rows = rows.filter(
          (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q),
        );
      }
      rows = applySort(rows, sort);

      const total = rows.length;
      const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      return { rows: pageRows, total, counts, stats };
    }),
  ),

  // Segments
  http.get("/api/segments", () => resolve("players.segments", () => db.segments)),

  // Activity — cursor-paginated, most-recent first
  http.get("/api/players/:id/activity", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: activity failed" }, { status: 503 });
    const id = String(params.id);
    const player = findPlayer(id);
    if (!player) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const url = new URL(request.url);
    const cursor = Math.max(0, Number.parseInt(url.searchParams.get("cursor") ?? "0", 10) || 0);
    const all = buildActivity(id, seedIndexOf(player));
    const rows = all.slice(cursor, cursor + ACTIVITY_PAGE);
    const next = cursor + ACTIVITY_PAGE;
    return HttpResponse.json({
      rows,
      nextCursor: next < all.length ? String(next) : undefined,
    });
  }),

  http.get("/api/players/:id/rewards", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: rewards failed" }, { status: 503 });
    const player = findPlayer(String(params.id));
    if (!player) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    return HttpResponse.json(buildRewards(seedIndexOf(player)));
  }),

  http.get("/api/players/:id/campaigns", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: campaigns failed" }, { status: 503 });
    const player = findPlayer(String(params.id));
    if (!player) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    return HttpResponse.json(buildCampaignRefs(seedIndexOf(player)));
  }),

  // Detail
  http.get("/api/players/:id", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: get failed" }, { status: 503 });
    const player = findPlayer(String(params.id));
    if (!player) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    return HttpResponse.json(player);
  }),

  // Adjust points (RBAC-gated on client) — mutates balance
  http.post("/api/players/:id/points", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: adjust failed" }, { status: 503 });
    const id = String(params.id);
    const { delta } = (await request.json()) as { delta: number; reason: string };
    const player = findPlayer(id);
    if (!player) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated: Player = { ...player, pointsBalance: Math.max(0, player.pointsBalance + delta) };
    db.players = db.players.map((p) => (p.id === id ? updated : p));
    return HttpResponse.json(updated);
  }),
];
