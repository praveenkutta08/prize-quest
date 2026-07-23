import { z } from "zod";
import { CampaignStatus } from "@/shared/contracts";

/**
 * Promotions domain contracts (app-local, Zod-first). One schema is the single
 * source of truth: it types the RTK Query endpoints, validates MSW payloads at
 * the boundary, and drives the React Hook Form resolver. Mirrors plan §7.2.
 *
 * These are the *definition-view* entities the operator authors — distinct from
 * the player-side progress objects. Do not reuse or depend on `@pq/contracts`.
 */

export const CampaignType = z.enum(["goal-based", "milestone", "repeating-multi-tier"]);
export type CampaignType = z.infer<typeof CampaignType>;

/** Reuse the canonical status enum (draft · scheduled · active · paused · ended). */
export { CampaignStatus };

// ── Eligibility (a flat AND/OR condition group; see condition-catalog.ts) ──────

export const Conjunction = z.enum(["AND", "OR"]);
export type Conjunction = z.infer<typeof Conjunction>;

export const ConditionOperator = z.enum(["in", "not-in", "eq", "gte", "lte", "between"]);
export type ConditionOperator = z.infer<typeof ConditionOperator>;

/**
 * A single value editor emits one of: a keyword/string, a number, a list of
 * enum values, or a numeric [min, max] tuple. Kept as a permissive union so the
 * builder can drive any field type without a per-field schema.
 */
export const ConditionValue = z.union([
  z.string(),
  z.number(),
  z.array(z.string()),
  z.array(z.number()),
]);
export type ConditionValue = z.infer<typeof ConditionValue>;

export const Condition = z.object({
  field: z.string().min(1, "Pick a field"),
  operator: ConditionOperator,
  value: ConditionValue,
});
export type Condition = z.infer<typeof Condition>;

export const ConditionGroup = z.object({
  conjunction: Conjunction,
  conditions: z.array(Condition),
});
export type ConditionGroup = z.infer<typeof ConditionGroup>;

// ── Earn rules · schedule · compliance · metrics ──────────────────────────────

export const EarnActivity = z.enum(["slot-wager", "table-avg-bet", "fnb-spend", "hotel-night"]);
export type EarnActivity = z.infer<typeof EarnActivity>;

export const CountsToward = z.enum(["coin-in", "theoretical-win", "actual-win"]);
export type CountsToward = z.infer<typeof CountsToward>;

export const EarnRule = z.object({
  activity: EarnActivity,
  threshold: z.number().nonnegative(),
  currency: z.literal("USD"),
  countsToward: CountsToward,
  timeWindow: z.string().optional(),
});
export type EarnRule = z.infer<typeof EarnRule>;

export const Recurrence = z.enum(["one-shot", "weekly-reset", "daily-reset"]);
export type Recurrence = z.infer<typeof Recurrence>;

export const Schedule = z.object({
  start: z.string(),
  end: z.string(),
  recurrence: Recurrence,
});
export type Schedule = z.infer<typeof Schedule>;

export const Compliance = z.object({
  budgetCap: z.number().nonnegative(),
  budgetUsed: z.number().nonnegative(),
  approverId: z.string().optional(),
  filingRef: z.string().optional(),
  jurisdiction: z.string(),
});
export type Compliance = z.infer<typeof Compliance>;

export const Funnel = z.object({
  eligible: z.number(),
  started: z.number(),
  completed: z.number(),
  claimed: z.number(),
});
export type Funnel = z.infer<typeof Funnel>;

export const CampaignMetrics = z.object({
  reach: z.number(),
  offers: z.number(),
  engagementRate: z.number(),
  funnel: Funnel,
});
export type CampaignMetrics = z.infer<typeof CampaignMetrics>;

// ── The campaign definition ───────────────────────────────────────────────────

export const CampaignDefinition = z.object({
  id: z.string(),
  name: z.string().min(1, "Name your campaign"),
  type: CampaignType,
  status: CampaignStatus,
  description: z.string().optional(),
  ownerId: z.string(),
  audienceLabel: z.string(),
  schedule: Schedule,
  eligibility: ConditionGroup,
  earnRule: EarnRule,
  prizeIds: z.array(z.string()),
  propertyIds: z.array(z.string()),
  compliance: Compliance,
  metrics: CampaignMetrics,
});
export type CampaignDefinition = z.infer<typeof CampaignDefinition>;

/** List response: page rows + total + per-tab counts (for the status tabs). */
export const CampaignStatusCounts = z.object({
  all: z.number(),
  active: z.number(),
  scheduled: z.number(),
  draft: z.number(),
  ended: z.number(),
});
export type CampaignStatusCounts = z.infer<typeof CampaignStatusCounts>;

/** Aggregate stat tiles for the list header — computed over the property set. */
export const CampaignListStats = z.object({
  activeCampaigns: z.number(),
  totalReach: z.number(),
  avgEngagement: z.number(),
  revenueImpact: z.number(),
});
export type CampaignListStats = z.infer<typeof CampaignListStats>;

export const CampaignListResponse = z.object({
  rows: z.array(CampaignDefinition),
  total: z.number(),
  counts: CampaignStatusCounts,
  stats: CampaignListStats,
});
export type CampaignListResponse = z.infer<typeof CampaignListResponse>;

// ── Prize catalog ─────────────────────────────────────────────────────────────

export const PrizeType = z.enum(["physical", "digital"]);
export type PrizeType = z.infer<typeof PrizeType>;

export const PrizeCatalogItem = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  value: z.number(),
  prizeType: PrizeType,
  inStock: z.boolean(),
  vendorSku: z.string().optional(),
  rarity: z.string().optional(),
  imageRef: z.string().optional(),
});
export type PrizeCatalogItem = z.infer<typeof PrizeCatalogItem>;
export const PrizeCatalogList = z.array(PrizeCatalogItem);

// ── Reach preview (the "test against snapshot" runner) ────────────────────────

export const PreviewReachRequest = z.object({
  eligibility: ConditionGroup,
  earnRule: EarnRule.optional(),
});
export type PreviewReachRequest = z.infer<typeof PreviewReachRequest>;

export const PreviewReachResponse = z.object({
  matchedPlayers: z.number(),
  ofEligible: z.number(),
});
export type PreviewReachResponse = z.infer<typeof PreviewReachResponse>;

/** Status transition payload for PATCH /campaigns/:id/status. */
export const CampaignStatusPatch = z.object({ status: CampaignStatus });
export type CampaignStatusPatch = z.infer<typeof CampaignStatusPatch>;
