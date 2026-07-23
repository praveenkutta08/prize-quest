import { http, HttpResponse } from "msw";
import type { ConditionGroup } from "@/shared/contracts";
import type { Rule, RuleListStats, RuleStatusCounts } from "@/features/rules/model";
import { db } from "../db";
import { resolve, withLatency, maybeFail } from "../latency";

const PAGE_SIZE = 8;
const DAY_MS = 24 * 60 * 60 * 1000;
const NOW_MS = Date.parse("2026-07-23T16:00:00Z");

function propertyId(request: Request): string {
  return request.headers.get("X-Property-Id") ?? "all";
}

function scoped(pid: string): Rule[] {
  if (pid === "all") return db.rules;
  return db.rules.filter((r) => r.propertyIds.includes(pid));
}

function countByStatus(rows: Rule[]): RuleStatusCounts {
  const by = (s: string) => rows.filter((r) => r.status === s).length;
  return { all: rows.length, active: by("active"), paused: by("paused"), draft: by("draft") };
}

/** Stats derived from the last 24h of (property-scoped) execution logs. */
function buildStats(pid: string, rules: Rule[]): RuleListStats {
  const logs = db.logs.filter(
    (l) => (pid === "all" || l.propertyId === pid) && Date.parse(l.time) >= NOW_MS - DAY_MS,
  );
  const triggeredToday = new Set(logs.map((l) => l.ruleId)).size;
  const playersMatchedToday = logs.reduce((sum, l) => sum + l.matched, 0);
  return {
    totalRules: rules.length,
    activeRules: rules.filter((r) => r.status === "active").length,
    triggeredToday,
    playersMatchedToday,
  };
}

type SortKey = "name" | "status" | "priority" | "trigger";
function sortValue(r: Rule, key: SortKey): string | number {
  switch (key) {
    case "name":
      return r.name.toLowerCase();
    case "status":
      return r.status;
    case "priority":
      return r.priority;
    case "trigger":
      return r.triggerType;
    default:
      return r.name.toLowerCase();
  }
}
function applySort(rows: Rule[], sort: string): Rule[] {
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

/** Deterministic-ish matched count from the conditions. */
function buildTestResult(pid: string, conditions: ConditionGroup): number {
  const pool: Record<string, number> = {
    all: 45200,
    "cr-lv": 24000,
    "cr-reno": 13200,
    "cr-tahoe": 8000,
  };
  let n = pool[pid] ?? 20000;
  let factor = 0.5;
  for (const c of conditions.conditions ?? []) {
    if (c.field === "player.birthday") factor *= 0.03;
    else if (c.field === "player.tier" && Array.isArray(c.value))
      factor *= Math.max(0.2, c.value.length / 5);
    else if (c.field === "player.tierChangedTo" && Array.isArray(c.value)) factor *= 0.04;
    else if (c.field === "player.lastVisitDays") factor *= 0.35;
    else if (c.field === "player.weeklyCoinIn") factor *= 0.06;
    else if (c.field === "player.dayOfWeek" && Array.isArray(c.value)) factor *= c.value.length / 7;
    else if (c.field === "player.segment" && Array.isArray(c.value))
      factor *= Math.max(0.2, c.value.length * 0.25);
  }
  n = conditions.conditions?.length ? n * factor : n * 0.5;
  return Math.max(0, Math.round(n / 10) * 10);
}

function findRule(id: string): Rule | undefined {
  return db.rules.find((r) => r.id === id);
}

function draftFrom(body: Partial<Rule>, pid: string): Rule {
  const id = body.id ?? `rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const propertyIds = body.propertyIds?.length
    ? body.propertyIds
    : pid === "all"
      ? ["cr-lv", "cr-reno", "cr-tahoe"]
      : [pid];
  return {
    id,
    name: body.name ?? "Untitled rule",
    description: body.description,
    triggerType: body.triggerType ?? "scheduled",
    cron: body.cron,
    eventKey: body.eventKey,
    priority: body.priority ?? 5,
    conditions: body.conditions ?? { conjunction: "AND", conditions: [] },
    action: body.action ?? { type: "send-offer" },
    status: "draft",
    propertyIds,
  };
}

export const ruleHandlers = [
  http.get("/api/rules", ({ request }) =>
    resolve("rules.list", () => {
      const url = new URL(request.url);
      // `all=1` returns the whole (scoped) set unpaginated — for filter dropdowns.
      if (url.searchParams.get("all") === "1") {
        const base = scoped(propertyId(request));
        return {
          rows: base,
          total: base.length,
          counts: countByStatus(base),
          stats: buildStats(propertyId(request), base),
        };
      }
      const status = url.searchParams.get("status") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const sort = url.searchParams.get("sort") ?? "";
      const page = Math.max(0, Number.parseInt(url.searchParams.get("page") ?? "0", 10) || 0);

      const base = scoped(propertyId(request));
      const counts = countByStatus(base);
      const stats = buildStats(propertyId(request), base);

      let rows = status === "all" ? base : base.filter((r) => r.status === status);
      if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q));
      rows = applySort(rows, sort);

      const total = rows.length;
      const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      return { rows: pageRows, total, counts, stats };
    }),
  ),

  // DERIVED from the Session 9 trigger store: active defs → { key, label, description }.
  // The EventSelector consumes this projection; one store, no fork.
  http.get("/api/triggers", () =>
    resolve("rules.triggers", () =>
      db.triggerDefs
        .filter((t) => t.status === "active")
        .map((t) => ({ key: t.key, label: t.label, description: t.description })),
    ),
  ),

  http.post("/api/rules/test", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: test failed" }, { status: 503 });
    const body = (await request.json()) as { conditions: ConditionGroup };
    return HttpResponse.json({
      matchedPlayers: buildTestResult(propertyId(request), body.conditions),
    });
  }),

  http.get("/api/rules/:id", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: get failed" }, { status: 503 });
    const rule = findRule(String(params.id));
    if (!rule) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    return HttpResponse.json(rule);
  }),

  http.post("/api/rules", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: create failed" }, { status: 503 });
    const body = (await request.json()) as Partial<Rule>;
    const draft = draftFrom(body, propertyId(request));
    db.rules = [draft, ...db.rules];
    return HttpResponse.json(draft, { status: 201 });
  }),

  http.put("/api/rules/:id", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: update failed" }, { status: 503 });
    const id = String(params.id);
    const body = (await request.json()) as Partial<Rule>;
    const existing = findRule(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated: Rule = { ...existing, ...body, id };
    db.rules = db.rules.map((r) => (r.id === id ? updated : r));
    return HttpResponse.json(updated);
  }),

  http.patch("/api/rules/:id/status", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: status failed" }, { status: 503 });
    const id = String(params.id);
    const { status } = (await request.json()) as { status: Rule["status"] };
    const existing = findRule(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = { ...existing, status };
    db.rules = db.rules.map((r) => (r.id === id ? updated : r));
    return HttpResponse.json(updated);
  }),
];
