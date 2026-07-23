import { http, HttpResponse } from "msw";
import type { BulkAction, FulfillmentCounts, FulfillmentOrder } from "@/features/fulfillment/model";
import { db } from "../db";
import { resolve, withLatency, maybeFail } from "../latency";

const PAGE_SIZE = 10;

function propertyId(request: Request): string {
  return request.headers.get("X-Property-Id") ?? "all";
}

function scoped(pid: string): FulfillmentOrder[] {
  if (pid === "all") return db.fulfillment;
  return db.fulfillment.filter((o) => o.propertyId === pid);
}

function isToday(iso: string): boolean {
  const NOW = Date.UTC(2026, 6, 23, 12, 0, 0);
  return NOW - new Date(iso).getTime() < 86_400_000;
}

function counts(rows: FulfillmentOrder[]): FulfillmentCounts {
  const by = (s: string) => rows.filter((o) => o.status === s).length;
  return {
    all: rows.length,
    pending: by("pending"),
    processing: by("processing"),
    shipped: by("shipped"),
    shippedToday: rows.filter((o) => o.status === "shipped" && isToday(o.updatedAt)).length,
    delivered: by("delivered"),
    cancelled: by("cancelled"),
    failed: by("failed"),
  };
}

function findOrder(id: string): FulfillmentOrder | undefined {
  return db.fulfillment.find((o) => o.id === id);
}

export const fulfillmentHandlers = [
  http.get("/api/fulfillment", ({ request }) =>
    resolve("fulfillment.list", () => {
      const url = new URL(request.url);
      const status = url.searchParams.get("status") ?? "all";
      const method = url.searchParams.get("method") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const page = Math.max(0, Number.parseInt(url.searchParams.get("page") ?? "0", 10) || 0);

      const base = scoped(propertyId(request));
      const c = counts(base);

      let rows = status === "all" ? base : base.filter((o) => o.status === status);
      if (method !== "all") rows = rows.filter((o) => o.method === method);
      if (q) {
        rows = rows.filter(
          (o) => o.playerName.toLowerCase().includes(q) || o.rewardName.toLowerCase().includes(q),
        );
      }
      const total = rows.length;
      const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      return { rows: pageRows, total, counts: c };
    }),
  ),

  http.get("/api/fulfillment/:id", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: get failed" }, { status: 503 });
    const order = findOrder(String(params.id));
    if (!order) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    return HttpResponse.json(order);
  }),

  http.patch("/api/fulfillment/:id/status", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: status failed" }, { status: 503 });
    const id = String(params.id);
    const { status, trackingNumber } = (await request.json()) as {
      status: FulfillmentOrder["status"];
      trackingNumber?: string;
    };
    const existing = findOrder(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated: FulfillmentOrder = {
      ...existing,
      status,
      trackingNumber: trackingNumber ?? existing.trackingNumber,
      updatedAt: new Date().toISOString(),
    };
    db.fulfillment = db.fulfillment.map((o) => (o.id === id ? updated : o));
    return HttpResponse.json(updated);
  }),

  http.post("/api/fulfillment/bulk", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: bulk failed" }, { status: 503 });
    const { ids, action } = (await request.json()) as { ids: string[]; action: BulkAction };
    const nextStatus =
      action === "mark-processing"
        ? "processing"
        : action === "mark-shipped"
          ? "shipped"
          : "cancelled";
    let updated = 0;
    const now = new Date().toISOString();
    db.fulfillment = db.fulfillment.map((o) => {
      if (ids.includes(o.id)) {
        updated += 1;
        return { ...o, status: nextStatus, updatedAt: now };
      }
      return o;
    });
    return HttpResponse.json({ updated });
  }),
];
