import {
  createApi,
  fetchBaseQuery,
  retry,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

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

// Ride over the mock backend's injected failures (503s) and genuine network
// blips — but never retry client errors. A 401 on /auth/session is the normal
// "not signed in" signal, and retrying it would hang the resume splash for
// seconds and flood the console before we finally redirect to /login. So we
// only retry transient failures: network/parse errors (non-numeric status) and
// 5xx. Any 4xx fails fast so the caller can react immediately.
const baseQueryWithRetry = retry(rawBaseQuery, {
  retryCondition: (error, _args, { attempt }) => {
    const status = (error as FetchBaseQueryError).status;
    return attempt <= 5 && (typeof status !== "number" || status >= 500);
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Campaign", "Rule", "Log", "Catalog", "Dashboard", "Session", "Tenant"],
  endpoints: () => ({}),
});
