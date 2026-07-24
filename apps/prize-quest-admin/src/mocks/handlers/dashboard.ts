import { http } from "msw";
import { buildActivity, buildClaimsSeries, buildKpis, buildTopCampaigns } from "../seed/dashboard";
import { resolve } from "../latency";

/** Active property from the scoping header; absent → cross-property roll-up. */
function propertyId(request: Request): string {
  return request.headers.get("X-Property-Id") ?? "all";
}

export const dashboardHandlers = [
  http.get("/api/dashboard/kpis", ({ request }) =>
    resolve("dashboard.kpis", () => buildKpis(propertyId(request))),
  ),
  http.get("/api/dashboard/claims-series", ({ request }) =>
    resolve("dashboard.claims-series", () => buildClaimsSeries(propertyId(request))),
  ),
  http.get("/api/dashboard/activity", ({ request }) =>
    resolve("dashboard.activity", () => buildActivity(propertyId(request))),
  ),
  http.get("/api/dashboard/top-campaigns", ({ request }) =>
    resolve("dashboard.top-campaigns", () => buildTopCampaigns(propertyId(request))),
  ),
];
