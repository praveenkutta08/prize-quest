import { z } from "zod";
import { FulfillmentMethod, Rarity, RewardCategory, RewardType, type RewardItem } from "./dto";

/**
 * The authoring form's values. Looser than `RewardItem` — no id/status/margin/
 * derived fields — with `z.coerce.number()` on the numeric text inputs so the
 * Zod resolver validates strings from the fields. `toRewardBody` maps these to
 * the API payload; `toRewardFormValues` seeds edit/duplicate mode.
 */
export const RewardFormValues = z.object({
  name: z.string().min(1, "Name your reward"),
  category: RewardCategory,
  description: z.string().max(400, "Keep it under 400 characters").optional(),
  rewardType: RewardType,
  value: z.coerce.number().nonnegative("Must be zero or more"),
  cost: z.coerce.number().nonnegative("Must be zero or more"),
  stockCount: z.coerce.number().int("Whole numbers only").nonnegative("Must be zero or more"),
  lowStockThreshold: z.coerce.number().int().nonnegative().optional(),
  vendorId: z.string().optional(),
  vendorSku: z.string().optional(),
  fulfillmentMethod: FulfillmentMethod,
  rarity: Rarity,
  propertyIds: z.array(z.string()).min(1, "Offer this reward at a property"),
  imageRef: z.string().optional(),
});
export type RewardFormValues = z.infer<typeof RewardFormValues>;

export const DEFAULT_REWARD_FORM: RewardFormValues = {
  name: "",
  category: "electronics",
  description: "",
  rewardType: "physical",
  value: 0,
  cost: 0,
  stockCount: 0,
  lowStockThreshold: 10,
  vendorId: undefined,
  vendorSku: "",
  fulfillmentMethod: "ship",
  rarity: "common",
  propertyIds: [],
  imageRef: "",
};

/** Seed the form from an existing reward (edit or duplicate). */
export function toRewardFormValues(r: RewardItem): RewardFormValues {
  return {
    name: r.name,
    category: r.category,
    description: r.description ?? "",
    rewardType: r.rewardType,
    value: r.value,
    cost: r.cost,
    stockCount: r.stockCount,
    lowStockThreshold: r.lowStockThreshold,
    vendorId: r.vendorId,
    vendorSku: r.vendorSku ?? "",
    fulfillmentMethod: r.fulfillmentMethod,
    rarity: r.rarity,
    propertyIds: r.propertyIds,
    imageRef: r.imageRef ?? "",
  };
}

/** Map form values (possibly partial/mid-edit) to a reward API payload. */
export function toRewardBody(v: RewardFormValues): Partial<RewardItem> {
  return {
    name: v.name || "Untitled reward",
    category: v.category,
    description: v.description || undefined,
    rewardType: v.rewardType,
    value: Number(v.value) || 0,
    cost: Number(v.cost) || 0,
    stockCount: Number(v.stockCount) || 0,
    lowStockThreshold:
      v.lowStockThreshold === undefined ? undefined : Number(v.lowStockThreshold) || 0,
    vendorId: v.vendorId || undefined,
    vendorSku: v.vendorSku || undefined,
    fulfillmentMethod: v.fulfillmentMethod,
    rarity: v.rarity,
    propertyIds: v.propertyIds,
    imageRef: v.imageRef || undefined,
  };
}

/** Derived margin: (value − cost) / value, clamped. */
export function deriveMargin(value: number, cost: number): number {
  if (!value || value <= 0) return 0;
  return Math.max(-1, (value - cost) / value);
}
