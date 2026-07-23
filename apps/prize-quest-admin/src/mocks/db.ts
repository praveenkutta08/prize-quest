import type { Session } from "@/shared/contracts";
import type { CampaignDefinition, PrizeCatalogItem } from "@/features/promotions/model";
import type { ExecutionLogEntry, Rule, TriggerCatalogItem } from "@/features/rules/model";
import type { RewardItem, Vendor } from "@/features/rewards/model";
import type { Player, SegmentInfo } from "@/features/players/model";
import type { ManagedUser, RolePermissions } from "@/features/users/model";
import type { FulfillmentOrder } from "@/features/fulfillment/model";
import type { AuditEntry } from "@/features/audit/model";
import type {
  NotificationDelivery,
  NotificationTemplate,
  OperatorNotification,
} from "@/features/notifications/model";
import type { TriggerDefinition } from "@/features/triggers/model";
import { seedTenants } from "./seed/tenant";
import { seedCampaigns, seedPrizes } from "./seed/promotions";
import { seedLogs, seedRules, TRIGGERS } from "./seed/rules";
import { seedRewards, seedVendors } from "./seed/rewards";
import { seedPlayers, seedSegments } from "./seed/players";
import { seedUsers, seedRolePermissions } from "./seed/users";
import { seedFulfillment } from "./seed/fulfillment";
import { seedAudit } from "./seed/audit";
import { seedDeliveries, seedOperatorNotifications, seedTemplates } from "./seed/notifications";
import { seedTriggerDefinitions } from "./seed/triggers";

/**
 * In-memory, session-persistent mock store. Mutable so create/edit/pause
 * mutations stick until reload. The auth session and tenant context live here;
 * dashboard data is derived from seed builders. Promotions add mutable
 * `campaigns` + `prizes` arrays (seeded from fresh clones) so the session's
 * CRUD is real.
 */
export const db = {
  // Mutable clone so Settings saves (brand/theme/modules/compliance/vendor +
  // the property registry) persist for the session without touching the seed.
  tenants: seedTenants(),
  session: null as Session | null,
  campaigns: seedCampaigns() as CampaignDefinition[],
  prizes: seedPrizes() as PrizeCatalogItem[],
  rules: seedRules() as Rule[],
  triggers: TRIGGERS as TriggerCatalogItem[],
  logs: seedLogs() as ExecutionLogEntry[],
  rewards: seedRewards() as RewardItem[],
  vendors: seedVendors() as Vendor[],
  players: seedPlayers() as Player[],
  segments: seedSegments() as SegmentInfo[],
  users: seedUsers() as ManagedUser[],
  rolePermissions: seedRolePermissions() as RolePermissions[],
  fulfillment: seedFulfillment() as FulfillmentOrder[],
  audit: seedAudit() as AuditEntry[],
  notifTemplates: seedTemplates() as NotificationTemplate[],
  notifDeliveries: seedDeliveries() as NotificationDelivery[],
  notifications: seedOperatorNotifications() as OperatorNotification[],
  triggerDefs: seedTriggerDefinitions() as TriggerDefinition[],
  /** Monotonic counter for the deterministic live-tail generator. */
  liveCounter: 0,
};

export type MockDb = typeof db;
