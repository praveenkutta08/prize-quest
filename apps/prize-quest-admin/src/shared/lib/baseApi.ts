import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

/**
 * Swap-ready data layer. Every hook talks to real REST paths under `/api`; in
 * dev/demo MSW intercepts them. Going live = point `baseUrl` at the backend and
 * stop the worker — no component changes.
 *
 * `prepareHeaders` injects the active property into `X-Property-Id` so the mock
 * (and later, the API) scopes every response. We read the scope slice through a
 * minimal local shape to avoid importing the app-layer RootState (which would
 * create a shared → app cycle).
 */
interface ScopeStateSlice {
  scope: { activePropertyId: string | null };
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState }) => {
    const pid = (getState() as ScopeStateSlice).scope?.activePropertyId;
    if (pid) headers.set("X-Property-Id", pid);
    return headers;
  },
});

// Ride over the mock backend's injected 5% failures.
const baseQueryWithRetry = retry(rawBaseQuery, { maxRetries: 5 });

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Campaign", "Rule", "Log", "Catalog", "Dashboard", "Session", "Tenant"],
  endpoints: () => ({}),
});
