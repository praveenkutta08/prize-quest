/** Layout of `<pq-campaign-detail>`: single column, two-column (hero + vault),
 *  or the dense `compact` casino layout (hero strip + 2×2 / 3-across prize grid). */
export type DetailProfile = "standard" | "expanded" | "compact";

/** Detail payload of the `pq-claim-start` event. */
export interface ClaimStartDetail {
  campaignId: string;
  prizeId: string;
}
