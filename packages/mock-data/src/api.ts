import { campaigns, tenantCampaignNames } from "./campaigns";
import { prizes } from "./prizes";
import { address, vouchers } from "./fulfillment";
import { notifications, ordersForTenant } from "./activity";
import {
  arcadeCampaigns,
  arcadeOrders,
  arcadePrizes,
  isArcadeTenant,
} from "./arcade";
import type { Address, Campaign, Notification, Order, Prize, Voucher } from "./types";

/** Resolve a campaign by id from either the default or the arcade catalog. */
function findCampaign(id: string): Campaign | undefined {
  return arcadeCampaigns.find((c) => c.id === id) ?? campaigns.find((c) => c.id === id);
}

/** Resolve a prize by id from either the default or the arcade catalog. */
function findPrize(id: string): Prize | undefined {
  return arcadePrizes.find((p) => p.id === id) ?? prizes.find((p) => p.id === id);
}

/** Realistic network latency: 50–400ms. */
function delay(): Promise<void> {
  const ms = 50 + Math.floor(Math.random() * 350);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 5% chance of a simulated network failure. */
function maybeFail(label: string): void {
  if (Math.random() < 0.05) {
    throw new Error(`mock-data: simulated network error (${label})`);
  }
}

/** Apply per-tenant name overrides without mutating the source data. */
function forTenant(tenantId: string): Campaign[] {
  const overrides = tenantCampaignNames[tenantId];
  return campaigns.map((c) =>
    overrides && overrides[c.id] ? { ...c, name: overrides[c.id] } : { ...c },
  );
}

/** All campaigns for a tenant. The arcade-demo kiosk tenant gets its own set. */
export async function getCampaigns(tenantId: string): Promise<Campaign[]> {
  await delay();
  maybeFail(`getCampaigns(${tenantId})`);
  if (isArcadeTenant(tenantId)) return arcadeCampaigns.map((c) => ({ ...c }));
  return forTenant(tenantId);
}

/** A single campaign by id (default + arcade catalogs). Rejects if not found. */
export async function getCampaign(id: string): Promise<Campaign> {
  await delay();
  maybeFail(`getCampaign(${id})`);
  const campaign = findCampaign(id);
  if (!campaign) {
    throw new Error(`mock-data: campaign "${id}" not found`);
  }
  return { ...campaign };
}

/** Prizes claimable from a campaign. Rejects if the campaign is unknown. */
export async function getPrizes(campaignId: string): Promise<Prize[]> {
  await delay();
  maybeFail(`getPrizes(${campaignId})`);
  const campaign = findCampaign(campaignId);
  if (!campaign) {
    throw new Error(`mock-data: campaign "${campaignId}" not found`);
  }
  return campaign.prizeIds
    .map((pid) => findPrize(pid))
    .filter((p): p is Prize => Boolean(p))
    .map((p) => ({ ...p }));
}

/** The player's verified shipping address. */
export async function getAddress(): Promise<Address> {
  await delay();
  maybeFail("getAddress");
  return { ...address };
}

/** A voucher for a claimed digital prize. Rejects if unknown. */
export async function getVoucher(claimId: string): Promise<Voucher> {
  await delay();
  maybeFail(`getVoucher(${claimId})`);
  const voucher = vouchers[claimId];
  if (!voucher) {
    throw new Error(`mock-data: voucher for claim "${claimId}" not found`);
  }
  return { ...voucher };
}

/** The player's order/claim history (tenant-aware; arcade-demo has its own set). */
export async function getOrders(tenantId: string): Promise<Order[]> {
  await delay();
  maybeFail(`getOrders(${tenantId})`);
  if (isArcadeTenant(tenantId)) {
    // Strip the arcade-only display extras (imageSeed/category) down to Order.
    return arcadeOrders.map(({ imageSeed: _s, category: _c, ...order }) => ({ ...order }));
  }
  return ordersForTenant(tenantId);
}

/** The player's notifications. */
export async function getNotifications(): Promise<Notification[]> {
  await delay();
  maybeFail("getNotifications");
  return notifications.map((n) => ({ ...n }));
}

/**
 * Submit a prize claim. On success returns the newly-created order row
 * (status `processing`) the caller prepends to the player's history.
 */
export async function submitClaim(input: {
  campaignId: string;
  prizeId: string;
}): Promise<Order> {
  await delay();
  maybeFail(`submitClaim(${input.prizeId})`);
  const prize = findPrize(input.prizeId);
  const campaign = findCampaign(input.campaignId);
  const stamp = new Date();
  return {
    id: `claim-${input.prizeId}-${stamp.getTime()}`,
    prizeName: prize?.name ?? "Prize",
    campaignName: campaign?.name ?? "Campaign",
    status: "processing",
    claimedAt: stamp.toISOString().slice(0, 10),
    confirmation: `PQ-${stamp.getTime().toString(36).toUpperCase().slice(-6)}`,
    value: prize?.value,
  };
}
