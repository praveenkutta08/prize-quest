// @pq/mock-data — domain types.
// Field names kept simple/semantic, derived from the sample data in
// prize-quest-html5.html (screen 01 campaign list, prize grid, order history).

/** Where a campaign sits in the patron flow. */
export type CampaignStatus =
  | "eligible"
  | "in-progress"
  | "expired"
  | "claimed"
  | "locked";

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  /** Current accrued amount (USD wagered, points, etc.). */
  progress: number;
  /** Goal the player is working toward. */
  goal: number;
  /** Convenience 0–100 percentage (progress / goal). */
  pct: number;
  /** Short mono meta line, e.g. "$725 / $1,000 · 26 days left". */
  meta: string;
  /** ISO date the campaign expires, when applicable. */
  expiresAt?: string;
  /** Prizes available to claim from this campaign. */
  prizeIds: string[];
  /**
   * Total prize-pool value (USD) shown on the arcade hero card, distinct from the
   * wager `goal`. When omitted the hero card falls back to `goal`.
   */
  prizePool?: number;
  /** Cadence label for the expanded/arcade card chip, e.g. "Weekly". */
  frequency?: "Weekly" | "Monthly" | "Seasonal" | (string & {});
  /** Longer marketing blurb shown on the expanded/arcade card. */
  description?: string;
  /** Category key (maps to an arcade per-category accent via the tenant). */
  category?: string;
}

/** Reward rarity tier — drives the arcade reward-card border/glow/label. */
export type PrizeRarity = "common" | "rare" | "epic" | "legendary";

export interface Prize {
  id: string;
  name: string;
  category: string;
  /** Retail value in USD. */
  value: number;
  inStock: boolean;
  /** Delivery kind — drives success (ship) vs voucher (instant) at claim end. */
  prizeType?: "physical" | "digital";
  /** Optional explicit rarity; when omitted, derive from `value` via `deriveRarity`. */
  rarity?: PrizeRarity;
}

/** Map a retail value to a rarity tier (fallback when a prize has no explicit rarity). */
export function deriveRarity(value: number): PrizeRarity {
  if (value < 250) return "common";
  if (value < 600) return "rare";
  if (value < 1500) return "epic";
  return "legendary";
}

export interface Player {
  id: string;
  name: string;
  tier: string;
  nextTier: string;
  /** Points remaining until `nextTier`. */
  pointsToNextTier: number;
  /** Current loyalty points balance (shown in the TTD header chrome). */
  points: number;
}

/** Fulfillment status of a claimed prize. */
export type ClaimStatus = "processing" | "shipped" | "in-transit" | "delivered";

export interface Claim {
  id: string;
  prizeId: string;
  campaignId: string;
  status: ClaimStatus;
  /** ISO date the claim was submitted. */
  claimedAt: string;
}

/** Denormalized order/claim row for order-history display. */
export interface Order {
  id: string;
  prizeName: string;
  campaignName: string;
  status: ClaimStatus;
  /** Display date, e.g. "Jun 1, 2026". */
  claimedAt: string;
  confirmation?: string;
  tracking?: string;
  carrier?: string;
  value?: number;
  /** Category key (drives the order-history "Favorite" stat + per-category tint). */
  category?: string;
}

/** A notification-tray item. */
export type NotificationType = "campaign" | "time" | "shipping" | "alert";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Relative time label, e.g. "2m", "1h". */
  time: string;
  read: boolean;
  ctaLabel?: string;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
}

export interface Voucher {
  id: string;
  /** Redemption code shown to the player. */
  code: string;
  prizeId: string;
  /** Face value for gift-card style vouchers. */
  amount?: number;
  /** Issuing brand / outlet, e.g. "Casino Royale · Dining credit". */
  brand?: string;
  /** Human label, e.g. "Sunday Slot Sprint reward". */
  name?: string;
  issuedAt: string;
  /** ISO expiry date. */
  expiresAt?: string;
  redeemed: boolean;
  /** When redeemed (display string). */
  redeemedAt?: string;
}
