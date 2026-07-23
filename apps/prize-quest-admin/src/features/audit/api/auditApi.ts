import { baseApi } from "@/shared/lib/baseApi";
import { AuditListResponse, type AuditEntry } from "../model";

export interface ListAuditArgs {
  actor?: string;
  action?: string;
  target?: string;
  range?: string;
  q?: string;
  cursor?: string;
}

/**
 * Audit data layer — tenant-level, read-only, cursor infinite-scroll (mirrors
 * logsApi). Distinct entity/endpoint from the rules Execution Logs.
 */
export const auditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listAudit: build.query<AuditListResponse, ListAuditArgs>({
      query: ({ actor, action, target, range, q, cursor }) => ({
        url: "/audit",
        params: {
          ...(actor && actor !== "all" ? { actor } : {}),
          ...(action && action !== "all" ? { action } : {}),
          ...(target && target !== "all" ? { target } : {}),
          ...(range && range !== "all" ? { range } : {}),
          ...(q ? { q } : {}),
          ...(cursor ? { cursor } : {}),
        },
      }),
      transformResponse: (raw) => AuditListResponse.parse(raw),
      // Infinite scroll: one cache entry per filter set (cursor dropped), pages merged.
      serializeQueryArgs: ({ queryArgs }) => {
        const { cursor: _cursor, ...rest } = queryArgs;
        return rest;
      },
      merge: (current, incoming) => {
        const seen = new Set(current.rows.map((r: AuditEntry) => r.id));
        current.rows.push(...incoming.rows.filter((r) => !seen.has(r.id)));
        current.nextCursor = incoming.nextCursor;
        current.total = incoming.total;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: ["Audit"],
    }),
  }),
});

export const { useListAuditQuery } = auditApi;
