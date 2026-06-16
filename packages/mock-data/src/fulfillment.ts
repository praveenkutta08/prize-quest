import type { Address, Voucher } from "./types";

/** Mock verified shipping address (screen 06). */
export const address: Address = {
  name: "John Smith",
  line1: "123 Casino Boulevard",
  line2: "Apt 4B",
  city: "Las Vegas",
  state: "NV",
  zip: "89101",
  phone: "(702) 555-0123",
  email: "john.smith@email.com",
};

/** Mock voucher (digital prize) keyed by claim id. */
const vouchers: Record<string, Voucher> = {
  "claim-1": {
    id: "voucher-1",
    code: "PQ-9F4A-E2C9-X742",
    prizeId: "dining-credit-100",
    amount: 100,
    brand: "Casino Royale · Dining credit",
    name: "Sunday Slot Sprint reward",
    issuedAt: "2026-06-04",
    expiresAt: "2026-12-31",
    redeemed: false,
  },
};

export { vouchers };
