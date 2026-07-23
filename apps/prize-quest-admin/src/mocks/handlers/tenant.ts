import { http, HttpResponse } from "msw";
import { db } from "../db";
import { withLatency } from "../latency";

export const tenantHandlers = [
  // Tenant context: brand + theme + properties + modules + roles. Resolved at boot.
  http.get("/api/tenant/context", async ({ request }) => {
    await withLatency();
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenant") ?? "casino-royale";
    const context = db.tenants[tenantId] ?? db.tenants["casino-royale"];
    if (!context) {
      return HttpResponse.json({ error: `Unknown tenant "${tenantId}"` }, { status: 404 });
    }
    return HttpResponse.json(context);
  }),
];
