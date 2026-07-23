import { baseApi } from "@/shared/lib/baseApi";
import { LogListResponse, type ExecutionLogEntry } from "../model";

export interface ListLogsArgs {
  propertyId: string;
  severity?: string;
  range?: string;
  ruleId?: string;
  q?: string;
  cursor?: string;
}

/**
 * Execution-logs data layer. `listLogs` accumulates cursor pages into a single
 * cache entry (infinite scroll) via serializeQueryArgs + merge. Live tail is
 * client-driven: `pullLiveLog` synthesizes the next entry on demand and the
 * screen prepends it to a capped buffer.
 */
export const logsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listLogs: build.query<LogListResponse, ListLogsArgs>({
      query: ({ severity, range, ruleId, q, cursor }) => ({
        url: "/logs",
        params: {
          ...(severity && severity !== "all" ? { severity } : {}),
          ...(range ? { range } : {}),
          ...(ruleId && ruleId !== "all" ? { ruleId } : {}),
          ...(q ? { q } : {}),
          ...(cursor ? { cursor } : {}),
        },
      }),
      transformResponse: (raw) => LogListResponse.parse(raw),
      // One cache entry per filter-set; cursor pages merge into it.
      serializeQueryArgs: ({ queryArgs }) => {
        const { cursor: _cursor, ...rest } = queryArgs;
        return rest;
      },
      merge: (current, incoming, { arg }) => {
        if (!arg.cursor || arg.cursor === "0") return incoming;
        current.rows.push(...incoming.rows);
        current.nextCursor = incoming.nextCursor;
        current.total = incoming.total;
        current.counts = incoming.counts;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: ["Log"],
    }),

    pullLiveLog: build.mutation<{ rows: ExecutionLogEntry[] }, void>({
      query: () => ({ url: "/logs/tail", method: "POST" }),
    }),
  }),
});

export const { useListLogsQuery, usePullLiveLogMutation } = logsApi;
