// @pq/store — actions. The only place atoms are mutated; widgets stay read-only.
import * as api from "@pq/mock-data";
import type { Address, Voucher } from "@pq/mock-data";
import type { AddressData } from "@pq/contracts";
import {
  $activeCampaign,
  $address,
  $campaigns,
  $claimFlowStep,
  $claims,
  $errors,
  $notifications,
  $pendingClaim,
  $player,
  $prizes,
  $selectedPrize,
  $shippingAddress,
  $vouchers,
} from "./atoms";

/** Retry past the mock backend's 5% simulated failures so loads are deterministic. */
async function withRetry<T>(fn: () => Promise<T>, attempts = 8): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function recordError(key: string, error: unknown): void {
  const next = error instanceof Error ? error : new Error(String(error));
  $errors.set({ ...$errors.get(), [key]: next });
}

function clearError(key: string): void {
  if ($errors.get()[key]) $errors.set({ ...$errors.get(), [key]: null });
}

/** Load the player profile (loyalty balance, tier) into `$player`. */
export function loadPlayer(): void {
  $player.set(api.player);
}

export async function loadCampaigns(tenantId: string): Promise<void> {
  try {
    $campaigns.set(await withRetry(() => api.getCampaigns(tenantId)));
    clearError("campaigns");
  } catch (error) {
    recordError("campaigns", error);
  }
}

export async function loadPrizes(campaignId: string): Promise<void> {
  try {
    $prizes.set(await withRetry(() => api.getPrizes(campaignId)));
    clearError("prizes");
  } catch (error) {
    recordError("prizes", error);
  }
}

/** Set the active campaign (from the loaded list, else fetched) and load its prizes. */
export async function selectCampaign(id: string): Promise<void> {
  let campaign = $campaigns.get()?.find((c) => c.id === id) ?? null;
  if (!campaign) {
    try {
      campaign = await withRetry(() => api.getCampaign(id));
    } catch (error) {
      recordError("activeCampaign", error);
    }
  }
  $activeCampaign.set(campaign);
  await loadPrizes(id);
}

export function selectPrize(prizeId: string): void {
  $selectedPrize.set(($prizes.get() ?? []).find((p) => p.id === prizeId) ?? null);
}

/** Open a pending claim from the active campaign + selected prize. */
export function startClaim(): void {
  const campaign = $activeCampaign.get();
  const prize = $selectedPrize.get();
  if (!campaign || !prize) return;
  $pendingClaim.set({ campaignId: campaign.id, prizeId: prize.id });
}

export function submitPin(pin: string): void {
  const pending = $pendingClaim.get();
  if (pending) $pendingClaim.set({ ...pending, pin });
}

export function submitAddress(address: Address): void {
  const pending = $pendingClaim.get();
  if (pending) $pendingClaim.set({ ...pending, address });
}

// --- Editable shipping address (Session 30 · pq-address-form ⇄ pq-claim-summary) ---

/** Persist the address the player entered/edited on the form (read by the confirm screen). */
export function setShippingAddress(address: AddressData): void {
  $shippingAddress.set(address);
}

/** The address the player entered, or null if they haven't reached/submitted the form. */
export function getShippingAddress(): AddressData | null {
  return $shippingAddress.get();
}

/** Clear the entered address — called on flow start + completion so a new claim
 *  re-prefills from CMS rather than carrying the previous claim's edits. */
export function resetShippingAddress(): void {
  $shippingAddress.set(null);
}

/** Load the player's shipping address for the address step (also seeds the pending claim). */
export async function loadAddress(): Promise<void> {
  try {
    const address = await withRetry(() => api.getAddress());
    $address.set(address);
    const pending = $pendingClaim.get();
    if (pending && !pending.address) $pendingClaim.set({ ...pending, address });
    clearError("address");
  } catch (error) {
    recordError("address", error);
  }
}

/**
 * Post-PIN orchestration for the TTD flow: validate PIN → retrieve address, driving
 * `$claimFlowStep` so the loading screen's stepper advances, then resolves so the host
 * can route to the final confirm. Each step carries a short dwell so the spinner shows.
 */
export async function runPostPinFlow(): Promise<void> {
  $claimFlowStep.set("pin");
  // PIN was already recorded by submitPin(); the validation call is mocked as a dwell.
  await new Promise((resolve) => setTimeout(resolve, 500));
  $claimFlowStep.set("address");
  await loadAddress();
  await new Promise((resolve) => setTimeout(resolve, 300));
  $claimFlowStep.set("done");
}

/** Build a digital voucher from a just-claimed prize (no real backend voucher exists). */
function synthesizeVoucher(order: { id: string }): void {
  const prize = $selectedPrize.get();
  if (!prize || prize.prizeType !== "digital") return;
  const issued = new Date();
  const expires = new Date(issued.getTime() + 180 * 24 * 60 * 60 * 1000);
  const voucher: Voucher = {
    id: `voucher-${order.id}`,
    code: `PQ-${issued.getTime().toString(36).toUpperCase().slice(-4)}-${prize.id.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase()}`,
    prizeId: prize.id,
    amount: prize.value,
    brand: $activeCampaign.get()?.name ?? "Prize Quest",
    name: prize.name,
    issuedAt: issued.toISOString().slice(0, 10),
    expiresAt: expires.toISOString().slice(0, 10),
    redeemed: false,
  };
  $vouchers.set([voucher, ...($vouchers.get() ?? [])]);
}

/**
 * Finalize the pending claim. On success prepends the new order to `$claims`,
 * clears the pending claim, and returns the claim id (null on failure / no claim).
 */
export async function finalizeClaim(): Promise<string | null> {
  const pending = $pendingClaim.get();
  if (!pending) return null;
  try {
    const order = await withRetry(() =>
      api.submitClaim({ campaignId: pending.campaignId, prizeId: pending.prizeId }),
    );
    $claims.set([order, ...($claims.get() ?? [])]);
    synthesizeVoucher(order);
    $pendingClaim.set(null);
    clearError("finalizeClaim");
    return order.id;
  } catch (error) {
    recordError("finalizeClaim", error);
    return null;
  }
}

export async function loadOrders(tenantId: string): Promise<void> {
  try {
    $claims.set(await withRetry(() => api.getOrders(tenantId)));
    clearError("claims");
  } catch (error) {
    recordError("claims", error);
  }
}

export async function loadNotifications(_tenantId?: string): Promise<void> {
  try {
    $notifications.set(await withRetry(() => api.getNotifications()));
    clearError("notifications");
  } catch (error) {
    recordError("notifications", error);
  }
}

export function markAllNotificationsRead(): void {
  const list = $notifications.get();
  if (list) $notifications.set(list.map((n) => ({ ...n, read: true })));
}

export function markNotificationRead(id: string): void {
  const list = $notifications.get();
  if (list) $notifications.set(list.map((n) => (n.id === id ? { ...n, read: true } : n)));
}
