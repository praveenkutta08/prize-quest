import { HttpResponse } from "msw";

/**
 * Mock backend "house style", mirroring `@pq/mock-data`:
 *   • realistic latency 50–400ms
 *   • an opt-in 5% failure injector (behind VITE_MOCK_FAILURES), so error/retry
 *     states are exercisable on demand and in tests but off for clean demos.
 * RTK Query's `retry` rides over the injected failures.
 */

/** Realistic network latency: 50–400ms. */
export function withLatency(): Promise<void> {
  const ms = 50 + Math.floor(Math.random() * 350);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function failuresEnabled(): boolean {
  return import.meta.env.VITE_MOCK_FAILURES === "1";
}

/**
 * Simulated failure, only when the injector is explicitly enabled
 * (VITE_MOCK_FAILURES=1 / `pnpm --filter @pq/admin dev:mock-fail`). Default OFF
 * for clean demos.
 *
 * The rate is intentionally high (per-attempt): baseApi wraps requests in
 * retry({ maxRetries: 5 }), so a realistic ~5% would almost always be ridden
 * over and the designed error/retry UI would never appear. A high per-attempt
 * rate lets some requests exhaust their retries so the ErrorState is actually
 * reachable — which is the point of this mode.
 */
export function maybeFail(): boolean {
  return failuresEnabled() && Math.random() < 0.7;
}

/**
 * Resolve a handler: apply latency, maybe inject a failure, else return JSON.
 * `build` runs only on the success path so seed reads stay lazy.
 */
export async function resolve<T>(label: string, build: () => T): Promise<Response> {
  await withLatency();
  if (maybeFail()) {
    return HttpResponse.json(
      { error: `mock: simulated network error (${label})` },
      { status: 503, statusText: "Mock Failure" },
    );
  }
  return HttpResponse.json(build() as object);
}
