// @pq/store — nanostores atoms. The single source of truth widgets subscribe to.
//
// Collections and selections default to `null` ("not loaded yet") rather than an
// empty value. This lets widgets fall back to their explicitly-set props in
// Storybook / tests (where no action ever runs, so the atom stays `null`) while
// still letting an *explicit* empty value from the store win in the app
// (e.g. `$campaigns.set([])` → list shows its empty state).
import { atom } from "nanostores";
import type { AddressData } from "@pq/contracts";
import type {
  Address,
  Campaign,
  Notification,
  Order,
  Player,
  Prize,
  Voucher,
} from "@pq/mock-data";

/** The authenticated patron session (vendor token + tenant context). */
export interface Session {
  playerId: string;
  tenantId: string;
  tier: string;
  vendorToken: string;
}

/** A claim in progress through the PIN → address → confirm flow. */
export interface PendingClaim {
  campaignId: string;
  prizeId: string;
  pin?: string;
  address?: Address;
}

export const $session = atom<Session | null>(null);
export const $player = atom<Player | null>(null);

export const $campaigns = atom<Campaign[] | null>(null);
export const $activeCampaign = atom<Campaign | null>(null);
export const $prizes = atom<Prize[] | null>(null);
export const $selectedPrize = atom<Prize | null>(null);

export const $pendingClaim = atom<PendingClaim | null>(null);

/** Post-PIN orchestration step (drives the TTD loading screen's stepper). */
export type ClaimFlowStep = "pin" | "address" | "done";
export const $claimFlowStep = atom<ClaimFlowStep | null>(null);

export const $claims = atom<Order[] | null>(null);
export const $vouchers = atom<Voucher[] | null>(null);

/** The player's shipping address (loaded for the address step of the claim flow). */
export const $address = atom<Address | null>(null);

/** The shipping address the player entered/edited on <pq-address-form> (Session 30).
 *  Written on form submit, read by <pq-claim-summary>; reset on flow start/completion
 *  so a fresh claim always re-prefills from CMS rather than the previous claim's edits. */
export const $shippingAddress = atom<AddressData | null>(null);

export const $notifications = atom<Notification[] | null>(null);

export const $isOnline = atom<boolean>(true);
export const $errors = atom<Record<string, Error | null>>({});
