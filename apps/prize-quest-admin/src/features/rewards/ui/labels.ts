import type { StatusTone } from "@/shared/ui";
import type {
  FulfillmentMethod,
  Rarity,
  RewardCategory,
  RewardStatus,
  RewardType,
  VendorType,
} from "../model";

export const CATEGORY_LABEL: Record<RewardCategory, string> = {
  electronics: "Electronics",
  "gift-card": "Gift card",
  experience: "Experience",
  "free-play": "Free play",
  comp: "Comp",
  merchandise: "Merchandise",
  points: "Points",
};

export const TYPE_LABEL: Record<RewardType, string> = {
  physical: "Physical",
  digital: "Digital",
  "free-play": "Free play",
  comp: "Comp",
  points: "Points",
};

export const FULFILLMENT_LABEL: Record<FulfillmentMethod, string> = {
  ship: "Ship to player",
  pickup: "In-property pickup",
  auto: "Automatic",
  manual: "Manual",
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export const STATUS_LABEL: Record<RewardStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
  "out-of-stock": "Out of stock",
};

export const VENDOR_TYPE_LABEL: Record<VendorType, string> = {
  konami: "Konami",
  igt: "IGT",
  aristocrat: "Aristocrat",
  lw: "Light & Wonder",
  "third-party": "Third party",
};

/** Reward status → StatusPill tone. */
export function statusTone(status: RewardStatus): StatusTone {
  switch (status) {
    case "active":
      return "active";
    case "draft":
      return "draft";
    case "out-of-stock":
      return "paused";
    case "archived":
      return "ended";
    default:
      return "draft";
  }
}

/** A reward is low on stock when its count has fallen to/under the threshold. */
export function isLowStock(stockCount: number, threshold?: number): boolean {
  return threshold !== undefined && stockCount <= threshold;
}
