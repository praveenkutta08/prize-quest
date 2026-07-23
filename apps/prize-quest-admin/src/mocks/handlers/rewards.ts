import { http, HttpResponse } from "msw";
import type {
  RewardItem,
  RewardListStats,
  RewardStatusCounts,
  RewardUsageRef,
} from "@/features/rewards/model";
import { deriveMargin } from "@/features/rewards/model";
import { db } from "../db";
import { resolve, withLatency, maybeFail } from "../latency";
import { buildCategoryInfo } from "../seed/rewards";

const PAGE_SIZE = 8;

/** Active property from the scoping header; absent → cross-property roll-up. */
function propertyId(request: Request): string {
  return request.headers.get("X-Property-Id") ?? "all";
}

/** Rewards visible for a property (roll-up shows every property). */
function scoped(pid: string): RewardItem[] {
  if (pid === "all") return db.rewards;
  return db.rewards.filter((r) => r.propertyIds.includes(pid));
}

function isLowStock(r: RewardItem): boolean {
  return r.lowStockThreshold !== undefined && r.stockCount <= r.lowStockThreshold;
}

function countByStatus(rows: RewardItem[]): RewardStatusCounts {
  const by = (s: string) => rows.filter((r) => r.status === s).length;
  return {
    all: rows.length,
    active: by("active"),
    draft: by("draft"),
    "out-of-stock": by("out-of-stock"),
  };
}

function buildStats(rows: RewardItem[]): RewardListStats {
  return {
    totalItems: rows.length,
    activeItems: rows.filter((r) => r.status === "active").length,
    lowStock: rows.filter(isLowStock).length,
    redemptionsThisMonth: Math.round(rows.reduce((sum, r) => sum + r.redemptionCount, 0) * 0.14),
  };
}

type SortKey =
  | "name"
  | "category"
  | "rewardType"
  | "value"
  | "cost"
  | "marginPct"
  | "stockCount"
  | "redemptionCount"
  | "status";

function sortValue(r: RewardItem, key: SortKey): string | number {
  switch (key) {
    case "name":
      return r.name.toLowerCase();
    case "category":
      return r.category;
    case "rewardType":
      return r.rewardType;
    case "value":
      return r.value;
    case "cost":
      return r.cost;
    case "marginPct":
      return r.marginPct;
    case "stockCount":
      return r.stockCount;
    case "redemptionCount":
      return r.redemptionCount;
    case "status":
      return r.status;
    default:
      return r.name.toLowerCase();
  }
}

function applySort(rows: RewardItem[], sort: string): RewardItem[] {
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

/** Prize-catalog id → reward id, so "Used by" derives from the real promotions seed. */
const PRIZE_TO_REWARD: Record<string, string> = {
  "pz-airpods": "rw-airpods",
  "pz-yeti": "rw-yeti",
  "pz-amazon100": "rw-amazon100",
  "pz-beats": "rw-beats",
  "pz-galaxytab": "rw-galaxytab",
  "pz-dining50": "rw-dining50",
  "pz-rayban": "rw-rayban",
  "pz-bose": "rw-bose",
  "pz-freeplay250": "rw-freeplay250",
  "pz-applewatch": "rw-applewatch",
  "pz-weekend": "rw-suite",
};

/** Campaigns referencing a reward (via the prize→reward mapping). */
function usageFor(rewardId: string): RewardUsageRef[] {
  return db.campaigns
    .filter((c) => c.prizeIds.some((pid) => PRIZE_TO_REWARD[pid] === rewardId))
    .map((c) => ({ campaignId: c.id, name: c.name }));
}

function findReward(id: string): RewardItem | undefined {
  return db.rewards.find((r) => r.id === id);
}

/** Recompute derived fields (`marginPct`, `inStock`, status auto-out-of-stock). */
function normalize(r: RewardItem): RewardItem {
  const inStock = r.stockCount > 0;
  const status =
    !inStock && r.status === "active"
      ? "out-of-stock"
      : inStock && r.status === "out-of-stock"
        ? "active"
        : r.status;
  return { ...r, inStock, status, marginPct: deriveMargin(r.value, r.cost) };
}

/** A blank draft merged with whatever the form has posted so far. */
function draftFrom(body: Partial<RewardItem>, pid: string): RewardItem {
  const id = body.id ?? `rw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const propertyIds =
    body.propertyIds && body.propertyIds.length
      ? body.propertyIds
      : pid === "all"
        ? ["cr-lv", "cr-reno", "cr-tahoe"]
        : [pid];
  return normalize({
    id,
    name: body.name ?? "Untitled reward",
    description: body.description,
    category: body.category ?? "electronics",
    rewardType: body.rewardType ?? "physical",
    value: body.value ?? 0,
    cost: body.cost ?? 0,
    marginPct: 0,
    stockCount: body.stockCount ?? 0,
    inStock: false,
    lowStockThreshold: body.lowStockThreshold,
    vendorId: body.vendorId,
    vendorSku: body.vendorSku,
    fulfillmentMethod: body.fulfillmentMethod ?? "ship",
    rarity: body.rarity ?? "common",
    status: "draft",
    imageRef: body.imageRef,
    redemptionCount: 0,
    propertyIds,
    updatedAt: new Date().toISOString(),
  });
}

export const rewardHandlers = [
  // Vendors (read-only lookup) — before /rewards to avoid any capture ambiguity.
  http.get("/api/vendors", () => resolve("vendors.list", () => db.vendors)),

  http.get("/api/reward-categories", ({ request }) =>
    resolve("reward-categories.list", () => buildCategoryInfo(scoped(propertyId(request)))),
  ),

  // Sync — must precede /:id so it isn't captured as an id. Mutates the db.
  http.post("/api/rewards/sync", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: sync failed" }, { status: 503 });
    const pid = propertyId(request);
    const now = new Date().toISOString();
    const stamp = Date.now().toString(36);
    // Add a couple of new items from the "vendor pull"…
    const added: RewardItem[] = [
      normalize({
        id: `rw-sync-${stamp}-1`,
        name: "Sony WH-1000XM5",
        description: "Pulled from Brand Partners — premium noise-cancelling headphones.",
        category: "electronics",
        rewardType: "physical",
        value: 399,
        cost: 298,
        marginPct: 0,
        stockCount: 20,
        inStock: true,
        lowStockThreshold: 10,
        vendorId: "v-brandpartners",
        vendorSku: "SNY-XM5",
        fulfillmentMethod: "ship",
        rarity: "rare",
        status: "active",
        imageRef: undefined,
        redemptionCount: 0,
        propertyIds: pid === "all" ? ["cr-lv", "cr-reno", "cr-tahoe"] : [pid],
        updatedAt: now,
      }),
      normalize({
        id: `rw-sync-${stamp}-2`,
        name: "$25 Dining Credit",
        description: "Pulled from the vendor feed — entry-level dining reward.",
        category: "gift-card",
        rewardType: "digital",
        value: 25,
        cost: 25,
        marginPct: 0,
        stockCount: 999,
        inStock: true,
        lowStockThreshold: 50,
        fulfillmentMethod: "auto",
        rarity: "common",
        status: "active",
        imageRef: undefined,
        redemptionCount: 0,
        propertyIds: pid === "all" ? ["cr-lv", "cr-reno", "cr-tahoe"] : [pid],
        updatedAt: now,
      }),
    ];
    db.rewards = [...added, ...db.rewards];
    // …and bump stock / updatedAt on a few existing items.
    let updated = 0;
    db.rewards = db.rewards.map((r) => {
      if (updated < 3 && r.status === "active" && !r.id.startsWith("rw-sync")) {
        updated += 1;
        return normalize({ ...r, stockCount: r.stockCount + 25, updatedAt: now });
      }
      return r;
    });
    return HttpResponse.json({ added: added.length, updated, skipped: 2, at: now });
  }),

  // List — status/category/type/q/sort/page, property-scoped, with counts + stats.
  http.get("/api/rewards", ({ request }) =>
    resolve("rewards.list", () => {
      const url = new URL(request.url);
      const status = url.searchParams.get("status") ?? "all";
      const category = url.searchParams.get("category") ?? "all";
      const type = url.searchParams.get("type") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const sort = url.searchParams.get("sort") ?? "";
      const page = Math.max(0, Number.parseInt(url.searchParams.get("page") ?? "0", 10) || 0);

      const base = scoped(propertyId(request));
      const counts = countByStatus(base);
      const stats = buildStats(base);

      let rows = status === "all" ? base : base.filter((r) => r.status === status);
      if (category !== "all") rows = rows.filter((r) => r.category === category);
      if (type !== "all") rows = rows.filter((r) => r.rewardType === type);
      if (q) {
        rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.category.includes(q));
      }
      rows = applySort(rows, sort);

      const total = rows.length;
      const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      return { rows: pageRows, total, counts, stats };
    }),
  ),

  // Detail (+ usage: campaigns referencing it)
  http.get("/api/rewards/:id", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: get failed" }, { status: 503 });
    const found = findReward(String(params.id));
    if (!found) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    return HttpResponse.json({ ...found, usage: usageFor(found.id) });
  }),

  // Create draft
  http.post("/api/rewards", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: create failed" }, { status: 503 });
    const body = (await request.json()) as Partial<RewardItem>;
    const draft = draftFrom(body, propertyId(request));
    db.rewards = [draft, ...db.rewards];
    return HttpResponse.json(draft, { status: 201 });
  }),

  // Full update (autosave)
  http.put("/api/rewards/:id", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: update failed" }, { status: 503 });
    const id = String(params.id);
    const body = (await request.json()) as Partial<RewardItem>;
    const existing = findReward(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = normalize({ ...existing, ...body, id, updatedAt: new Date().toISOString() });
    db.rewards = db.rewards.map((r) => (r.id === id ? updated : r));
    return HttpResponse.json(updated);
  }),

  // Status transition (activate / archive / out-of-stock)
  http.patch("/api/rewards/:id/status", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: status failed" }, { status: 503 });
    const id = String(params.id);
    const { status } = (await request.json()) as { status: RewardItem["status"] };
    const existing = findReward(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = { ...existing, status, updatedAt: new Date().toISOString() };
    db.rewards = db.rewards.map((r) => (r.id === id ? updated : r));
    return HttpResponse.json(updated);
  }),
];
