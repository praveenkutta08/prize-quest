/** A trust badge. `icon` is one of the known keys (see ICONS) or falls back to shield. */
export interface TrustBadge {
  icon: "shield" | "truck" | "phone" | "audit" | string;
  title: string;
  sub: string;
}
