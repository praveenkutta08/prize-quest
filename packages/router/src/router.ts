// @pq/router — a tiny History-API router. No framework, no dependencies.
//
// Navigation pushes onto the History stack and emits a single window event,
// `pq-route-change`. Both programmatic navigation and the browser Back/Forward
// buttons (popstate) drive the same subscriber callbacks, so screens reload with
// no full-page navigation.

export const ROUTE_CHANGE_EVENT = "pq-route-change";

/** The current location, decomposed for consumers. */
export interface RouteState {
  /** Pathname, e.g. `/campaign/abc`. */
  path: string;
  /** Parsed query-string params. */
  params: Record<string, string>;
}

export type RouteChangeListener = (route: RouteState) => void;

/** Snapshot the current route from `window.location`. */
export function getCurrentRoute(): RouteState {
  const params: Record<string, string> = {};
  new URLSearchParams(location.search).forEach((value, key) => {
    params[key] = value;
  });
  return { path: location.pathname, params };
}

function emitRouteChange(): void {
  window.dispatchEvent(
    new CustomEvent<RouteState>(ROUTE_CHANGE_EVENT, { detail: getCurrentRoute() }),
  );
}

/**
 * Navigate to `path` via `history.pushState` and notify subscribers. No-ops (no
 * duplicate history entry) when already at `path`, but still re-emits so callers
 * can refresh.
 */
export function navigate(path: string): void {
  if (path !== location.pathname + location.search) {
    history.pushState({}, "", path);
  }
  emitRouteChange();
}

/**
 * Subscribe to route changes (programmatic navigation + browser Back/Forward).
 * Returns an unsubscribe function.
 */
export function onRouteChange(cb: RouteChangeListener): () => void {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<RouteState>).detail;
    cb(detail ?? getCurrentRoute());
  };
  window.addEventListener(ROUTE_CHANGE_EVENT, handler);
  return () => window.removeEventListener(ROUTE_CHANGE_EVENT, handler);
}

/**
 * Does `path` match `pattern`? Segments prefixed with `:` are wildcards,
 * e.g. `matchPattern("/campaign/:id", "/campaign/xyz") === true`.
 */
export function matchPattern(pattern: string, path: string): boolean {
  const p = pattern.split("/").filter(Boolean);
  const a = path.split("/").filter(Boolean);
  if (p.length !== a.length) return false;
  return p.every((seg, i) => seg.startsWith(":") || seg === a[i]);
}

// The browser Back/Forward buttons fire popstate — re-broadcast as a route change
// so subscribers don't need to listen to popstate separately.
window.addEventListener("popstate", emitRouteChange);
