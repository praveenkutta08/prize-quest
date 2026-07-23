import { z } from "zod";

/**
 * Shared, cross-feature enums. App-local (Zod-first) — these mirror the
 * player-side domain vocabulary for parity but do not depend on `@pq/contracts`.
 */

/** Player loyalty tiers, low → high. */
export const Tier = z.enum(["Silver", "Gold", "Platinum", "Diamond"]);
export type Tier = z.infer<typeof Tier>;

/** Campaign lifecycle status. Drives StatusPill semantics. */
export const CampaignStatus = z.enum(["active", "scheduled", "draft", "paused", "ended"]);
export type CampaignStatus = z.infer<typeof CampaignStatus>;

/** Automation rule status. */
export const RuleStatus = z.enum(["active", "paused", "draft"]);
export type RuleStatus = z.infer<typeof RuleStatus>;

/** Gaming jurisdiction (compliance context). */
export const Jurisdiction = z.enum(["NV", "NJ", "MI", "PA", "tribal"]);
export type Jurisdiction = z.infer<typeof Jurisdiction>;

/** Trend direction for KPI deltas. */
export const Trend = z.enum(["up", "down", "neutral"]);
export type Trend = z.infer<typeof Trend>;
