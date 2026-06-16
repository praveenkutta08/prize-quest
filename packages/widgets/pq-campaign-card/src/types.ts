/**
 * Layout profile for `<pq-campaign-card>` (maps to the form-factor matrix):
 * - `compact`  — glanceable single line (name + %), e.g. TTD strips
 * - `standard` — single-column row with embedded progress bar
 * - `expanded` — full card with icon, status pill, progress, meta
 */
export type CardProfile = "compact" | "standard" | "expanded";

/** Detail payload of the `pq-card-click` event. */
export interface CardClickDetail {
  id: string;
}
