import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";

export interface TableUrlState {
  status: string;
  q: string;
  page: number;
  sorting: SortingState;
  /** The single active sort as `field`/`-field`, or "" — pass to the API. */
  sortParam: string;
  setStatus: (status: string) => void;
  setQ: (q: string) => void;
  setPage: (pageIndex: number) => void;
  /** TanStack-compatible sorting change handler (resets page). */
  onSortingChange: OnChangeFn<SortingState>;
}

/**
 * Holds list-view state (status tab · search · sort · page) in the URL query
 * string so views are shareable and refresh-safe (plan §9). Changing the
 * filter/sort resets to page 1. Generic — the promotions list and the Session 3
 * rules/logs lists share it. `replace` avoids polluting history on every keypress.
 */
export function useTableUrlState(defaultStatus = "all"): TableUrlState {
  const [params, setParams] = useSearchParams();

  const status = params.get("status") ?? defaultStatus;
  const q = params.get("q") ?? "";
  const page = Math.max(0, Number.parseInt(params.get("page") ?? "0", 10) || 0);
  const sortParam = params.get("sort") ?? "";

  const sorting = useMemo<SortingState>(
    () => (sortParam ? [{ id: sortParam.replace(/^-/, ""), desc: sortParam.startsWith("-") }] : []),
    [sortParam],
  );

  const patch = useCallback(
    (next: Record<string, string | number | undefined>, resetPage: boolean) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(next)) {
            if (value === undefined || value === "") p.delete(key);
            else p.set(key, String(value));
          }
          if (resetPage) p.delete("page");
          return p;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setStatus = useCallback(
    (next: string) => patch({ status: next === defaultStatus ? undefined : next }, true),
    [patch, defaultStatus],
  );

  const setQ = useCallback((next: string) => patch({ q: next }, true), [patch]);

  const setPage = useCallback(
    (pageIndex: number) => patch({ page: pageIndex <= 0 ? undefined : pageIndex }, false),
    [patch],
  );

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const nextState = typeof updater === "function" ? updater(sorting) : updater;
      const first = nextState[0];
      patch({ sort: first ? `${first.desc ? "-" : ""}${first.id}` : undefined }, true);
    },
    [patch, sorting],
  );

  return { status, q, page, sorting, sortParam, setStatus, setQ, setPage, onSortingChange };
}
