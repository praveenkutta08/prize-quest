// @pq/contracts — shipping address shape for the editable-address claim flow
// (Session 30). Distinct from @pq/mock-data's `Address` (which carries a display
// `name` + `zip`): this is the user-editable form payload, keyed by `postalCode`,
// written to `$shippingAddress` by <pq-address-form> and read by <pq-claim-summary>.

export interface AddressData {
  /** Recipient name. Optional: only the expanded (kiosk) form exposes a name field;
   *  compact/standard fall back to the player's name on the confirm screen. */
  name?: string;
  line1: string;
  /** Apartment / suite / unit — optional. */
  line2?: string;
  city: string;
  /** 2-letter US state code. */
  state: string;
  /** ZIP (5-digit or 5+4). */
  postalCode: string;
  phone?: string;
  email?: string;
}
