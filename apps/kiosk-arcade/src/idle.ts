// Inactivity timeout — bounce back to the attract screen after a period of no input
// on any non-attract screen (suppressed while already on /attract). The duration is
// resolved per-tick via `getMs()` so it can vary by channel (EGM = 30s, others = 60s).
import { navigate, getCurrentRoute } from "@pq/router";

export function wireInactivityTimeout(getMs: () => number): void {
  // idle timer handle; null when not scheduled
  let timer: number | null = null;

  const reset = (): void => {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      const path = getCurrentRoute().path;
      if (path !== "/attract" && path !== "/") {
        navigate(`/attract${location.search}`);
      } else {
        reset();
      }
    }, getMs());
  };

  (["pointerdown", "keydown", "touchstart"] as const).forEach((evt) =>
    window.addEventListener(evt, reset, { passive: true }),
  );
  reset();
}
