/**
 * Status conveyed by `<pq-status-pill>`. Each maps to a token color and a
 * default mono label (see DEFAULT_LABELS / styles).
 */
export type StatusPillVariant =
  | "eligible"
  | "in-progress"
  | "expired"
  | "claimed"
  | "shipped"
  | "delivered"
  | "locked"
  | "danger";
