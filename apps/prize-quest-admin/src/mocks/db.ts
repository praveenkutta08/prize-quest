import type { Session } from "@/shared/contracts";
import type { CampaignDefinition, PrizeCatalogItem } from "@/features/promotions/model";
import { TENANTS } from "./seed/tenant";
import { seedCampaigns, seedPrizes } from "./seed/promotions";

/**
 * In-memory, session-persistent mock store. Mutable so create/edit/pause
 * mutations stick until reload. The auth session and tenant context live here;
 * dashboard data is derived from seed builders. Promotions add mutable
 * `campaigns` + `prizes` arrays (seeded from fresh clones) so the session's
 * CRUD is real.
 */
export const db = {
  tenants: TENANTS,
  session: null as Session | null,
  campaigns: seedCampaigns() as CampaignDefinition[],
  prizes: seedPrizes() as PrizeCatalogItem[],
};

export type MockDb = typeof db;
