import { http, HttpResponse } from "msw";
import type {
  CampaignDefinition,
  CampaignListStats,
  CampaignStatusCounts,
  ConditionGroup,
} from "@/features/promotions/model";
import { db } from "../db";
import { resolve, withLatency, maybeFail } from "../latency";

const PAGE_SIZE = 8;

/** Active property from the scoping header; absent → cross-property roll-up. */
function propertyId(request: Request): string {
  return request.headers.get("X-Property-Id") ?? "all";
}

/** Campaigns visible for a property (roll-up shows every property). */
function scoped(pid: string): CampaignDefinition[] {
  if (pid === "all") return db.campaigns;
  return db.campaigns.filter((c) => c.propertyIds.includes(pid));
}

function countByStatus(rows: CampaignDefinition[]): CampaignStatusCounts {
  const by = (s: string) => rows.filter((c) => c.status === s).length;
  return {
    all: rows.length,
    active: by("active"),
    scheduled: by("scheduled"),
    draft: by("draft"),
    ended: by("ended"),
  };
}

/** Aggregate stat tiles, computed over the property-scoped set (unfiltered). */
function buildStats(rows: CampaignDefinition[]): CampaignListStats {
  const active = rows.filter((c) => c.status === "active");
  const totalReach = rows.reduce((sum, c) => sum + c.metrics.reach, 0);
  const engaged = rows.filter((c) => c.metrics.engagementRate > 0);
  const avgEngagement =
    engaged.length === 0
      ? 0
      : engaged.reduce((sum, c) => sum + c.metrics.engagementRate, 0) / engaged.length;
  const revenueImpact = Math.round(
    rows.reduce((sum, c) => sum + c.metrics.reach * c.metrics.engagementRate, 0) * 6,
  );
  return { activeCampaigns: active.length, totalReach, avgEngagement, revenueImpact };
}

type SortKey = "name" | "status" | "schedule" | "audience" | "offers" | "reach" | "engagement";

function sortValue(c: CampaignDefinition, key: SortKey): string | number {
  switch (key) {
    case "name":
      return c.name.toLowerCase();
    case "status":
      return c.status;
    case "schedule":
      return c.schedule.start;
    case "audience":
      return c.audienceLabel.toLowerCase();
    case "offers":
      return c.metrics.offers;
    case "reach":
      return c.metrics.reach;
    case "engagement":
      return c.metrics.engagementRate;
    default:
      return c.name.toLowerCase();
  }
}

function applySort(rows: CampaignDefinition[], sort: string): CampaignDefinition[] {
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

/** Deterministic-ish reach: property pool reduced per eligibility constraint. */
function buildPreviewReach(pid: string, eligibility: ConditionGroup) {
  const pool: Record<string, number> = {
    all: 45200,
    "cr-lv": 24000,
    "cr-reno": 13200,
    "cr-tahoe": 8000,
  };
  const ofEligible = pool[pid] ?? 20000;
  let factor = 0.72; // base engagement of the eligible pool
  for (const cond of eligibility.conditions ?? []) {
    if (cond.field === "player.tier" && Array.isArray(cond.value)) {
      factor *= Math.max(0.2, cond.value.length / 4);
    } else if (cond.field === "player.segment" && Array.isArray(cond.value)) {
      factor *= Math.max(0.25, cond.value.length * 0.28);
    } else if (cond.field === "player.property" && Array.isArray(cond.value)) {
      factor *= Math.min(1, Math.max(0.34, cond.value.length / 3));
    } else if (cond.field === "player.age") {
      factor *= cond.operator === "between" ? 0.62 : 0.86;
    } else if (cond.field === "player.lastVisitDays") {
      factor *= 0.7;
    } else if (cond.field === "player.birthday") {
      factor *= 0.08;
    }
  }
  const matchedPlayers = Math.max(0, Math.round((ofEligible * factor) / 10) * 10);
  return { matchedPlayers, ofEligible };
}

function findCampaign(id: string): CampaignDefinition | undefined {
  return db.campaigns.find((c) => c.id === id);
}

/** A blank draft merged with whatever the form has posted so far. */
function draftFrom(body: Partial<CampaignDefinition>, pid: string): CampaignDefinition {
  const id = body.id ?? `cmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const propertyIds =
    body.propertyIds && body.propertyIds.length
      ? body.propertyIds
      : pid === "all"
        ? ["cr-lv", "cr-reno", "cr-tahoe"]
        : [pid];
  return {
    id,
    name: body.name ?? "Untitled campaign",
    type: body.type ?? "goal-based",
    status: "draft",
    description: body.description,
    ownerId: body.ownerId ?? "u-james-chen",
    audienceLabel: body.audienceLabel ?? "All players",
    schedule: body.schedule ?? { start: "", end: "", recurrence: "one-shot" },
    eligibility: body.eligibility ?? { conjunction: "AND", conditions: [] },
    earnRule: body.earnRule ?? {
      activity: "slot-wager",
      threshold: 0,
      currency: "USD",
      countsToward: "coin-in",
    },
    prizeIds: body.prizeIds ?? [],
    propertyIds,
    compliance: body.compliance ?? { budgetCap: 0, budgetUsed: 0, jurisdiction: "NV" },
    metrics: body.metrics ?? {
      reach: 0,
      offers: (body.prizeIds ?? []).length,
      engagementRate: 0,
      funnel: { eligible: 0, started: 0, completed: 0, claimed: 0 },
    },
  };
}

export const promotionHandlers = [
  // List — status/q/sort/page filtered, property-scoped, with per-tab counts.
  http.get("/api/campaigns", ({ request }) =>
    resolve("campaigns.list", () => {
      const url = new URL(request.url);
      const status = url.searchParams.get("status") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const sort = url.searchParams.get("sort") ?? "";
      const page = Math.max(0, Number.parseInt(url.searchParams.get("page") ?? "0", 10) || 0);

      const base = scoped(propertyId(request));
      const counts = countByStatus(base);
      const stats = buildStats(base);

      let rows = status === "all" ? base : base.filter((c) => c.status === status);
      if (q) {
        rows = rows.filter(
          (c) => c.name.toLowerCase().includes(q) || c.audienceLabel.toLowerCase().includes(q),
        );
      }
      rows = applySort(rows, sort);

      const total = rows.length;
      const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      return { rows: pageRows, total, counts, stats };
    }),
  ),

  // Preview reach — must precede the /:id route so it isn't captured as an id.
  http.post("/api/campaigns/preview-reach", async ({ request }) => {
    await withLatency();
    if (maybeFail())
      return HttpResponse.json({ error: "mock: preview-reach failed" }, { status: 503 });
    const body = (await request.json()) as { eligibility: ConditionGroup };
    return HttpResponse.json(buildPreviewReach(propertyId(request), body.eligibility));
  }),

  // Detail
  http.get("/api/campaigns/:id", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: get failed" }, { status: 503 });
    const campaign = findCampaign(String(params.id));
    if (!campaign) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    return HttpResponse.json(campaign);
  }),

  // Create draft
  http.post("/api/campaigns", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: create failed" }, { status: 503 });
    const body = (await request.json()) as Partial<CampaignDefinition>;
    const draft = draftFrom(body, propertyId(request));
    db.campaigns = [draft, ...db.campaigns];
    return HttpResponse.json(draft, { status: 201 });
  }),

  // Full update (autosave)
  http.put("/api/campaigns/:id", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: update failed" }, { status: 503 });
    const id = String(params.id);
    const body = (await request.json()) as Partial<CampaignDefinition>;
    const existing = findCampaign(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated: CampaignDefinition = {
      ...existing,
      ...body,
      id,
      metrics: {
        ...existing.metrics,
        ...body.metrics,
        offers: (body.prizeIds ?? existing.prizeIds).length,
      },
    };
    db.campaigns = db.campaigns.map((c) => (c.id === id ? updated : c));
    return HttpResponse.json(updated);
  }),

  // Status transition (activate / pause / end)
  http.patch("/api/campaigns/:id/status", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: status failed" }, { status: 503 });
    const id = String(params.id);
    const { status } = (await request.json()) as { status: CampaignDefinition["status"] };
    const existing = findCampaign(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = { ...existing, status };
    db.campaigns = db.campaigns.map((c) => (c.id === id ? updated : c));
    return HttpResponse.json(updated);
  }),

  // Prize catalog (q / category filtered)
  http.get("/api/catalog/prizes", ({ request }) =>
    resolve("catalog.prizes", () => {
      const url = new URL(request.url);
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const category = url.searchParams.get("category") ?? "";
      return db.prizes.filter(
        (p) =>
          (!q || p.name.toLowerCase().includes(q)) &&
          (!category || category === "all" || p.category === category),
      );
    }),
  ),
];
