import { http, HttpResponse } from "msw";
import type {
  Jurisdiction,
  Module,
  Property,
  TenantBrand,
  TenantTheme,
  TenantVendor,
} from "@/shared/contracts";
import { db } from "../db";
import { withLatency, maybeFail } from "../latency";

const TENANT_ID = "casino-royale";

/** The single mutable tenant context Settings edits (source of truth for the shell). */
function ctx() {
  return db.tenants[TENANT_ID];
}

function fail(label: string) {
  return HttpResponse.json({ error: `mock: ${label} failed` }, { status: 503 });
}

export const settingsHandlers = [
  // Brand
  http.put("/api/tenant/brand", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return fail("brand");
    const { brand } = (await request.json()) as { brand: TenantBrand };
    ctx().tenant.brand = { ...ctx().tenant.brand, ...brand };
    return HttpResponse.json(ctx());
  }),

  // Theme
  http.put("/api/tenant/theme", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return fail("theme");
    const { theme } = (await request.json()) as { theme: TenantTheme };
    ctx().theme = {
      tokenOverrides: theme.tokenOverrides ?? {},
      fonts: theme.fonts,
    };
    return HttpResponse.json(ctx());
  }),

  // Modules
  http.put("/api/tenant/modules", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return fail("modules");
    const { modules } = (await request.json()) as { modules: Module[] };
    ctx().modules = modules;
    // Keep the licensed feature flags roughly in step with module enablement.
    return HttpResponse.json(ctx());
  }),

  // Compliance
  http.put("/api/tenant/compliance", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return fail("compliance");
    const { compliance } = (await request.json()) as {
      compliance: {
        jurisdiction: Jurisdiction;
        jurisdictionLabel: string;
        budgetCapEnforced: boolean;
      };
    };
    ctx().tenant.compliance = { ...ctx().tenant.compliance, ...compliance };
    return HttpResponse.json(ctx());
  }),

  // Vendor
  http.put("/api/tenant/vendor", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return fail("vendor");
    const { vendor } = (await request.json()) as { vendor: TenantVendor };
    ctx().tenant.vendor = { ...ctx().tenant.vendor, ...vendor };
    return HttpResponse.json(ctx());
  }),

  // ── Property registry (the one property-entity admin panel) ──────────────────
  http.get("/api/properties", async () => {
    await withLatency();
    if (maybeFail()) return fail("properties");
    return HttpResponse.json(ctx().properties);
  }),

  http.post("/api/properties", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return fail("create property");
    const { property } = (await request.json()) as { property: Omit<Property, "id"> };
    const created: Property = {
      ...property,
      id: `cr-${property.code.toLowerCase()}-${Date.now().toString(36).slice(-4)}`,
    };
    ctx().properties = [...ctx().properties, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/properties/:id", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return fail("update property");
    const id = String(params.id);
    const { property } = (await request.json()) as { property: Property };
    const existing = ctx().properties.find((p) => p.id === id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = { ...existing, ...property, id };
    ctx().properties = ctx().properties.map((p) => (p.id === id ? updated : p));
    return HttpResponse.json(updated);
  }),

  http.delete("/api/properties/:id", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return fail("delete property");
    const id = String(params.id);
    ctx().properties = ctx().properties.filter((p) => p.id !== id);
    return HttpResponse.json({ id });
  }),
];
