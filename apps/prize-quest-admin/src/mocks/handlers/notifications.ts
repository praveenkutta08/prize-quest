import { http, HttpResponse } from "msw";
import type {
  DeliveryCounts,
  NotificationDelivery,
  NotificationTemplate,
} from "@/features/notifications/model";
import { db } from "../db";
import { resolve, withLatency, maybeFail } from "../latency";

const PAGE_SIZE = 10;

function findTemplate(id: string): NotificationTemplate | undefined {
  return db.notifTemplates.find((t) => t.id === id);
}

function deliveryCounts(rows: NotificationDelivery[]): DeliveryCounts {
  return {
    all: rows.length,
    sent: rows.filter((d) => d.status === "sent").length,
    scheduled: rows.filter((d) => d.status === "scheduled").length,
    failed: rows.filter((d) => d.status === "failed").length,
  };
}

export const notificationHandlers = [
  // Templates
  http.get("/api/notif/templates", () => resolve("notif.templates", () => db.notifTemplates)),

  http.post("/api/notif/templates", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: create failed" }, { status: 503 });
    const body = (await request.json()) as Partial<NotificationTemplate>;
    const created: NotificationTemplate = {
      id: `nt-${Date.now().toString(36)}`,
      name: body.name ?? "Untitled template",
      channel: body.channel ?? "email",
      subject: body.subject,
      body: body.body ?? "",
      status: body.status ?? "draft",
      updatedAt: new Date().toISOString(),
    };
    db.notifTemplates = [created, ...db.notifTemplates];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/notif/templates/:id", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: update failed" }, { status: 503 });
    const id = String(params.id);
    const body = (await request.json()) as Partial<NotificationTemplate>;
    const existing = findTemplate(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = { ...existing, ...body, id, updatedAt: new Date().toISOString() };
    db.notifTemplates = db.notifTemplates.map((t) => (t.id === id ? updated : t));
    return HttpResponse.json(updated);
  }),

  http.patch("/api/notif/templates/:id/status", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: status failed" }, { status: 503 });
    const id = String(params.id);
    const { status } = (await request.json()) as { status: NotificationTemplate["status"] };
    const existing = findTemplate(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = { ...existing, status, updatedAt: new Date().toISOString() };
    db.notifTemplates = db.notifTemplates.map((t) => (t.id === id ? updated : t));
    return HttpResponse.json(updated);
  }),

  // Deliveries
  http.get("/api/notif/deliveries", ({ request }) =>
    resolve("notif.deliveries", () => {
      const url = new URL(request.url);
      const status = url.searchParams.get("status") ?? "all";
      const channel = url.searchParams.get("channel") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const page = Math.max(0, Number.parseInt(url.searchParams.get("page") ?? "0", 10) || 0);

      const base = db.notifDeliveries;
      const c = deliveryCounts(base);
      let rows = status === "all" ? base : base.filter((d) => d.status === status);
      if (channel !== "all") rows = rows.filter((d) => d.channel === channel);
      if (q) rows = rows.filter((d) => d.templateName.toLowerCase().includes(q));
      const total = rows.length;
      const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      return { rows: pageRows, total, counts: c };
    }),
  ),

  // Operator bell feed
  http.get("/api/notifications", () => resolve("notif.feed", () => db.notifications)),

  http.post("/api/notifications/read", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: read failed" }, { status: 503 });
    const { ids, all } = (await request.json()) as { ids?: string[]; all?: boolean };
    db.notifications = db.notifications.map((n) =>
      all || (ids && ids.includes(n.id)) ? { ...n, read: true } : n,
    );
    return HttpResponse.json({ unread: db.notifications.filter((n) => !n.read).length });
  }),
];
