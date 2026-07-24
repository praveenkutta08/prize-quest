/**
 * Telemetry stub. Real analytics wiring is out of scope (UI-only, mock data).
 * Call sites use this so instrumentation can be swapped in later without churn.
 */
export function track(event: string, props?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.debug(`[track] ${event}`, props ?? {});
  }
}
