/**
 * Layout of `<pq-campaign-list>`:
 * - `stack`    — vertical list of standard campaign rows (mobile/Standard)
 * - `carousel` — horizontal scroll-snap rail of expanded cards (Expanded, opt-in)
 * - `grid`     — responsive multi-up grid of expanded cards (Expanded default; kiosk "All campaigns")
 */
export type CampaignListVariant = "stack" | "carousel" | "grid";
