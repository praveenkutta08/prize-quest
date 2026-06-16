/** Layout of `<pq-order-history>`: stacked rows (Standard), a table (Expanded), or a
 *  dense 2-column grid of order cards (Compact / TTD). */
export type OrderHistoryProfile = "standard" | "expanded" | "compact";

/** Detail payload of the `pq-order-click` event. */
export interface OrderClickDetail {
  id: string;
}
