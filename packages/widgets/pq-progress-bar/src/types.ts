/**
 * Visual/behavioral variant of `<pq-progress-bar>`.
 * - `default`  — static fill in `--pq-cream-muted`
 * - `complete` — fill in `--pq-cream`, one-time grow animation on mount
 * - `loading`  — indeterminate shimmer (`aria-busy`)
 */
export type ProgressBarVariant = "default" | "complete" | "loading";

/**
 * Channel/form-factor profile pushed by `pq-screen`.
 * - `compact`  — TTD / tight surfaces (identical to the standard thin track)
 * - `standard` — Luminara / default thin 2px track
 * - `expanded` — kiosk bar: header row (label + value) above an 18px pill track
 */
export type ProgressBarProfile = "compact" | "standard" | "expanded";
