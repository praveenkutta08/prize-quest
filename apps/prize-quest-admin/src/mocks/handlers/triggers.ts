import { http, HttpResponse } from "msw";
import type {
  TriggerDefinition,
  TriggerListStats,
  TriggerStatusCounts,
} from "@/features/triggers/model";
import { db } from "../db";
import { resolve, withLatency, maybeFail } from "../latency";

const PAGE_SIZE = 8;

function propertyId(request: Request): string {
  return request.headers.get("X-Property-Id") ?? "all";
}

function scoped(pid: string): TriggerDefinition[] {
  if (pid === "all") return db.triggerDefs;
  return db.triggerDefs.filter((t) => t.propertyIds.includes(pid));
}

function counts(rows: TriggerDefinition[]): TriggerStatusCounts {
  return {
    all: rows.length,
    active: rows.filter((t) => t.status === "active").length,
    draft: rows.filter((t) => t.status === "draft").length,
  };
}

function stats(rows: TriggerDefinition[]): TriggerListStats {
  return {
    boundRules: rows.reduce((s, t) => s + t.boundRuleCount, 0),
    firedToday: rows
      .filter((t) => t.status === "active")
      .reduce((s, t) => s + t.boundRuleCount * 37, 0),
  };
}

function findDef(id: string): TriggerDefinition | undefined {
  return db.triggerDefs.find((t) => t.id === id);
}

function draftFrom(body: Partial<TriggerDefinition>, pid: string): TriggerDefinition {
  const id = body.id ?? `trg-${Date.now().toString(36)}`;
  return {
    id,
    key: body.key ?? `trigger-${id}`,
    label: body.label ?? "Untitled trigger",
    description: body.description ?? "",
    category: body.category ?? "gameplay",
    payloadFields: body.payloadFields ?? [],
    status: "draft",
    boundRuleCount: 0,
    propertyIds:
      body.propertyIds && body.propertyIds.length
        ? body.propertyIds
        : pid === "all"
          ? ["cr-lv", "cr-reno", "cr-tahoe"]
          : [pid],
    updatedAt: new Date().toISOString(),
  };
}

export const triggerAdminHandlers = [
  // List — category/status/q/sort/page, property-scoped, counts + stats.
  http.get("/api/triggers-admin", ({ request }) =>
    resolve("triggers.list", () => {
      const url = new URL(request.url);
      const category = url.searchParams.get("category") ?? "all";
      const status = url.searchParams.get("status") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const page = Math.max(0, Number.parseInt(url.searchParams.get("page") ?? "0", 10) || 0);

      const base = scoped(propertyId(request));
      const c = counts(base);
      const s = stats(base);

      let rows = category === "all" ? base : base.filter((t) => t.category === category);
      if (status !== "all") rows = rows.filter((t) => t.status === status);
      if (q) rows = rows.filter((t) => t.label.toLowerCase().includes(q) || t.key.includes(q));

      const total = rows.length;
      const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      return { rows: pageRows, total, counts: c, stats: s };
    }),
  ),

  // Bound rules — derived from the rules store.
  http.get("/api/triggers-admin/:id/rules", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: rules failed" }, { status: 503 });
    const def = findDef(String(params.id));
    if (!def) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const bound = db.rules
      .filter((r) => r.eventKey === def.key)
      .map((r) => ({ id: r.id, name: r.name, status: r.status }));
    return HttpResponse.json(bound);
  }),

  http.get("/api/triggers-admin/:id", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: get failed" }, { status: 503 });
    const def = findDef(String(params.id));
    if (!def) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    return HttpResponse.json(def);
  }),

  http.post("/api/triggers-admin", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: create failed" }, { status: 503 });
    const body = (await request.json()) as Partial<TriggerDefinition>;
    const draft = draftFrom(body, propertyId(request));
    db.triggerDefs = [draft, ...db.triggerDefs];
    return HttpResponse.json(draft, { status: 201 });
  }),

  http.put("/api/triggers-admin/:id", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: update failed" }, { status: 503 });
    const id = String(params.id);
    const body = (await request.json()) as Partial<TriggerDefinition>;
    const existing = findDef(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = { ...existing, ...body, id, updatedAt: new Date().toISOString() };
    db.triggerDefs = db.triggerDefs.map((t) => (t.id === id ? updated : t));
    return HttpResponse.json(updated);
  }),

  http.patch("/api/triggers-admin/:id/status", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: status failed" }, { status: 503 });
    const id = String(params.id);
    const { status } = (await request.json()) as { status: TriggerDefinition["status"] };
    const existing = findDef(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = { ...existing, status, updatedAt: new Date().toISOString() };
    db.triggerDefs = db.triggerDefs.map((t) => (t.id === id ? updated : t));
    return HttpResponse.json(updated);
  }),
];
