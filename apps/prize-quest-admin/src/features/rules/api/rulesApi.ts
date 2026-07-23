import { baseApi } from "@/shared/lib/baseApi";
import {
  Rule,
  RuleListResponse,
  TestRuleResponse,
  TriggerCatalogList,
  type RuleStatus,
  type TestRuleRequest,
  type TriggerCatalogItem,
} from "../model";

export interface ListRulesArgs {
  /** In the cache key so a property switch refetches (header scopes the data). */
  propertyId: string;
  status?: string;
  q?: string;
  sort?: string;
  page?: number;
}

/** Rules Engine data layer, injected into the shared baseApi. */
export const rulesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listRules: build.query<RuleListResponse, ListRulesArgs>({
      query: ({ status, q, sort, page }) => ({
        url: "/rules",
        params: {
          ...(status && status !== "all" ? { status } : {}),
          ...(q ? { q } : {}),
          ...(sort ? { sort } : {}),
          ...(page ? { page } : {}),
        },
      }),
      transformResponse: (raw) => RuleListResponse.parse(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((r) => ({ type: "Rule" as const, id: r.id })),
              { type: "Rule" as const, id: "LIST" },
            ]
          : [{ type: "Rule" as const, id: "LIST" }],
    }),

    getRule: build.query<Rule, string>({
      query: (id) => `/rules/${id}`,
      transformResponse: (raw) => Rule.parse(raw),
      providesTags: (_r, _e, id) => [{ type: "Rule", id }],
    }),

    listTriggers: build.query<TriggerCatalogItem[], void>({
      query: () => "/triggers",
      transformResponse: (raw) => TriggerCatalogList.parse(raw),
      // Shares the catalog tag so Session 9 trigger CRUD invalidates the EventSelector feed.
      providesTags: [{ type: "Trigger", id: "CATALOG" }],
    }),

    createRule: build.mutation<Rule, Partial<Rule>>({
      query: (body) => ({ url: "/rules", method: "POST", body }),
      transformResponse: (raw) => Rule.parse(raw),
      invalidatesTags: [{ type: "Rule", id: "LIST" }],
    }),

    updateRule: build.mutation<Rule, { id: string; body: Partial<Rule> }>({
      query: ({ id, body }) => ({ url: `/rules/${id}`, method: "PUT", body }),
      transformResponse: (raw) => Rule.parse(raw),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Rule", id },
        { type: "Rule", id: "LIST" },
      ],
    }),

    setRuleStatus: build.mutation<Rule, { id: string; status: RuleStatus }>({
      query: ({ id, status }) => ({
        url: `/rules/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (raw) => Rule.parse(raw),
      // Optimistic toggle across every cached rules list, rolled back on failure.
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled, getState }) {
        const patches = rulesApi.util.selectInvalidatedBy(getState(), [
          { type: "Rule", id: "LIST" },
        ]);
        const undos = patches.map(({ endpointName, originalArgs }) =>
          endpointName === "listRules"
            ? dispatch(
                rulesApi.util.updateQueryData("listRules", originalArgs, (draft) => {
                  const row = draft.rows.find((r) => r.id === id);
                  if (row) row.status = status;
                }),
              )
            : null,
        );
        try {
          await queryFulfilled;
        } catch {
          undos.forEach((u) => u?.undo());
        }
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Rule", id },
        { type: "Rule", id: "LIST" },
      ],
    }),

    testRule: build.mutation<TestRuleResponse, TestRuleRequest>({
      query: (body) => ({ url: "/rules/test", method: "POST", body }),
      transformResponse: (raw) => TestRuleResponse.parse(raw),
    }),

    // Campaign options for the auto-enroll action. Reads the shared REST path (no
    // promotions-feature import); scoped by the X-Property-Id header.
    listCampaignOptions: build.query<Array<{ value: string; label: string }>, string>({
      query: () => ({ url: "/campaigns", params: { page: 0 } }),
      transformResponse: (raw: { rows?: Array<{ id: string; name: string }> }) =>
        (raw?.rows ?? []).map((r) => ({ value: r.id, label: r.name })),
      providesTags: [{ type: "Campaign", id: "LIST" }],
    }),

    // All rule names (unpaginated) for the execution-logs rule filter.
    listRuleOptions: build.query<Array<{ value: string; label: string }>, string>({
      query: () => ({ url: "/rules", params: { all: 1 } }),
      transformResponse: (raw: { rows?: Array<{ id: string; name: string }> }) =>
        (raw?.rows ?? []).map((r) => ({ value: r.id, label: r.name })),
      providesTags: [{ type: "Rule", id: "LIST" }],
    }),
  }),
});

export const {
  useListRulesQuery,
  useGetRuleQuery,
  useListTriggersQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useSetRuleStatusMutation,
  useTestRuleMutation,
  useListCampaignOptionsQuery,
  useListRuleOptionsQuery,
} = rulesApi;
