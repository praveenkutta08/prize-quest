import { z } from "zod";

/**
 * Rewards Catalog domain contracts (app-local, Zod-first). One schema is the
 * single source of truth: it types the RTK Query endpoints, validates MSW
 * payloads at the boundary, and drives the React Hook Form resolver.
 *
 * `RewardItem` is a deliberate *superset* of Session 2's `PrizeCatalogItem` —
 * the overlapping field names (`id/name/category/value/inStock/vendorSku/rarity/
 * imageRef`) stay compatible so Promotions' `PrizePicker` can later source from
 * `/api/rewards` with no shape change. Do not extend/depend on `@pq/contracts`.
 */

export const RewardType = z.enum(["physical", "digital", "free-play", "comp", "points"]);
export type RewardType = z.infer<typeof RewardType>;

export const RewardCategory = z.enum([
  "electronics",
  "gift-card",
  "experience",
  "free-play",
  "comp",
  "merchandise",
  "points",
]);
export type RewardCategory = z.infer<typeof RewardCategory>;

export const RewardStatus = z.enum(["active", "draft", "archived", "out-of-stock"]);
export type RewardStatus = z.infer<typeof RewardStatus>;

export const FulfillmentMethod = z.enum(["ship", "pickup", "auto", "manual"]);
export type FulfillmentMethod = z.infer<typeof FulfillmentMethod>;

export const Rarity = z.enum(["common", "rare", "epic", "legendary"]);
export type Rarity = z.infer<typeof Rarity>;

export const VendorType = z.enum(["konami", "igt", "aristocrat", "lw", "third-party"]);
export type VendorType = z.infer<typeof VendorType>;

export const Vendor = z.object({
  id: z.string(),
  name: z.string(),
  type: VendorType,
});
export type Vendor = z.infer<typeof Vendor>;

export const RewardCategoryInfo = z.object({
  key: RewardCategory,
  label: z.string(),
  count: z.number(),
});
export type RewardCategoryInfo = z.infer<typeof RewardCategoryInfo>;

export const CatalogSyncResult = z.object({
  added: z.number(),
  updated: z.number(),
  skipped: z.number(),
  at: z.string(),
});
export type CatalogSyncResult = z.infer<typeof CatalogSyncResult>;

// ── The reward definition ─────────────────────────────────────────────────────

export const RewardItem = z.object({
  id: z.string(),
  name: z.string().min(1, "Name your reward"),
  description: z.string().optional(),
  category: RewardCategory,
  rewardType: RewardType,
  value: z.number().nonnegative(), // USD retail
  cost: z.number().nonnegative(), // operator cost
  marginPct: z.number(), // derived: (value - cost) / value
  stockCount: z.number().int(),
  inStock: z.boolean(),
  lowStockThreshold: z.number().int().optional(),
  vendorId: z.string().optional(),
  vendorSku: z.string().optional(),
  fulfillmentMethod: FulfillmentMethod,
  rarity: Rarity,
  status: RewardStatus,
  imageRef: z.string().optional(),
  redemptionCount: z.number().int(),
  propertyIds: z.array(z.string()),
  updatedAt: z.string(),
});
export type RewardItem = z.infer<typeof RewardItem>;

/** A campaign that references this reward (derived from the promotions seed). */
export const RewardUsageRef = z.object({
  campaignId: z.string(),
  name: z.string(),
});
export type RewardUsageRef = z.infer<typeof RewardUsageRef>;

/** Detail response — the reward plus the campaigns using it. */
export const RewardDetail = RewardItem.extend({
  usage: z.array(RewardUsageRef),
});
export type RewardDetail = z.infer<typeof RewardDetail>;

// ── List response: page rows + total + per-tab counts + aggregate stats ───────

export const RewardStatusCounts = z.object({
  all: z.number(),
  active: z.number(),
  draft: z.number(),
  "out-of-stock": z.number(),
});
export type RewardStatusCounts = z.infer<typeof RewardStatusCounts>;

export const RewardListStats = z.object({
  totalItems: z.number(),
  activeItems: z.number(),
  lowStock: z.number(),
  redemptionsThisMonth: z.number(),
});
export type RewardListStats = z.infer<typeof RewardListStats>;

export const RewardListResponse = z.object({
  rows: z.array(RewardItem),
  total: z.number(),
  counts: RewardStatusCounts,
  stats: RewardListStats,
});
export type RewardListResponse = z.infer<typeof RewardListResponse>;

export const VendorList = z.array(Vendor);
export const RewardCategoryList = z.array(RewardCategoryInfo);

/** Status transition payload for PATCH /rewards/:id/status. */
export const RewardStatusPatch = z.object({ status: RewardStatus });
export type RewardStatusPatch = z.infer<typeof RewardStatusPatch>;
