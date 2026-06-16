/**
 * Interaction state of `<pq-prize-tile>`:
 * - `selectable` — choosable (hover lift, gold border; `selected` shows the check)
 * - `locked`     — gated behind progress (blurred, lock chip, not clickable)
 * - `oos`        — out of stock (dimmed, not clickable)
 *
 * `oos` is also inferred automatically when `prize.inStock === false`.
 */
export type PrizeTileState = "selectable" | "locked" | "oos";

/** Detail payload of the `pq-prize-select` event. */
export interface PrizeSelectDetail {
  id: string;
}
