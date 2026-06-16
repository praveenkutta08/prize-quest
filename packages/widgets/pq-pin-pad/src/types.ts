/** Allowed PIN lengths (driven by tenant vendor config). */
export type PinLength = 4 | 5 | 6;

/** Detail payload of `pq-pin-change` / `pq-pin-complete`. */
export interface PinDetail {
  value: string;
}
